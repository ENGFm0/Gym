using System.Collections.Concurrent;
using FitCore.Application.Abstractions;
using FitCore.Domain.Entities;

namespace FitCore.Api.Tests;

/// <summary>
/// In-memory stand-ins for everything the API stores. They keep the same contracts the
/// Firestore ones do, so a test exercises the real controllers, services and maths — only the
/// database is swapped out.
/// </summary>
public sealed class FakeUsers : IUserRepository
{
    public readonly ConcurrentDictionary<string, UserProfile> Items = new();

    public Task<UserProfile?> GetAsync(string uid, CancellationToken ct = default) =>
        Task.FromResult(Items.TryGetValue(uid, out var profile) ? profile : null);

    public Task SaveAsync(UserProfile profile, CancellationToken ct = default)
    {
        Items[profile.Uid] = profile;
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<UserProfile>> GetRemindableAsync(int limit, string? afterUid, CancellationToken ct = default)
    {
        var page = Items.Values
            .Where(p => p.Reminders.Enabled)
            .OrderBy(p => p.Uid, StringComparer.Ordinal)
            .Where(p => afterUid is null || string.CompareOrdinal(p.Uid, afterUid) > 0)
            .Take(limit)
            .ToList();

        return Task.FromResult<IReadOnlyList<UserProfile>>(page);
    }

    public Task DeleteAsync(string uid, CancellationToken ct = default)
    {
        Items.TryRemove(uid, out _);
        return Task.CompletedTask;
    }
}

public sealed class FakeDiary : IDiaryRepository
{
    public readonly ConcurrentDictionary<(string Uid, DateOnly Date), DayLog> Items = new();

    public Task<DayLog> GetDayAsync(string uid, DateOnly date, CancellationToken ct = default) =>
        Task.FromResult(Items.TryGetValue((uid, date), out var day) ? day : new DayLog { Date = date });

    public Task SaveDayAsync(string uid, DayLog day, CancellationToken ct = default)
    {
        Items[(uid, day.Date)] = day;
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<DayLog>> GetRangeAsync(string uid, DateOnly from, DateOnly to, CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<DayLog>>(Items
            .Where(pair => pair.Key.Uid == uid && pair.Key.Date >= from && pair.Key.Date <= to)
            .Select(pair => pair.Value)
            .OrderBy(day => day.Date)
            .ToList());
}

public sealed class FakeProgress : IProgressRepository
{
    public readonly ConcurrentDictionary<string, List<WeightReading>> Weights = new();
    public readonly ConcurrentDictionary<string, List<MeasurementReading>> Measures = new();
    public readonly ConcurrentDictionary<string, List<ProgressPhoto>> Photos = new();

    private static List<T> ListFor<T>(ConcurrentDictionary<string, List<T>> store, string uid) =>
        store.GetOrAdd(uid, _ => new List<T>());

    public Task<IReadOnlyList<WeightReading>> GetWeightsAsync(string uid, int limit = 120, CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<WeightReading>>(
            ListFor(Weights, uid).OrderByDescending(w => w.TakenAtUtc).Take(limit).ToList());

    public Task AddWeightAsync(string uid, WeightReading reading, CancellationToken ct = default)
    {
        ListFor(Weights, uid).Add(reading);
        return Task.CompletedTask;
    }

    public Task DeleteWeightAsync(string uid, string id, CancellationToken ct = default)
    {
        ListFor(Weights, uid).RemoveAll(w => w.Id == id);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<MeasurementReading>> GetMeasurementsAsync(string uid, int limit = 60, CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<MeasurementReading>>(
            ListFor(Measures, uid).OrderByDescending(m => m.TakenAtUtc).Take(limit).ToList());

    public Task AddMeasurementAsync(string uid, MeasurementReading reading, CancellationToken ct = default)
    {
        ListFor(Measures, uid).Add(reading);
        return Task.CompletedTask;
    }

    public Task DeleteMeasurementAsync(string uid, string id, CancellationToken ct = default)
    {
        ListFor(Measures, uid).RemoveAll(m => m.Id == id);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<ProgressPhoto>> GetPhotosAsync(string uid, CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<ProgressPhoto>>(ListFor(Photos, uid).ToList());

    public Task AddPhotoAsync(string uid, ProgressPhoto photo, CancellationToken ct = default)
    {
        ListFor(Photos, uid).Add(photo);
        return Task.CompletedTask;
    }

    public Task DeletePhotoAsync(string uid, string id, CancellationToken ct = default)
    {
        ListFor(Photos, uid).RemoveAll(p => p.Id == id);
        return Task.CompletedTask;
    }
}

public sealed class FakeTraining : ITrainingRepository
{
    public readonly ConcurrentDictionary<string, TrainingProgram> Programs = new();
    public readonly ConcurrentDictionary<string, List<UserActivity>> Activities = new();
    public readonly ConcurrentDictionary<string, List<WorkoutSession>> Sessions = new();
    public readonly ConcurrentDictionary<(string, string), ExerciseMemory> Memory = new();

    public Task<TrainingProgram?> GetProgramAsync(string uid, CancellationToken ct = default) =>
        Task.FromResult(Programs.TryGetValue(uid, out var program) ? program : null);

    public Task SaveProgramAsync(string uid, TrainingProgram program, CancellationToken ct = default)
    {
        Programs[uid] = program;
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<UserActivity>> GetActivitiesAsync(string uid, CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<UserActivity>>(Activities.GetOrAdd(uid, _ => new()).ToList());

    public Task SaveActivityAsync(string uid, UserActivity activity, CancellationToken ct = default)
    {
        var list = Activities.GetOrAdd(uid, _ => new());
        list.RemoveAll(a => a.Id == activity.Id);
        list.Add(activity);
        return Task.CompletedTask;
    }

    public Task DeleteActivityAsync(string uid, string id, CancellationToken ct = default)
    {
        Activities.GetOrAdd(uid, _ => new()).RemoveAll(a => a.Id == id);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<WorkoutSession>> GetSessionsAsync(
        string uid, DateTime? fromUtc = null, int limit = 60, CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<WorkoutSession>>(Sessions.GetOrAdd(uid, _ => new())
            .Where(s => fromUtc is null || s.PerformedAtUtc >= fromUtc)
            .OrderByDescending(s => s.PerformedAtUtc)
            .Take(limit)
            .ToList());

    public Task AddSessionAsync(string uid, WorkoutSession session, CancellationToken ct = default)
    {
        Sessions.GetOrAdd(uid, _ => new()).Add(session);
        return Task.CompletedTask;
    }

    public Task DeleteSessionAsync(string uid, string id, CancellationToken ct = default)
    {
        Sessions.GetOrAdd(uid, _ => new()).RemoveAll(s => s.Id == id);
        return Task.CompletedTask;
    }

    public Task<ExerciseMemory?> GetExerciseMemoryAsync(string uid, string exerciseKey, CancellationToken ct = default) =>
        Task.FromResult(Memory.TryGetValue((uid, exerciseKey), out var memory) ? memory : null);

    public Task SaveExerciseMemoryAsync(string uid, ExerciseMemory memory, CancellationToken ct = default)
    {
        Memory[(uid, memory.ExerciseKey)] = memory;
        return Task.CompletedTask;
    }
}

public sealed class FakeCoaches : ICoachRepository
{
    public readonly List<CoachLink> Links = new();
    public readonly List<CoachInvite> Invites = new();

    public Task<IReadOnlyList<CoachInvite>> GetInvitesForCoachAsync(string coachUid, CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<CoachInvite>>(Invites.Where(i => i.CoachUid == coachUid).ToList());

    public Task<IReadOnlyList<CoachInvite>> GetInvitesForEmailAsync(string email, CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<CoachInvite>>(Invites.Where(i => i.Email == email).ToList());

    public Task<CoachInvite?> GetInviteAsync(string inviteId, CancellationToken ct = default) =>
        Task.FromResult(Invites.FirstOrDefault(i => i.Id == inviteId));

    public Task SaveInviteAsync(CoachInvite invite, CancellationToken ct = default)
    {
        Invites.RemoveAll(i => i.Id == invite.Id);
        Invites.Add(invite);
        return Task.CompletedTask;
    }

    public Task<IReadOnlyList<CoachLink>> GetTraineesAsync(string coachUid, CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<CoachLink>>(Links.Where(l => l.CoachUid == coachUid).ToList());

    public Task<CoachLink?> GetLinkAsync(string coachUid, string traineeUid, CancellationToken ct = default) =>
        Task.FromResult(Links.FirstOrDefault(l => l.CoachUid == coachUid && l.TraineeUid == traineeUid));

    public Task SaveLinkAsync(CoachLink link, CancellationToken ct = default)
    {
        Links.RemoveAll(l => l.CoachUid == link.CoachUid && l.TraineeUid == link.TraineeUid);
        Links.Add(link);
        return Task.CompletedTask;
    }

    public Task RemoveLinkAsync(string coachUid, string traineeUid, CancellationToken ct = default)
    {
        Links.RemoveAll(l => l.CoachUid == coachUid && l.TraineeUid == traineeUid);
        return Task.CompletedTask;
    }
}

public sealed class FakeFoods : IFoodCatalog
{
    public readonly List<FoodItem> Items = new()
    {
        new() { Id = "chick", NameAr = "صدر دجاج مشوي", NameEn = "Grilled chicken", Unit = "جم",
                BaseAmount = 100, Calories = 165, Protein = 31, Carbs = 0, Fat = 3.6 }
    };

    public Task<IReadOnlyList<FoodItem>> SearchAsync(string? query, string uid, int limit = 40, CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<FoodItem>>(Items
            .Where(f => string.IsNullOrWhiteSpace(query) || f.NameAr.Contains(query) || f.NameEn.Contains(query, StringComparison.OrdinalIgnoreCase))
            .ToList());

    public Task<FoodItem?> GetAsync(string id, string uid, CancellationToken ct = default) =>
        Task.FromResult(Items.FirstOrDefault(f => f.Id == id));

    public Task<FoodItem?> FindByBarcodeAsync(string barcode, CancellationToken ct = default) =>
        Task.FromResult(Items.FirstOrDefault(f => f.Barcode == barcode));

    public Task<FoodItem> AddCustomAsync(FoodItem item, CancellationToken ct = default)
    {
        Items.Add(item);
        return Task.FromResult(item);
    }
}

public sealed class FakeDevices : IDeviceRepository
{
    public readonly ConcurrentDictionary<string, List<string>> Tokens = new();

    public Task<IReadOnlyList<string>> GetTokensAsync(string uid, CancellationToken ct = default) =>
        Task.FromResult<IReadOnlyList<string>>(Tokens.GetOrAdd(uid, _ => new()).ToList());

    public Task AddTokenAsync(string uid, string token, string? platform, string? lang, CancellationToken ct = default)
    {
        Tokens.GetOrAdd(uid, _ => new()).Add(token);
        return Task.CompletedTask;
    }

    public Task RemoveTokenAsync(string uid, string token, CancellationToken ct = default)
    {
        Tokens.GetOrAdd(uid, _ => new()).Remove(token);
        return Task.CompletedTask;
    }

    public Task<string?> GetLangAsync(string uid, CancellationToken ct = default) => Task.FromResult<string?>("ar");
}

public sealed class FakeQuota : IQuotaRepository
{
    private readonly ConcurrentDictionary<string, int> _used = new();

    public Task<int> GetAsync(string uid, string key, DateOnly day, CancellationToken ct = default) =>
        Task.FromResult(_used.GetValueOrDefault($"{uid}:{key}:{day}"));

    public Task<int> IncrementAsync(string uid, string key, DateOnly day, CancellationToken ct = default) =>
        Task.FromResult(_used.AddOrUpdate($"{uid}:{key}:{day}", 1, (_, current) => current + 1));
}

/// <summary>Records what would have been sent, so a test can assert on it.</summary>
public sealed class FakeNotifier : INotifier
{
    public readonly List<(string Uid, PushMessage Message)> Sent = new();

    public Task SendAsync(string uid, PushMessage message, CancellationToken ct = default)
    {
        Sent.Add((uid, message));
        return Task.CompletedTask;
    }
}

public sealed class FakeIdentity : IIdentityService
{
    public readonly HashSet<string> Coaches = new();
    public readonly HashSet<string> Deleted = new();

    public Task SetCoachAsync(string uid, bool isCoach, CancellationToken ct = default)
    {
        if (isCoach) Coaches.Add(uid); else Coaches.Remove(uid);
        return Task.CompletedTask;
    }

    public Task DeleteUserAsync(string uid, CancellationToken ct = default)
    {
        Deleted.Add(uid);
        return Task.CompletedTask;
    }
}

public sealed class FakePhotos : IPhotoStorage
{
    public Task<(string UploadUrl, string StoragePath)> CreateUploadUrlAsync(string uid, string contentType, CancellationToken ct = default) =>
        Task.FromResult(("https://example.invalid/upload", $"progress/{uid}/test.jpg"));

    public Task<string> CreateReadUrlAsync(string storagePath, CancellationToken ct = default) =>
        Task.FromResult($"https://example.invalid/{storagePath}");

    public Task DeleteAsync(string storagePath, CancellationToken ct = default) => Task.CompletedTask;
}

/// <summary>Returns a fixed reading, so the scan route can be tested without calling a model.</summary>
public sealed class FakeScanner : IInBodyScanner
{
    public int Calls;

    public Task<InBodyReading> ReadAsync(byte[] image, string mediaType, CancellationToken ct = default)
    {
        Calls++;
        return Task.FromResult(new InBodyReading(
            88.4, 19.2, 36.1, 17.0, 25.8, 1780, 7, 44.2,
            new DateOnly(2026, 9, 16), "InBody 770", 0.94, null));
    }
}

/// <summary>A clock a test can move, for anything that depends on today.</summary>
public sealed class TestClock : IClock
{
    public DateTime UtcNow { get; set; } = new(2026, 9, 16, 9, 0, 0, DateTimeKind.Utc);
    public DateOnly Today => DateOnly.FromDateTime(UtcNow);
}
