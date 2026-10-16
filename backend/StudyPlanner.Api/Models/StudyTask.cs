namespace StudyPlanner.Api.Models;

public class StudyTask
{
    public Guid Id { get; set; }

    public string Title { get; set; } = "";

    public string Description { get; set; } = "";

    public string Subject { get; set; } = "";

    public TaskPriority Priority { get; set; }

    public StudyTaskStatus Status { get; set; }

    public DateOnly DueDate { get; set; }

    public DateTime CreatedAt { get; set; }
}
