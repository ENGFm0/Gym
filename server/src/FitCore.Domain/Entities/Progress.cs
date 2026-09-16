namespace FitCore.Domain.Entities;

/// <summary>One weigh-in. Readings are only ever appended, so the previous value stays visible.</summary>
public sealed class WeightReading
{
    public string Id { get; set; } = Guid.NewGuid().ToString("n");
    public double Kg { get; set; }
    public DateTime TakenAtUtc { get; set; } = DateTime.UtcNow;
    /// <summary>Set when the reading came from a connected scale rather than by hand.</summary>
    public string? Source { get; set; }
    public double? BodyFatPercent { get; set; }
    public double? MuscleKg { get; set; }
}

/// <summary>Body parts, in centimetres. Same rule as weight: every save is a new row.</summary>
public sealed class MeasurementReading
{
    public string Id { get; set; } = Guid.NewGuid().ToString("n");
    public DateTime TakenAtUtc { get; set; } = DateTime.UtcNow;
    public Dictionary<string, double> Parts { get; set; } = new();

    public static readonly string[] KnownParts =
        { "neck", "shoulder", "chest", "arm", "waist", "hip", "thigh", "calf" };
}

public sealed class ProgressPhoto
{
    public string Id { get; set; } = Guid.NewGuid().ToString("n");
    public string StoragePath { get; set; } = string.Empty;
    public DateTime TakenAtUtc { get; set; } = DateTime.UtcNow;
    public string? Pose { get; set; }
    public double? WeightKg { get; set; }
}
