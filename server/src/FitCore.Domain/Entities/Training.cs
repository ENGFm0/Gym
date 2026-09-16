using FitCore.Domain.Common;

namespace FitCore.Domain.Entities;

/// <summary>An activity the member tracks, with how many times a week they mean to do it.</summary>
public sealed class UserActivity
{
    public string Id { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string Icon { get; set; } = "exercise";
    public double Met { get; set; } = 5;
    public ActivityUnit Unit { get; set; } = ActivityUnit.Minutes;
    public int TimesPerWeek { get; set; } = 3;
    /// <summary>True when the member defined it themselves rather than picking it from the library.</summary>
    public bool IsCustom { get; set; }
}

public sealed class ProgramExercise
{
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public int Sets { get; set; } = 4;
    public int Reps { get; set; } = 10;
}

public sealed class ProgramDay
{
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public List<ProgramExercise> Exercises { get; set; } = new();
}

/// <summary>
/// The weekly plan: which weekdays are training days (<see cref="TrainingDays"/>, Saturday = 0)
/// and the split assigned to each of them, in order.
/// </summary>
public sealed class TrainingProgram
{
    public List<int> TrainingDays { get; set; } = new();
    public List<ProgramDay> Days { get; set; } = new();
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public int DaysPerWeek => TrainingDays.Count;

    /// <summary>The split index for a weekday, or null when that day is a rest day.</summary>
    public int? SlotFor(int weekday)
    {
        var index = TrainingDays.IndexOf(weekday);
        return index < 0 ? null : index;
    }
}

public sealed class SetLog
{
    public double? WeightKg { get; set; }
    public int Reps { get; set; }
    public bool Done { get; set; }
}

/// <summary>A finished session — iron or otherwise. Calories are computed server side.</summary>
public sealed class WorkoutSession
{
    public string Id { get; set; } = Guid.NewGuid().ToString("n");
    public string ActivityId { get; set; } = "gym";
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public DateTime PerformedAtUtc { get; set; } = DateTime.UtcNow;
    public int Minutes { get; set; }
    public double? DistanceKm { get; set; }
    public double VolumeKg { get; set; }
    public int CompletedSets { get; set; }
    public int Calories { get; set; }
    public List<SessionExercise> Exercises { get; set; } = new();
}

public sealed class SessionExercise
{
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public List<SetLog> Sets { get; set; } = new();
}

/// <summary>The last working set for an exercise, shown while logging the next one.</summary>
public sealed class ExerciseMemory
{
    public string ExerciseKey { get; set; } = string.Empty;
    public double WeightKg { get; set; }
    public int Reps { get; set; }
    public DateTime AtUtc { get; set; } = DateTime.UtcNow;
}
