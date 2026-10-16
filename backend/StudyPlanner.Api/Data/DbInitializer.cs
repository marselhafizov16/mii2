using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using StudyPlanner.Api.Models;

namespace StudyPlanner.Api.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(string connectionString, AppDbContext db)
    {
        if (!await CanOpenAsync(connectionString))
        {
            await EnsureDatabaseExistsAsync(connectionString);
        }

        await EnsureStudyTasksTableAsync(db);

        if (await db.Tasks.AnyAsync())
        {
            return;
        }

        db.Tasks.AddRange(CreateSeed());
        await db.SaveChangesAsync();
    }

    private static async Task<bool> CanOpenAsync(string connectionString)
    {
        try
        {
            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();
            return true;
        }
        catch (PostgresException exception) when (exception.SqlState == "3D000")
        {
            return false;
        }
    }

    private static async Task EnsureDatabaseExistsAsync(string connectionString)
    {
        var builder = new NpgsqlConnectionStringBuilder(connectionString);
        var database = builder.Database;
        if (string.IsNullOrWhiteSpace(database))
        {
            throw new InvalidOperationException("В строке подключения не указана база данных.");
        }

        if (!Regex.IsMatch(database, "^[A-Za-z_][A-Za-z0-9_]*$"))
        {
            throw new InvalidOperationException("Имя базы данных содержит недопустимые символы.");
        }

        builder.Database = "postgres";
        await using var connection = new NpgsqlConnection(builder.ConnectionString);
        await connection.OpenAsync();

        await using var check = new NpgsqlCommand("SELECT 1 FROM pg_database WHERE datname = @name", connection);
        check.Parameters.AddWithValue("name", database);
        var exists = await check.ExecuteScalarAsync();
        if (exists is not null)
        {
            return;
        }

        await using var create = new NpgsqlCommand($"CREATE DATABASE \"{database}\"", connection);
        await create.ExecuteNonQueryAsync();
    }

    private static async Task EnsureStudyTasksTableAsync(AppDbContext db)
    {
        await db.Database.OpenConnectionAsync();
        try
        {
            var connection = db.Database.GetDbConnection();
            await using var check = connection.CreateCommand();
            check.CommandText = """
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'study_tasks'
                )
                """;
            var exists = (bool)(await check.ExecuteScalarAsync() ?? false);
            if (exists)
            {
                return;
            }

            await using var create = connection.CreateCommand();
            create.CommandText = db.Database.GenerateCreateScript();
            await create.ExecuteNonQueryAsync();
        }
        finally
        {
            await db.Database.CloseConnectionAsync();
        }
    }

    private static IEnumerable<StudyTask> CreateSeed()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var created = DateTime.UtcNow.AddDays(-3);

        return
        [
            Task("Сдать отчёт по сравнению AI-инструментов", "Собрать таблицу Cloud- и IDE-агентов и обосновать выбор.", "Машинное обучение", TaskPriority.High, StudyTaskStatus.InProgress, today.AddDays(-1), created),
            Task("Лабораторная: запросы SELECT", "Три запроса с JOIN и группировкой по учебной базе.", "Базы данных", TaskPriority.Medium, StudyTaskStatus.Todo, today.AddDays(3), created.AddHours(2)),
            Task("Макет списка задач", "Сверстать карточку задачи и пустое состояние.", "Веб-разработка", TaskPriority.Low, StudyTaskStatus.Done, today.AddDays(-2), created.AddHours(5)),
            Task("Конспект: нормальные формы", "1НФ–3НФ на примере таблицы оценок.", "Базы данных", TaskPriority.Medium, StudyTaskStatus.Todo, today.AddDays(7), created.AddDays(1)),
            Task("Рефакторинг контроллера задач", "Вынести проверку срока и сообщения об ошибках.", "Веб-разработка", TaskPriority.High, StudyTaskStatus.InProgress, today, created.AddDays(1).AddHours(3)),
            Task("Разобрать обход графа", "BFS и DFS, сложность, пример на бумаге.", "Алгоритмы", TaskPriority.High, StudyTaskStatus.Todo, today.AddDays(1), created.AddDays(2)),
        ];
    }

    private static StudyTask Task(
        string title,
        string description,
        string subject,
        TaskPriority priority,
        StudyTaskStatus status,
        DateOnly dueDate,
        DateTime createdAt)
    {
        return new StudyTask
        {
            Id = Guid.NewGuid(),
            Title = title,
            Description = description,
            Subject = subject,
            Priority = priority,
            Status = status,
            DueDate = dueDate,
            CreatedAt = createdAt,
        };
    }
}
