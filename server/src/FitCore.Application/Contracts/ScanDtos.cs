namespace FitCore.Application.Contracts;

public sealed record InBodyScanDto(
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
    double Confidence,
    string? Note);

/// <summary>What the member chose to keep out of a scan.</summary>
public sealed record SaveScanRequest(double? WeightKg, double? BodyFatPercent, double? SkeletalMuscleKg);
