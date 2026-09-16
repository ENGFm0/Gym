using FitCore.Domain.Common;
using FitCore.Domain.ValueObjects;

namespace FitCore.Domain.Entities;

/// <summary>The member's own data. Age is never stored — it is derived from the birth date.</summary>
public sealed class UserProfile
{
    public string Uid { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }

    public Gender Gender { get; set; } = Gender.Male;
    public DateOnly? BirthDate { get; set; }
    public double HeightCm { get; set; }
    public double WeightKg { get; set; }
    public double? TargetWeightKg { get; set; }

    public ActivityLevel Activity { get; set; } = ActivityLevel.Light;
    public Goal Goal { get; set; } = Goal.FatLoss;

    /// <summary>Kilograms per week the member is aiming to move, 0.1 to 1.0.</summary>
    public double PaceKgPerWeek { get; set; } = 0.5;

    public string DietId { get; set; } = "balanced";
    public UnitPreference Units { get; set; } = new();

    /// <summary>Default rest between sets, in seconds.</summary>
    public int RestSeconds { get; set; } = 90;

    public bool IsCoach { get; set; }

    /// <summary>Set by a coach the member accepted; null when they train on their own.</summary>
    public CoachAssignment? Assignment { get; set; }

    public ReminderSettings Reminders { get; set; } = new();
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public int? AgeOn(DateOnly today)
    {
        if (BirthDate is null) return null;
        var age = today.Year - BirthDate.Value.Year;
        if (BirthDate.Value > today.AddYears(-age)) age--;
        return age < 0 ? null : age;
    }

    public bool HasBodyData => HeightCm > 0 && WeightKg > 0;
}
