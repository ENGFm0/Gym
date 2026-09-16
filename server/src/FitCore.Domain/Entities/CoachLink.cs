namespace FitCore.Domain.Entities;

public enum TraineeStatus { Invited, Active, Paused }

/// <summary>A coach to member link. The member always owns their own data; the coach reads it through this.</summary>
public sealed class CoachLink
{
    public string Id { get; set; } = Guid.NewGuid().ToString("n");
    public string CoachUid { get; set; } = string.Empty;
    public string TraineeUid { get; set; } = string.Empty;
    public string TraineeName { get; set; } = string.Empty;
    public TraineeStatus Status { get; set; } = TraineeStatus.Invited;
    public DateTime StartedAtUtc { get; set; } = DateTime.UtcNow;
    public string? AssignedDietId { get; set; }
    public string? Notes { get; set; }
}
