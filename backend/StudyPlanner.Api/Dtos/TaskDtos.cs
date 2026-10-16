using System.ComponentModel.DataAnnotations;
using StudyPlanner.Api.Models;

namespace StudyPlanner.Api.Dtos;

public class UpsertTaskRequest
{
    [Required(ErrorMessage = "Укажите название")]
    [MinLength(3, ErrorMessage = "Название должно быть не короче 3 символов")]
    [MaxLength(120, ErrorMessage = "Название не длиннее 120 символов")]
    public string Title { get; set; } = "";

    [MaxLength(2000, ErrorMessage = "Описание не длиннее 2000 символов")]
    public string Description { get; set; } = "";

    [Required(ErrorMessage = "Укажите предмет")]
    [MinLength(2, ErrorMessage = "Укажите предмет")]
    [MaxLength(80, ErrorMessage = "Название предмета не длиннее 80 символов")]
    public string Subject { get; set; } = "";

    [Required(ErrorMessage = "Укажите приоритет")]
    public TaskPriority? Priority { get; set; }

    [Required(ErrorMessage = "Укажите статус")]
    public StudyTaskStatus? Status { get; set; }

    public DateOnly DueDate { get; set; }
}

public class UpdateStatusRequest
{
    [Required(ErrorMessage = "Укажите статус")]
    public StudyTaskStatus? Status { get; set; }
}

public record TaskResponse(
    Guid Id,
    string Title,
    string Description,
    string Subject,
    TaskPriority Priority,
    StudyTaskStatus Status,
    DateOnly DueDate,
    DateTime CreatedAt);
