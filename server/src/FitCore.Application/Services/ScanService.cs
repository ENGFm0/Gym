using FitCore.Application.Abstractions;
using FitCore.Application.Contracts;
using FitCore.Domain.Entities;

namespace FitCore.Application.Services;

/// <summary>
/// Reading an InBody printout is a convenience, not a source of truth: the numbers come back
/// for the member to confirm, and only what they keep is written as a reading.
/// </summary>
public sealed class ScanService(
    IInBodyScanner scanner,
    IProgressRepository progress,
    IUserRepository users,
    IClock clock)
{
    public const int MaxImageBytes = 8 * 1024 * 1024;

    private static readonly string[] Allowed = { "image/jpeg", "image/png", "image/webp" };

    public async Task<InBodyScanDto> ReadAsync(byte[] image, string mediaType, CancellationToken ct = default)
    {
        if (image.Length == 0) throw new ArgumentException("The image is empty.", nameof(image));
        if (image.Length > MaxImageBytes) throw new ArgumentException("The image is larger than 8 MB.", nameof(image));
        if (!Allowed.Contains(mediaType)) throw new ArgumentException($"Unsupported image type '{mediaType}'.", nameof(mediaType));

        var reading = await scanner.ReadAsync(image, mediaType, ct);

        return new InBodyScanDto(
            reading.WeightKg, reading.BodyFatPercent, reading.SkeletalMuscleKg, reading.BodyFatMassKg,
            reading.Bmi, reading.BasalMetabolicRate, reading.VisceralFatLevel, reading.BodyWaterLitres,
            reading.MeasuredOn, reading.DeviceName, reading.Confidence, reading.Note);
    }

    /// <summary>Writes the confirmed numbers as a normal weigh-in, so the history stays one list.</summary>
    public async Task SaveAsync(string uid, SaveScanRequest request, CancellationToken ct = default)
    {
        if (request.WeightKg is not > 0) throw new ArgumentException("A weight is needed to save the scan.", nameof(request));

        await progress.AddWeightAsync(uid, new WeightReading
        {
            Kg = Math.Round(request.WeightKg.Value, 1),
            TakenAtUtc = clock.UtcNow,
            Source = "inbody",
            BodyFatPercent = request.BodyFatPercent,
            MuscleKg = request.SkeletalMuscleKg
        }, ct);

        var profile = await users.GetAsync(uid, ct);
        if (profile is null) return;

        profile.WeightKg = Math.Round(request.WeightKg.Value, 1);
        profile.UpdatedAtUtc = clock.UtcNow;
        await users.SaveAsync(profile, ct);
    }
}
