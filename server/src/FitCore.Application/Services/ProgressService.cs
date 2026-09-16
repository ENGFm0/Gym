using FitCore.Application.Abstractions;
using FitCore.Application.Contracts;
using FitCore.Domain.Entities;
using FitCore.Domain.ValueObjects;

namespace FitCore.Application.Services;

/// <summary>
/// Weight and measurements are append-only: an update never overwrites the last reading,
/// so the member always sees the previous value and the difference.
/// </summary>
public sealed class ProgressService(
    IProgressRepository progress,
    IUserRepository users,
    IPhotoStorage photos,
    IClock clock)
{
    public async Task<IReadOnlyList<WeightDto>> GetWeightsAsync(string uid, CancellationToken ct = default)
    {
        var readings = await progress.GetWeightsAsync(uid, 120, ct);
        var ordered = readings.OrderBy(r => r.TakenAtUtc).ToList();
        var list = new List<WeightDto>(ordered.Count);

        for (var i = 0; i < ordered.Count; i++)
        {
            var current = ordered[i];
            double? delta = i > 0 ? Math.Round(current.Kg - ordered[i - 1].Kg, 1) : null;
            list.Add(new WeightDto(current.Id, current.Kg, current.TakenAtUtc, delta, current.Source));
        }

        list.Reverse();
        return list;
    }

    public async Task<IReadOnlyList<WeightDto>> AddWeightAsync(string uid, AddWeightRequest request, CancellationToken ct = default)
    {
        var profile = await users.GetAsync(uid, ct) ?? new UserProfile { Uid = uid };
        var kg = string.Equals(request.Unit, "lb", StringComparison.OrdinalIgnoreCase)
            ? request.Kg * UnitPreference.KgPerLb
            : request.Kg;

        if (kg is <= 0 or > 500) throw new ArgumentOutOfRangeException(nameof(request.Kg), "Weight is out of range.");

        await progress.AddWeightAsync(uid, new WeightReading
        {
            Kg = Math.Round(kg, 1),
            TakenAtUtc = clock.UtcNow,
            Source = request.Source,
            BodyFatPercent = request.BodyFatPercent,
            MuscleKg = request.MuscleKg
        }, ct);

        // The profile carries the latest weight so the plan stays in step with it.
        profile.WeightKg = Math.Round(kg, 1);
        profile.UpdatedAtUtc = clock.UtcNow;
        await users.SaveAsync(profile, ct);

        return await GetWeightsAsync(uid, ct);
    }

    public Task DeleteWeightAsync(string uid, string id, CancellationToken ct = default) =>
        progress.DeleteWeightAsync(uid, id, ct);

    public async Task<IReadOnlyList<MeasurementDto>> GetMeasurementsAsync(string uid, CancellationToken ct = default)
    {
        var readings = (await progress.GetMeasurementsAsync(uid, 60, ct))
            .OrderBy(r => r.TakenAtUtc).ToList();

        var list = new List<MeasurementDto>(readings.Count);
        for (var i = 0; i < readings.Count; i++)
        {
            var current = readings[i];
            var deltas = new Dictionary<string, double>();
            if (i > 0)
            {
                foreach (var (part, value) in current.Parts)
                    if (readings[i - 1].Parts.TryGetValue(part, out var before))
                        deltas[part] = Math.Round(value - before, 1);
            }
            list.Add(new MeasurementDto(current.Id, current.TakenAtUtc, current.Parts, deltas));
        }

        list.Reverse();
        return list;
    }

    public async Task<IReadOnlyList<MeasurementDto>> AddMeasurementAsync(string uid, AddMeasurementRequest request, CancellationToken ct = default)
    {
        var inches = string.Equals(request.Unit, "in", StringComparison.OrdinalIgnoreCase);
        var parts = new Dictionary<string, double>();

        foreach (var (key, value) in request.Parts)
        {
            if (value <= 0) continue;
            if (!MeasurementReading.KnownParts.Contains(key)) continue;
            parts[key] = Math.Round(inches ? value * UnitPreference.CmPerInch : value, 1);
        }

        if (parts.Count == 0) throw new ArgumentException("No measurements to save.", nameof(request));

        await progress.AddMeasurementAsync(uid, new MeasurementReading
        {
            TakenAtUtc = clock.UtcNow,
            Parts = parts
        }, ct);

        return await GetMeasurementsAsync(uid, ct);
    }

    public Task DeleteMeasurementAsync(string uid, string id, CancellationToken ct = default) =>
        progress.DeleteMeasurementAsync(uid, id, ct);

    public Task<(string UploadUrl, string StoragePath)> CreatePhotoTicketAsync(string uid, string contentType, CancellationToken ct = default) =>
        photos.CreateUploadUrlAsync(uid, contentType, ct);

    public async Task<IReadOnlyList<PhotoDto>> ConfirmPhotoAsync(string uid, ConfirmPhotoRequest request, CancellationToken ct = default)
    {
        await progress.AddPhotoAsync(uid, new ProgressPhoto
        {
            StoragePath = request.StoragePath,
            TakenAtUtc = clock.UtcNow,
            WeightKg = request.WeightKg,
            Pose = request.Pose
        }, ct);

        return await GetPhotosAsync(uid, ct);
    }

    public async Task<IReadOnlyList<PhotoDto>> GetPhotosAsync(string uid, CancellationToken ct = default)
    {
        var stored = await progress.GetPhotosAsync(uid, ct);
        var list = new List<PhotoDto>(stored.Count);
        foreach (var photo in stored.OrderByDescending(p => p.TakenAtUtc))
            list.Add(new PhotoDto(photo.Id, await photos.CreateReadUrlAsync(photo.StoragePath, ct), photo.TakenAtUtc, photo.WeightKg));
        return list;
    }

    public async Task DeletePhotoAsync(string uid, string id, CancellationToken ct = default)
    {
        var stored = await progress.GetPhotosAsync(uid, ct);
        var photo = stored.FirstOrDefault(p => p.Id == id);
        if (photo is not null) await photos.DeleteAsync(photo.StoragePath, ct);
        await progress.DeletePhotoAsync(uid, id, ct);
    }
}
