namespace FitCore.Domain.Entities;

/// <summary>
/// When a member wants to be nudged. Times are local to them, which is why the offset is
/// stored with them: the server runs in UTC and has no other way to know it is 8pm in Riyadh.
/// </summary>
public sealed class ReminderSettings
{
    public bool Enabled { get; set; }

    /// <summary>Minutes east of UTC, e.g. 180 for Riyadh.</summary>
    public int UtcOffsetMinutes { get; set; } = 180;

    /// <summary>Local times of day, "HH:mm", to ask about a meal that has not been logged.</summary>
    public List<string> MealTimes { get; set; } = new() { "13:30", "20:30" };

    /// <summary>Nudge on a training day if nothing was logged by this local time.</summary>
    public bool Training { get; set; } = true;
    public string TrainingTime { get; set; } = "18:00";

    /// <summary>A weekly weigh-in, on a weekday index where Saturday is 0.</summary>
    public bool WeighIn { get; set; } = true;
    public int WeighInWeekday { get; set; }
    public string WeighInTime { get; set; } = "07:30";

    /// <summary>The last local day each kind fired, so a restart or a re-run cannot double-send.</summary>
    public Dictionary<string, string> LastSent { get; set; } = new();

    public static bool TryParseTime(string value, out TimeOnly time) =>
        TimeOnly.TryParseExact(value, "HH:mm", out time);
}
