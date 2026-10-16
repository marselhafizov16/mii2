using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudyPlanner.Api.Data;
using StudyPlanner.Api.Dtos;
using StudyPlanner.Api.Models;

namespace StudyPlanner.Api.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<TaskResponse>>> GetAll(
        [FromQuery] StudyTaskStatus? status,
        [FromQuery] TaskPriority? priority,
        [FromQuery] string? subject,
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var query = db.Tasks.AsNoTracking().AsQueryable();

        if (status is not null)
        {
            query = query.Where(task => task.Status == status);
        }

        if (priority is not null)
        {
            query = query.Where(task => task.Priority == priority);
        }

        if (!string.IsNullOrWhiteSpace(subject))
        {
            query = query.Where(task => task.Subject == subject);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{EscapeLike(search.Trim())}%";
            query = query.Where(task =>
                EF.Functions.ILike(task.Title, term, "\\")
                || EF.Functions.ILike(task.Subject, term, "\\")
                || EF.Functions.ILike(task.Description, term, "\\"));
        }

        var items = await query
            .OrderBy(task => task.DueDate)
            .ToListAsync(cancellationToken);

        return items.Select(ToResponse).ToList();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var task = await db.Tasks.AsNoTracking().FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        return task is null ? NotFound(new { message = "Задача не найдена" }) : ToResponse(task);
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponse>> Create(UpsertTaskRequest request, CancellationToken cancellationToken)
    {
        if (request.DueDate == default)
        {
            return DueDateRequired();
        }

        var task = new StudyTask
        {
            Id = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
        };
        Apply(task, request);
        db.Tasks.Add(task);
        await db.SaveChangesAsync(cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, ToResponse(task));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskResponse>> Update(Guid id, UpsertTaskRequest request, CancellationToken cancellationToken)
    {
        if (request.DueDate == default)
        {
            return DueDateRequired();
        }

        var task = await db.Tasks.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (task is null)
        {
            return NotFound(new { message = "Задача не найдена" });
        }

        Apply(task, request);
        await db.SaveChangesAsync(cancellationToken);
        return ToResponse(task);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<TaskResponse>> UpdateStatus(Guid id, UpdateStatusRequest request, CancellationToken cancellationToken)
    {
        var task = await db.Tasks.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (task is null)
        {
            return NotFound(new { message = "Задача не найдена" });
        }

        task.Status = request.Status!.Value;
        await db.SaveChangesAsync(cancellationToken);
        return ToResponse(task);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var task = await db.Tasks.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (task is null)
        {
            return NotFound(new { message = "Задача не найдена" });
        }

        db.Tasks.Remove(task);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static void Apply(StudyTask task, UpsertTaskRequest request)
    {
        task.Title = request.Title.Trim();
        task.Description = request.Description.Trim();
        task.Subject = request.Subject.Trim();
        task.Priority = request.Priority!.Value;
        task.Status = request.Status!.Value;
        task.DueDate = request.DueDate;
    }

    private BadRequestObjectResult DueDateRequired()
    {
        return BadRequest(new
        {
            message = "Проверьте поля формы",
            errors = new { dueDate = new[] { "Укажите срок" } },
        });
    }

    private static string EscapeLike(string value)
    {
        return value.Replace("\\", "\\\\", StringComparison.Ordinal)
            .Replace("%", "\\%", StringComparison.Ordinal)
            .Replace("_", "\\_", StringComparison.Ordinal);
    }

    private static TaskResponse ToResponse(StudyTask task)
    {
        return new TaskResponse(
            task.Id,
            task.Title,
            task.Description,
            task.Subject,
            task.Priority,
            task.Status,
            task.DueDate,
            task.CreatedAt);
    }
}
