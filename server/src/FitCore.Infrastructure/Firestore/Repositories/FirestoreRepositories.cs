using FitCore.Application.Abstractions;
using FitCore.Domain.Entities;
using FitCore.Infrastructure.Firestore.Documents;
using Google.Cloud.Firestore;

namespace FitCore.Infrastructure.Firestore.Repositories;

public sealed class FirestoreUserRepository(FirestoreDb db) : IUserRepository
{
    public async Task<UserProfile?> GetAsync(string uid, CancellationToken ct = default)
    {
        var snapshot = await Paths.User(db, uid).GetSnapshotAsync(ct);
        return snapshot.Exists ? Mapping.ToProfile(uid, snapshot.ConvertTo<ProfileDocument>()) : null;
    }

    public Task SaveAsync(UserProfile profile, CancellationToken ct = default) =>
        Paths.User(db, profile.Uid).SetAsync(Mapping.FromProfile(profile), SetOptions.MergeAll, ct);
}

public sealed class FirestoreDiaryRepository(FirestoreDb db) : IDiaryRepository
{
    public async Task<DayLog> GetDayAsync(string uid, DateOnly date, CancellationToken ct = default)
    {
        var snapshot = await Paths.Days(db, uid).Document(Paths.DayId(date)).GetSnapshotAsync(ct);
        return snapshot.Exists
            ? Mapping.ToDay(date, snapshot.ConvertTo<DayDocument>())
            : new DayLog { Date = date };
    }

    public Task SaveDayAsync(string uid, DayLog day, CancellationToken ct = default) =>
        Paths.Days(db, uid).Document(Paths.DayId(day.Date)).SetAsync(Mapping.FromDay(day), SetOptions.Overwrite, ct);

    public async Task<IReadOnlyList<DayLog>> GetRangeAsync(string uid, DateOnly from, DateOnly to, CancellationToken ct = default)
    {
        var snapshot = await Paths.Days(db, uid)
            .WhereGreaterThanOrEqualTo(FieldPath.DocumentId, Paths.DayId(from))
            .WhereLessThanOrEqualTo(FieldPath.DocumentId, Paths.DayId(to))
            .GetSnapshotAsync(ct);

        return snapshot.Documents
            .Select(d => Mapping.ToDay(DateOnly.Parse(d.Id), d.ConvertTo<DayDocument>()))
            .OrderBy(d => d.Date)
            .ToList();
    }
}

public sealed class FirestoreProgressRepository(FirestoreDb db) : IProgressRepository
{
    public async Task<IReadOnlyList<WeightReading>> GetWeightsAsync(string uid, int limit = 120, CancellationToken ct = default)
    {
        var snapshot = await Paths.Weights(db, uid).OrderByDescending("at").Limit(limit).GetSnapshotAsync(ct);
        return snapshot.Documents.Select(d => Mapping.ToWeight(d.Id, d.ConvertTo<WeightDocument>())).ToList();
    }

    public Task AddWeightAsync(string uid, WeightReading reading, CancellationToken ct = default) =>
        Paths.Weights(db, uid).Document(reading.Id).SetAsync(Mapping.FromWeight(reading), SetOptions.Overwrite, ct);

    public Task DeleteWeightAsync(string uid, string id, CancellationToken ct = default) =>
        Paths.Weights(db, uid).Document(id).DeleteAsync(cancellationToken: ct);

    public async Task<IReadOnlyList<MeasurementReading>> GetMeasurementsAsync(string uid, int limit = 60, CancellationToken ct = default)
    {
        var snapshot = await Paths.Measures(db, uid).OrderByDescending("at").Limit(limit).GetSnapshotAsync(ct);
        return snapshot.Documents.Select(d => Mapping.ToMeasurement(d.Id, d.ConvertTo<MeasurementDocument>())).ToList();
    }

    public Task AddMeasurementAsync(string uid, MeasurementReading reading, CancellationToken ct = default) =>
        Paths.Measures(db, uid).Document(reading.Id).SetAsync(Mapping.FromMeasurement(reading), SetOptions.Overwrite, ct);

    public Task DeleteMeasurementAsync(string uid, string id, CancellationToken ct = default) =>
        Paths.Measures(db, uid).Document(id).DeleteAsync(cancellationToken: ct);

    public async Task<IReadOnlyList<ProgressPhoto>> GetPhotosAsync(string uid, CancellationToken ct = default)
    {
        var snapshot = await Paths.Photos(db, uid).OrderByDescending("at").Limit(200).GetSnapshotAsync(ct);
        return snapshot.Documents.Select(d => Mapping.ToPhoto(d.Id, d.ConvertTo<PhotoDocument>())).ToList();
    }

    public Task AddPhotoAsync(string uid, ProgressPhoto photo, CancellationToken ct = default) =>
        Paths.Photos(db, uid).Document(photo.Id).SetAsync(Mapping.FromPhoto(photo), SetOptions.Overwrite, ct);

    public Task DeletePhotoAsync(string uid, string id, CancellationToken ct = default) =>
        Paths.Photos(db, uid).Document(id).DeleteAsync(cancellationToken: ct);
}

public sealed class FirestoreTrainingRepository(FirestoreDb db) : ITrainingRepository
{
    public async Task<TrainingProgram?> GetProgramAsync(string uid, CancellationToken ct = default)
    {
        var snapshot = await Paths.Program(db, uid).GetSnapshotAsync(ct);
        return snapshot.Exists ? Mapping.ToProgram(snapshot.ConvertTo<ProgramDocument>()) : null;
    }

    public Task SaveProgramAsync(string uid, TrainingProgram program, CancellationToken ct = default) =>
        Paths.Program(db, uid).SetAsync(Mapping.FromProgram(program), SetOptions.Overwrite, ct);

    public async Task<IReadOnlyList<UserActivity>> GetActivitiesAsync(string uid, CancellationToken ct = default)
    {
        var snapshot = await Paths.Activities(db, uid).GetSnapshotAsync(ct);
        return snapshot.Documents.Select(d => Mapping.ToActivity(d.Id, d.ConvertTo<ActivityDocument>())).ToList();
    }

    public Task SaveActivityAsync(string uid, UserActivity activity, CancellationToken ct = default) =>
        Paths.Activities(db, uid).Document(activity.Id).SetAsync(Mapping.FromActivity(activity), SetOptions.Overwrite, ct);

    public Task DeleteActivityAsync(string uid, string id, CancellationToken ct = default) =>
        Paths.Activities(db, uid).Document(id).DeleteAsync(cancellationToken: ct);

    public async Task<IReadOnlyList<WorkoutSession>> GetSessionsAsync(
        string uid, DateTime? fromUtc = null, int limit = 60, CancellationToken ct = default)
    {
        Query query = Paths.Sessions(db, uid);
        if (fromUtc is not null)
            query = query.WhereGreaterThanOrEqualTo("at", Mapping.ToTimestamp(fromUtc.Value));

        var snapshot = await query.OrderByDescending("at").Limit(limit).GetSnapshotAsync(ct);
        return snapshot.Documents.Select(d => Mapping.ToSession(d.Id, d.ConvertTo<SessionDocument>())).ToList();
    }

    public Task AddSessionAsync(string uid, WorkoutSession session, CancellationToken ct = default) =>
        Paths.Sessions(db, uid).Document(session.Id).SetAsync(Mapping.FromSession(session), SetOptions.Overwrite, ct);

    public Task DeleteSessionAsync(string uid, string id, CancellationToken ct = default) =>
        Paths.Sessions(db, uid).Document(id).DeleteAsync(cancellationToken: ct);

    public async Task<ExerciseMemory?> GetExerciseMemoryAsync(string uid, string exerciseKey, CancellationToken ct = default)
    {
        var snapshot = await Paths.ExerciseMemory(db, uid).Document(Slug(exerciseKey)).GetSnapshotAsync(ct);
        if (!snapshot.Exists) return null;

        var doc = snapshot.ConvertTo<ExerciseMemoryDocument>();
        return new ExerciseMemory
        {
            ExerciseKey = exerciseKey, WeightKg = doc.Kg, Reps = doc.Reps, AtUtc = Mapping.ToUtc(doc.At)
        };
    }

    public Task SaveExerciseMemoryAsync(string uid, ExerciseMemory memory, CancellationToken ct = default) =>
        Paths.ExerciseMemory(db, uid).Document(Slug(memory.ExerciseKey)).SetAsync(new ExerciseMemoryDocument
        {
            Kg = memory.WeightKg, Reps = memory.Reps, At = Mapping.ToTimestamp(memory.AtUtc)
        }, SetOptions.Overwrite, ct);

    /// <summary>Exercise names are Arabic and may contain slashes, which a document id cannot.</summary>
    private static string Slug(string key) =>
        Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(key)).Replace('/', '_').Replace('+', '-');
}

public sealed class FirestoreCoachRepository(FirestoreDb db) : ICoachRepository
{
    public async Task<IReadOnlyList<CoachInvite>> GetInvitesForCoachAsync(string coachUid, CancellationToken ct = default)
    {
        var snapshot = await db.Collection(Paths.CoachInvites)
            .WhereEqualTo("coachUid", coachUid)
            .Limit(200)
            .GetSnapshotAsync(ct);

        return snapshot.Documents.Select(d => Mapping.ToInvite(d.Id, d.ConvertTo<InviteDocument>())).ToList();
    }

    /// <summary>Matched on the email the member signed in with; the address is stored normalised.</summary>
    public async Task<IReadOnlyList<CoachInvite>> GetInvitesForEmailAsync(string email, CancellationToken ct = default)
    {
        var snapshot = await db.Collection(Paths.CoachInvites)
            .WhereEqualTo("email", email)
            .Limit(50)
            .GetSnapshotAsync(ct);

        return snapshot.Documents.Select(d => Mapping.ToInvite(d.Id, d.ConvertTo<InviteDocument>())).ToList();
    }

    public async Task<CoachInvite?> GetInviteAsync(string inviteId, CancellationToken ct = default)
    {
        var snapshot = await db.Collection(Paths.CoachInvites).Document(inviteId).GetSnapshotAsync(ct);
        return snapshot.Exists ? Mapping.ToInvite(snapshot.Id, snapshot.ConvertTo<InviteDocument>()) : null;
    }

    public Task SaveInviteAsync(CoachInvite invite, CancellationToken ct = default) =>
        db.Collection(Paths.CoachInvites).Document(invite.Id)
            .SetAsync(Mapping.FromInvite(invite), SetOptions.Overwrite, ct);

    public async Task<IReadOnlyList<CoachLink>> GetTraineesAsync(string coachUid, CancellationToken ct = default)
    {
        var snapshot = await db.Collection(Paths.CoachLinks)
            .WhereEqualTo("coachUid", coachUid)
            .GetSnapshotAsync(ct);

        return snapshot.Documents.Select(d => Mapping.ToLink(d.Id, d.ConvertTo<CoachLinkDocument>())).ToList();
    }

    public async Task<CoachLink?> GetLinkAsync(string coachUid, string traineeUid, CancellationToken ct = default)
    {
        var snapshot = await db.Collection(Paths.CoachLinks)
            .Document(Paths.LinkId(coachUid, traineeUid)).GetSnapshotAsync(ct);

        return snapshot.Exists ? Mapping.ToLink(snapshot.Id, snapshot.ConvertTo<CoachLinkDocument>()) : null;
    }

    public Task SaveLinkAsync(CoachLink link, CancellationToken ct = default) =>
        db.Collection(Paths.CoachLinks)
            .Document(Paths.LinkId(link.CoachUid, link.TraineeUid))
            .SetAsync(Mapping.FromLink(link), SetOptions.MergeAll, ct);

    public Task RemoveLinkAsync(string coachUid, string traineeUid, CancellationToken ct = default) =>
        db.Collection(Paths.CoachLinks).Document(Paths.LinkId(coachUid, traineeUid)).DeleteAsync(cancellationToken: ct);
}
