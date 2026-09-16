namespace FitCore.Application.Abstractions;

/// <summary>What a body-composition printout gives up when it is read.</summary>
public sealed record InBodyReading(
    double? WeightKg,
    double? BodyFatPercent,
    double? SkeletalMuscleKg,
    double? BodyFatMassKg,
    double? Bmi,
    double? BasalMetabolicRate,
    double? VisceralFatLevel,
    double? BodyWaterLitres,
    DateOnly? MeasuredOn,
    string? DeviceName,
    /// <summary>0 to 1. Anything low means the photo was hard to read; the app asks before saving.</summary>
    double Confidence,
    string? Note);

/// <summary>Reads an InBody or similar report from a photo the member took.</summary>
public interface IInBodyScanner
{
    Task<InBodyReading> ReadAsync(byte[] image, string mediaType, CancellationToken ct = default);
}
