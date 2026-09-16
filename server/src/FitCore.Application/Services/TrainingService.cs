using FitCore.Application.Abstractions;
using FitCore.Application.Catalogs;
using FitCore.Application.Contracts;
using FitCore.Application.Training;
using FitCore.Domain.Common;
using FitCore.Domain.Entities;

namespace FitCore.Application.Services;

public sealed class TrainingService(
    ITrainingRepository training,
    IUserRepository users,
    INotifier notifier,
    IClock clock)
{
    /* ---------------- program ---------------- */

    public async Task<TrainingProgram> GetProgramAsync(string uid, CancellationToken ct = default)
    {
        var program = await training.GetProgramAsync(uid, ct);
        if (program is not null && program.Days.Count > 0) return program;

        // First time in: seed the week from the activity level captured at signup.
        var profile = await users.GetAsync(uid, ct);
        var seeded = WeekPlanner.Seed(profile?.Activity ?? ActivityLevel.Light);
        await training.SaveProgramAsync(uid, seeded, ct);
        return seeded;
    }

    /// <summary>Writes a program for a uid other than the caller — used by a linked coach.</summary>
    public Task SaveProgramForAsync(string uid, TrainingProgram program, CancellationToken ct = default) =>
        training.SaveProgramAsync(uid, program, ct);

    public async Task<ProgramDto> GetProgramDtoAsync(string uid, CancellationToken ct = default) =>
        MapProgram(await GetProgramAsync(uid, ct));

    public async Task<ProgramDto> SetTrainingDaysAsync(string uid, SetTrainingDaysRequest request, CancellationToken ct = default)
    {
        var program = await GetProgramAsync(uid, ct);

        if (request.DaysPerWeek is not null)
            WeekPlanner.SetDaysPerWeek(program, request.DaysPerWeek.Value);
        else if (request.ToggleWeekday is not null)
            WeekPlanner.ToggleDay(program, request.ToggleWeekday.Value);
        else if (request.TrainingDays is not null)
        {
            program.TrainingDays = request.TrainingDays.ToList();
            WeekPlanner.Reflow(program);
        }

        await training.SaveProgramAsync(uid, program, ct);
        return MapProgram(program);
    }

    public async Task<ProgramDto> SaveDayExercisesAsync(string uid, int slot, SaveDayExercisesRequest request, CancellationToken ct = default)
    {
        var program = await GetProgramAsync(uid, ct);
        if (slot < 0 || slot >= program.Days.Count) throw new KeyNotFoundException("No such training day.");

        program.Days[slot].Exercises = request.Exercises
            .Select(e => new ProgramExercise
            {
                NameAr = e.NameAr,
                NameEn = string.IsNullOrWhiteSpace(e.NameEn) ? e.NameAr : e.NameEn,
                Sets = Math.Clamp(e.Sets, 1, 20),
                Reps = Math.Clamp(e.Reps, 1, 100)
            })
            .ToList();

        program.UpdatedAtUtc = clock.UtcNow;
        await training.SaveProgramAsync(uid, program, ct);
        return MapProgram(program);
    }

    /* ---------------- activities ---------------- */

    public async Task<IReadOnlyList<UserActivity>> GetActivitiesAsync(string uid, CancellationToken ct = default)
    {
        var activities = await training.GetActivitiesAsync(uid, ct);
        if (activities.Count > 0) return activities;

        // Everyone starts with the iron; the rest is up to them.
        var gym = ActivityCatalog.Find("gym")!;
        var seeded = new UserActivity
        {
            Id = gym.Id, NameAr = gym.NameAr, NameEn = gym.NameEn,
            Icon = gym.Icon, Met = gym.Met, Unit = gym.Unit, TimesPerWeek = 4
        };
        await training.SaveActivityAsync(uid, seeded, ct);
        return new[] { seeded };
    }

    public async Task<IReadOnlyList<ActivityDto>> GetActivityDtosAsync(string uid, CancellationToken ct = default)
    {
        var activities = await GetActivitiesAsync(uid, ct);
        var sessions = await SessionsThisWeekAsync(uid, ct);
        return activities.Select(a => MapActivity(a, sessions)).ToList();
    }

    public async Task<ActivityDto> AddActivityAsync(string uid, AddActivityRequest request, CancellationToken ct = default)
    {
        var timesPerWeek = Math.Clamp(request.TimesPerWeek, 1, 14);
        UserActivity activity;

        var fromCatalog = request.CatalogId is null ? null : ActivityCatalog.Find(request.CatalogId);
        if (fromCatalog is not null)
        {
            var existing = await training.GetActivitiesAsync(uid, ct);
            if (existing.Any(a => a.Id == fromCatalog.Id))
                throw new InvalidOperationException("That activity is already on the list.");

            activity = new UserActivity
            {
                Id = fromCatalog.Id, NameAr = fromCatalog.NameAr, NameEn = fromCatalog.NameEn,
                Icon = fromCatalog.Icon, Met = fromCatalog.Met, Unit = fromCatalog.Unit,
                TimesPerWeek = timesPerWeek
            };
        }
        else
        {
            var name = request.NameAr ?? request.NameEn
                ?? throw new ArgumentException("A custom activity needs a name.", nameof(request));
            activity = new UserActivity
            {
                Id = "c" + Guid.NewGuid().ToString("n")[..8],
                NameAr = name,
                NameEn = request.NameEn ?? name,
                Icon = "exercise",
                Met = Math.Clamp(request.Met ?? 6, 1, 20),
                Unit = ActivityUnit.Minutes,
                TimesPerWeek = timesPerWeek,
                IsCustom = true
            };
        }

        await training.SaveActivityAsync(uid, activity, ct);
        return MapActivity(activity, await SessionsThisWeekAsync(uid, ct));
    }

    public async Task<ActivityDto> UpdateActivityAsync(string uid, string id, UpdateActivityRequest request, CancellationToken ct = default)
    {
        var activities = await GetActivitiesAsync(uid, ct);
        var activity = activities.FirstOrDefault(a => a.Id == id)
                       ?? throw new KeyNotFoundException("No such activity.");

        activity.TimesPerWeek = Math.Clamp(request.TimesPerWeek, 0, 14);
        await training.SaveActivityAsync(uid, activity, ct);
        return MapActivity(activity, await SessionsThisWeekAsync(uid, ct));
    }

    public Task RemoveActivityAsync(string uid, string id, CancellationToken ct = default) =>
        training.DeleteActivityAsync(uid, id, ct);

    /* ---------------- sessions ---------------- */

    public async Task<SessionDto> LogSessionAsync(string uid, LogSessionRequest request, CancellationToken ct = default)
    {
        var profile = await users.GetAsync(uid, ct);
        var weight = profile?.WeightKg ?? 80;

        var activities = await GetActivitiesAsync(uid, ct);
        var mine = activities.FirstOrDefault(a => a.Id == request.ActivityId);
        var catalog = ActivityCatalog.Find(request.ActivityId);

        var nameAr = mine?.NameAr ?? catalog?.NameAr ?? request.ActivityId;
        var nameEn = mine?.NameEn ?? catalog?.NameEn ?? request.ActivityId;
        var met = mine?.Met ?? catalog?.Met ?? 5;

        var session = new WorkoutSession
        {
            ActivityId = request.ActivityId,
            NameAr = nameAr,
            NameEn = nameEn,
            PerformedAtUtc = request.PerformedAtUtc ?? clock.UtcNow,
            DistanceKm = request.DistanceKm,
            Exercises = request.Exercises?.Select(MapSessionExercise).ToList() ?? new List<SessionExercise>()
        };

        if (session.Exercises.Count > 0)
        {
            var (volume, sets) = WeekPlanner.Tally(session.Exercises);
            session.VolumeKg = volume;
            session.CompletedSets = sets;

            if (sets == 0) throw new InvalidOperationException("A session with no completed sets is not saved.");

            session.Minutes = Math.Clamp(request.Minutes ?? sets * 3, 5, 240);
        }
        else
        {
            var minutes = request.Minutes ?? 0;
            if (minutes <= 0) throw new ArgumentException("Minutes are required.", nameof(request));
            session.Minutes = Math.Clamp(minutes, 1, 600);
        }

        session.Calories = MetCalculator.Burn(met, session.Minutes, weight);
        await training.AddSessionAsync(uid, session, ct);

        // Remember the last working set of every exercise, to show next time.
        foreach (var exercise in session.Exercises)
        {
            var best = exercise.Sets.Where(s => s.Done && s.WeightKg > 0)
                .OrderByDescending(s => s.WeightKg).FirstOrDefault();
            if (best is null) continue;

            await training.SaveExerciseMemoryAsync(uid, new ExerciseMemory
            {
                ExerciseKey = exercise.NameAr,
                WeightKg = best.WeightKg ?? 0,
                Reps = best.Reps,
                AtUtc = session.PerformedAtUtc
            }, ct);
        }

        // A member with a coach usually wants them to see the work; the coach gets one line.
        if (profile?.Assignment?.CoachUid is { Length: > 0 } coachUid)
        {
            var who = profile.DisplayName ?? "متدربك";
            var detail = session.VolumeKg > 0
                ? $"{session.NameAr} · {session.VolumeKg:0} كجم"
                : $"{session.NameAr} · {session.Minutes} دقيقة";

            await notifier.SendAsync(coachUid, new PushMessage(
                $"{who} سجّل جلسة", detail,
                $"{who} logged a session", $"{session.NameEn} · {session.Minutes} min",
                $"/coach/{uid}"), ct);
        }

        return MapSession(session);
    }

    public async Task<IReadOnlyList<SessionDto>> GetSessionsAsync(string uid, int limit = 60, CancellationToken ct = default)
    {
        var sessions = await training.GetSessionsAsync(uid, null, limit, ct);
        return sessions.OrderByDescending(s => s.PerformedAtUtc).Select(MapSession).ToList();
    }

    public Task DeleteSessionAsync(string uid, string id, CancellationToken ct = default) =>
        training.DeleteSessionAsync(uid, id, ct);

    public Task<ExerciseMemory?> GetMemoryAsync(string uid, string exercise, CancellationToken ct = default) =>
        training.GetExerciseMemoryAsync(uid, exercise, ct);

    /* ---------------- helpers ---------------- */

    public async Task<IReadOnlyList<WorkoutSession>> SessionsThisWeekAsync(string uid, CancellationToken ct = default)
    {
        var weekStart = WeekDays.StartOfWeek(clock.UtcNow);
        return await training.GetSessionsAsync(uid, weekStart, 200, ct);
    }

    public static ProgramDto MapProgram(TrainingProgram program)
    {
        var days = new List<ProgramDayDto>();
        for (var slot = 0; slot < program.Days.Count && slot < program.TrainingDays.Count; slot++)
        {
            var weekday = program.TrainingDays[slot];
            var day = program.Days[slot];
            days.Add(new ProgramDayDto(
                slot, weekday, WeekDays.Arabic[weekday], WeekDays.English[weekday],
                day.NameAr, day.NameEn,
                day.Exercises.Select(e => new ExerciseDto(e.NameAr, e.NameEn, e.Sets, e.Reps)).ToList()));
        }

        var rest = Enumerable.Range(0, WeekDays.Count).Where(d => !program.TrainingDays.Contains(d)).ToList();
        return new ProgramDto(program.DaysPerWeek, program.TrainingDays, days, rest);
    }

    private static ActivityDto MapActivity(UserActivity a, IReadOnlyList<WorkoutSession> weekSessions) => new(
        a.Id, a.NameAr, a.NameEn, a.Icon, a.Met, a.Unit.ToString().ToLowerInvariant(),
        a.TimesPerWeek, weekSessions.Count(s => s.ActivityId == a.Id), a.IsCustom);

    private static SessionDto MapSession(WorkoutSession s) => new(
        s.Id, s.ActivityId, s.NameAr, s.NameEn, s.PerformedAtUtc,
        s.Minutes, s.DistanceKm, s.VolumeKg, s.CompletedSets, s.Calories);

    private static SessionExercise MapSessionExercise(SessionExerciseDto dto) => new()
    {
        NameAr = dto.NameAr,
        NameEn = string.IsNullOrWhiteSpace(dto.NameEn) ? dto.NameAr : dto.NameEn,
        Sets = dto.Sets.Select(s => new SetLog { WeightKg = s.WeightKg, Reps = s.Reps, Done = s.Done }).ToList()
    };
}
