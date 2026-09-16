using System.Text.Json;
using FitCore.Application.Abstractions;
using FitCore.Application.Summaries;

namespace FitCore.Application.Services;

/// <summary>
/// Taking your data with you, and leaving. Both are the member's right; the export is plain
/// JSON rather than a proprietary bundle, and the delete removes the sign-in too — an account
/// that cannot be signed into but still exists is not deleted.
/// </summary>
public sealed class AccountService(
    IUserRepository users,
    IDiaryRepository diary,
    IProgressRepository progress,
    ITrainingRepository training,
    ICoachRepository coaches,
    IIdentityService identity,
    IClock clock)
{
    public async Task<byte[]> ExportAsync(string uid, CancellationToken ct = default)
    {
        var profile = await users.GetAsync(uid, ct);
        var today = clock.Today;

        var bundle = new
        {
            exportedAtUtc = clock.UtcNow,
            profile,
            plan = profile is null ? null : Nutrition.PlanCalculator.For(profile, today),
            // A year of days is every figure the app has ever shown them.
            days = await diary.GetRangeAsync(uid, today.AddDays(-365), today, ct),
            weights = await progress.GetWeightsAsync(uid, 1000, ct),
            measurements = await progress.GetMeasurementsAsync(uid, 1000, ct),
            photos = await progress.GetPhotosAsync(uid, ct),
            program = await training.GetProgramAsync(uid, ct),
            activities = await training.GetActivitiesAsync(uid, ct),
            sessions = await training.GetSessionsAsync(uid, null, 1000, ct)
        };

        return JsonSerializer.SerializeToUtf8Bytes(bundle, new JsonSerializerOptions
        {
            WriteIndented = true,
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping // keep Arabic readable
        });
    }

    public async Task DeleteAsync(string uid, CancellationToken ct = default)
    {
        var profile = await users.GetAsync(uid, ct);

        // Leave every coaching relationship first, so nobody keeps a link to a member who is gone.
        if (profile?.Assignment?.CoachUid is { Length: > 0 } coachUid)
            await coaches.RemoveLinkAsync(coachUid, uid, ct);

        if (profile?.IsCoach == true)
        {
            foreach (var link in await coaches.GetTraineesAsync(uid, ct))
                await coaches.RemoveLinkAsync(uid, link.TraineeUid, ct);
        }

        await users.DeleteAsync(uid, ct);

        // The sign-in goes last: while it exists the member could still create data.
        await identity.DeleteUserAsync(uid, ct);
    }
}
