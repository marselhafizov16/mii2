using Microsoft.EntityFrameworkCore;
using StudyPlanner.Api.Models;

namespace StudyPlanner.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<StudyTask> Tasks => Set<StudyTask>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var task = modelBuilder.Entity<StudyTask>();
        task.ToTable("study_tasks");
        task.HasKey(item => item.Id);
        task.Property(item => item.Title).HasMaxLength(120).IsRequired();
        task.Property(item => item.Description).HasMaxLength(2000);
        task.Property(item => item.Subject).HasMaxLength(80).IsRequired();
        task.Property(item => item.Priority).HasConversion<string>().HasMaxLength(16);
        task.Property(item => item.Status).HasConversion<string>().HasMaxLength(16);
        task.HasIndex(item => item.DueDate);
        task.HasIndex(item => item.Status);
    }
}
