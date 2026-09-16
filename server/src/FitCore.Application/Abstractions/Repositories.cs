using FitCore.Domain.Entities;

namespace FitCore.Application.Abstractions;

public interface IUserRepository
{
    Task<UserProfile?> GetAsync(string uid, CancellationToken ct = default);
    Task SaveAsync(UserProfile profile, CancellationToken ct = default);

    /// <summary>Everyone who asked to be reminded. Paged, because the job walks all of them.</summary>
    Task<IReadOnlyList<UserProfile>> GetRemindableAsync(int limit, string? afterUid, CancellationToken ct = default);

    /// <summary>Removes the member and everything under them.</summary>
    Task DeleteAsync(string uid, CancellationToken ct = default);
}

public interface IDiaryRepository
{
    Task<DayLog> GetDayAsync(string uid, DateOnly date, CancellationToken ct = default);
    Task SaveDayAsync(string uid, DayLog day, CancellationToken ct = default);
    Task<IReadOnlyList<DayLog>> GetRangeAsync(string uid, DateOnly from, DateOnly to, CancellationToken ct = default);
}

public interface IProgressRepository
{
    Task<IReadOnlyList<WeightReading>> GetWeightsAsync(string uid, int limit = 120, CancellationToken ct = default);
    Task AddWeightAsync(string uid, WeightReading reading, CancellationToken ct = default);
    Task DeleteWeightAsync(string uid, string id, CancellationToken ct = default);

    Task<IReadOnlyList<MeasurementReading>> GetMeasurementsAsync(string uid, int limit = 60, CancellationToken ct = default);
    Task AddMeasurementAsync(string uid, MeasurementReading reading, CancellationToken ct = default);
    Task DeleteMeasurementAsync(string uid, string id, CancellationToken ct = default);

    Task<IReadOnlyList<ProgressPhoto>> GetPhotosAsync(string uid, CancellationToken ct = default);
    Task AddPhotoAsync(string uid, ProgressPhoto photo, CancellationToken ct = default);
    Task DeletePhotoAsync(string uid, string id, CancellationToken ct = default);
}

public interface ITrainingRepository
{
    Task<TrainingProgram?> GetProgramAsync(string uid, CancellationToken ct = default);
    Task SaveProgramAsync(string uid, TrainingProgram program, CancellationToken ct = default);

    Task<IReadOnlyList<UserActivity>> GetActivitiesAsync(string uid, CancellationToken ct = default);
    Task SaveActivityAsync(string uid, UserActivity activity, CancellationToken ct = default);
    Task DeleteActivityAsync(string uid, string id, CancellationToken ct = default);

    Task<IReadOnlyList<WorkoutSession>> GetSessionsAsync(string uid, DateTime? fromUtc = null, int limit = 60, CancellationToken ct = default);
    Task AddSessionAsync(string uid, WorkoutSession session, CancellationToken ct = default);
    Task DeleteSessionAsync(string uid, string id, CancellationToken ct = default);

    Task<ExerciseMemory?> GetExerciseMemoryAsync(string uid, string exerciseKey, CancellationToken ct = default);
    Task SaveExerciseMemoryAsync(string uid, ExerciseMemory memory, CancellationToken ct = default);
}

public interface IFoodCatalog
{
    Task<IReadOnlyList<FoodItem>> SearchAsync(string? query, string uid, int limit = 40, CancellationToken ct = default);
    Task<FoodItem?> GetAsync(string id, string uid, CancellationToken ct = default);
    Task<FoodItem?> FindByBarcodeAsync(string barcode, CancellationToken ct = default);
    Task<FoodItem> AddCustomAsync(FoodItem item, CancellationToken ct = default);
}

public interface ICoachRepository
{
    Task<IReadOnlyList<CoachInvite>> GetInvitesForCoachAsync(string coachUid, CancellationToken ct = default);
    Task<IReadOnlyList<CoachInvite>> GetInvitesForEmailAsync(string email, CancellationToken ct = default);
    Task<CoachInvite?> GetInviteAsync(string inviteId, CancellationToken ct = default);
    Task SaveInviteAsync(CoachInvite invite, CancellationToken ct = default);

    Task<IReadOnlyList<CoachLink>> GetTraineesAsync(string coachUid, CancellationToken ct = default);
    Task<CoachLink?> GetLinkAsync(string coachUid, string traineeUid, CancellationToken ct = default);
    Task SaveLinkAsync(CoachLink link, CancellationToken ct = default);
    Task RemoveLinkAsync(string coachUid, string traineeUid, CancellationToken ct = default);
}

/// <summary>Photos are uploaded straight to storage with a short lived signed URL; the API only keeps the path.</summary>
public interface IPhotoStorage
{
    Task<(string UploadUrl, string StoragePath)> CreateUploadUrlAsync(string uid, string contentType, CancellationToken ct = default);
    Task<string> CreateReadUrlAsync(string storagePath, CancellationToken ct = default);
    Task DeleteAsync(string storagePath, CancellationToken ct = default);
}

public interface IClock
{
    DateTime UtcNow { get; }
    DateOnly Today { get; }
}

public sealed class SystemClock : IClock
{
    public DateTime UtcNow => DateTime.UtcNow;
    public DateOnly Today => DateOnly.FromDateTime(DateTime.UtcNow);
}
