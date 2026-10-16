using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using StudyPlanner.Api.Data;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Не задана строка подключения ConnectionStrings:DefaultConnection.");

builder.Services.AddDbContext<AppDbContext>(options => options.UseNpgsql(connectionString));

builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = new Dictionary<string, string[]>();
            foreach (var entry in context.ModelState)
            {
                if (entry.Value is null || entry.Value.Errors.Count == 0)
                {
                    continue;
                }

                errors[NormalizeKey(entry.Key)] = entry.Value.Errors
                    .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage)
                        ? "Некорректное значение"
                        : error.ErrorMessage)
                    .ToArray();
            }

            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(new
            {
                message = "Проверьте поля формы",
                errors,
            });
        };
    });

var app = builder.Build();

app.UseCors("frontend");
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        var databaseUnavailable = exception is NpgsqlException
            || exception?.InnerException is NpgsqlException;

        context.Response.StatusCode = databaseUnavailable
            ? StatusCodes.Status503ServiceUnavailable
            : StatusCodes.Status500InternalServerError;

        await context.Response.WriteAsJsonAsync(new
        {
            message = databaseUnavailable
                ? "База данных недоступна. Проверьте, что PostgreSQL запущен и в настройках API указан верный пароль."
                : "Внутренняя ошибка сервера.",
        });
    });
});

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));
app.MapControllers();

try
{
    await using var scope = app.Services.CreateAsyncScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbInitializer.InitializeAsync(connectionString, db);
    app.Logger.LogInformation("База study_planner готова.");
}
catch (Exception exception)
{
    app.Logger.LogError(
        exception,
        "Не удалось подключиться к PostgreSQL. Замените пароль в appsettings.json и перезапустите API.");
}

app.Run();

static string NormalizeKey(string key)
{
    var name = key.StartsWith("$.", StringComparison.Ordinal) ? key[2..] : key;
    var dot = name.LastIndexOf('.');
    if (dot >= 0)
    {
        name = name[(dot + 1)..];
    }

    if (name.Length == 0)
    {
        return name;
    }

    return char.ToLowerInvariant(name[0]) + name[1..];
}
