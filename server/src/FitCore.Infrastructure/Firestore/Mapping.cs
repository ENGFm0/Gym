using FitCore.Domain.Common;
using FitCore.Domain.Entities;
using FitCore.Domain.ValueObjects;
using FitCore.Infrastructure.Firestore.Documents;
using Google.Cloud.Firestore;

namespace FitCore.Infrastructure.Firestore;

/// <summary>Documents in, entities out. Enums travel as lowercase strings so the data stays readable in the console.</summary>
internal static class Mapping
{
    public static Timestamp ToTimestamp(DateTime value) =>
        Timestamp.FromDateTime(DateTime.SpecifyKind(value, DateTimeKind.Utc));

    public static DateTime ToUtc(Timestamp value) => value.ToDateTime();

    private static T ParseEnum<T>(string? value, T fallback) where T : struct, Enum =>
        Enum.TryParse<T>(value, true, out var parsed) ? parsed : fallback;

    private static string Lower<T>(T value) where T : Enum => value.ToString().ToLowerInvariant();

    /* ---------------- profile ---------------- */

    public static UserProfile ToProfile(string uid, ProfileDocument doc) => new()
    {
        Uid = uid,
        DisplayName = doc.Name,
        Email = doc.Email,
        Phone = doc.Phone,
        Gender = ParseEnum(doc.Gender, Gender.Male),
        BirthDate = DateOnly.TryParse(doc.BirthDate, out var birth) ? birth : null,
        HeightCm = doc.HeightCm,
        WeightKg = doc.WeightKg,
        TargetWeightKg = doc.TargetWeightKg,
        Activity = ParseEnum(doc.Activity, ActivityLevel.Light),
        Goal = ParseEnum(doc.Goal, Goal.FatLoss),
        PaceKgPerWeek = doc.Pace <= 0 ? 0.5 : doc.Pace,
        DietId = doc.DietId,
        Units = new UnitPreference(ParseEnum(doc.MassUnit, MassUnit.Kg), ParseEnum(doc.LengthUnit, LengthUnit.Cm)),
        RestSeconds = doc.RestSeconds <= 0 ? 90 : doc.RestSeconds,
        IsCoach = doc.IsCoach,
        Assignment = doc.Assignment is null ? null : new CoachAssignment
        {
            CoachUid = doc.Assignment.CoachUid,
            CoachName = doc.Assignment.CoachName,
            DietId = doc.Assignment.DietId,
            CalorieOverride = doc.Assignment.CalorieOverride,
            Note = doc.Assignment.Note,
            AssignedAtUtc = ToUtc(doc.Assignment.At)
        },
        Reminders = doc.Reminders is null ? new ReminderSettings() : new ReminderSettings
        {
            Enabled = doc.Reminders.Enabled,
            UtcOffsetMinutes = doc.Reminders.UtcOffsetMinutes,
            MealTimes = doc.Reminders.MealTimes.Count > 0 ? doc.Reminders.MealTimes : new List<string> { "13:30", "20:30" },
            Training = doc.Reminders.Training,
            TrainingTime = doc.Reminders.TrainingTime,
            WeighIn = doc.Reminders.WeighIn,
            WeighInWeekday = doc.Reminders.WeighInWeekday,
            WeighInTime = doc.Reminders.WeighInTime,
            LastSent = doc.Reminders.LastSent
        },
        CreatedAtUtc = ToUtc(doc.CreatedAt),
        UpdatedAtUtc = ToUtc(doc.UpdatedAt)
    };

    public static ProfileDocument FromProfile(UserProfile profile) => new()
    {
        Name = profile.DisplayName,
        Email = profile.Email,
        Phone = profile.Phone,
        Gender = Lower(profile.Gender),
        BirthDate = profile.BirthDate?.ToString("yyyy-MM-dd"),
        HeightCm = profile.HeightCm,
        WeightKg = profile.WeightKg,
        TargetWeightKg = profile.TargetWeightKg,
        Activity = Lower(profile.Activity),
        Goal = Lower(profile.Goal),
        Pace = profile.PaceKgPerWeek,
        DietId = profile.DietId,
        MassUnit = Lower(profile.Units.Mass),
        LengthUnit = Lower(profile.Units.Length),
        RestSeconds = profile.RestSeconds,
        IsCoach = profile.IsCoach,
        Assignment = profile.Assignment is null ? null : new AssignmentDocument
        {
            CoachUid = profile.Assignment.CoachUid,
            CoachName = profile.Assignment.CoachName,
            DietId = profile.Assignment.DietId,
            CalorieOverride = profile.Assignment.CalorieOverride,
            Note = profile.Assignment.Note,
            At = ToTimestamp(profile.Assignment.AssignedAtUtc)
        },
        Reminders = new RemindersDocument
        {
            Enabled = profile.Reminders.Enabled,
            UtcOffsetMinutes = profile.Reminders.UtcOffsetMinutes,
            MealTimes = profile.Reminders.MealTimes,
            Training = profile.Reminders.Training,
            TrainingTime = profile.Reminders.TrainingTime,
            WeighIn = profile.Reminders.WeighIn,
            WeighInWeekday = profile.Reminders.WeighInWeekday,
            WeighInTime = profile.Reminders.WeighInTime,
            LastSent = profile.Reminders.LastSent
        },
        RemindersOn = profile.Reminders.Enabled,
        CreatedAt = ToTimestamp(profile.CreatedAtUtc == default ? DateTime.UtcNow : profile.CreatedAtUtc),
        UpdatedAt = ToTimestamp(DateTime.UtcNow)
    };

    /* ---------------- diary ---------------- */

    public static DayLog ToDay(DateOnly date, DayDocument doc)
    {
        var day = new DayLog { Date = date, Steps = doc.Steps, WaterLitres = doc.Water };

        foreach (var slot in Enum.GetValues<MealSlot>())
        {
            var key = slot.ToString().ToLowerInvariant();
            if (!doc.Meals.TryGetValue(key, out var entries)) continue;

            day.Meals[slot] = entries.Select(e => new MealEntry
            {
                Id = string.IsNullOrEmpty(e.Id) ? Guid.NewGuid().ToString("n") : e.Id,
                FoodId = e.FoodId,
                NameAr = e.NameAr,
                NameEn = e.NameEn,
                Unit = e.Unit,
                BaseAmount = e.BaseAmount <= 0 ? 1 : e.BaseAmount,
                Quantity = e.Quantity,
                Calories = e.Calories,
                Protein = e.Protein,
                Carbs = e.Carbs,
                Fat = e.Fat,
                LoggedAtUtc = ToUtc(e.At)
            }).ToList();
        }

        return day;
    }

    public static DayDocument FromDay(DayLog day)
    {
        var doc = new DayDocument
        {
            Date = day.Date.ToString("yyyy-MM-dd"),
            Steps = day.Steps,
            Water = day.WaterLitres
        };

        foreach (var (slot, entries) in day.Meals)
        {
            doc.Meals[slot.ToString().ToLowerInvariant()] = entries.Select(e => new MealEntryDocument
            {
                Id = e.Id,
                FoodId = e.FoodId,
                NameAr = e.NameAr,
                NameEn = e.NameEn,
                Unit = e.Unit,
                BaseAmount = e.BaseAmount,
                Quantity = e.Quantity,
                Calories = e.Calories,
                Protein = e.Protein,
                Carbs = e.Carbs,
                Fat = e.Fat,
                At = ToTimestamp(e.LoggedAtUtc)
            }).ToList();
        }

        return doc;
    }

    /* ---------------- progress ---------------- */

    public static WeightReading ToWeight(string id, WeightDocument doc) => new()
    {
        Id = id, Kg = doc.Kg, TakenAtUtc = ToUtc(doc.At),
        Source = doc.Source, BodyFatPercent = doc.BodyFat, MuscleKg = doc.MuscleKg
    };

    public static WeightDocument FromWeight(WeightReading reading) => new()
    {
        Kg = reading.Kg, At = ToTimestamp(reading.TakenAtUtc),
        Source = reading.Source, BodyFat = reading.BodyFatPercent, MuscleKg = reading.MuscleKg
    };

    public static MeasurementReading ToMeasurement(string id, MeasurementDocument doc) => new()
    {
        Id = id, TakenAtUtc = ToUtc(doc.At), Parts = doc.Parts
    };

    public static MeasurementDocument FromMeasurement(MeasurementReading reading) => new()
    {
        At = ToTimestamp(reading.TakenAtUtc), Parts = reading.Parts
    };

    public static ProgressPhoto ToPhoto(string id, PhotoDocument doc) => new()
    {
        Id = id, StoragePath = doc.Path, TakenAtUtc = ToUtc(doc.At), Pose = doc.Pose, WeightKg = doc.WeightKg
    };

    public static PhotoDocument FromPhoto(ProgressPhoto photo) => new()
    {
        Path = photo.StoragePath, At = ToTimestamp(photo.TakenAtUtc), Pose = photo.Pose, WeightKg = photo.WeightKg
    };

    /* ---------------- training ---------------- */

    public static UserActivity ToActivity(string id, ActivityDocument doc) => new()
    {
        Id = id, NameAr = doc.NameAr, NameEn = doc.NameEn, Icon = doc.Icon, Met = doc.Met,
        Unit = ParseEnum(doc.Unit, ActivityUnit.Minutes), TimesPerWeek = doc.TimesPerWeek, IsCustom = doc.IsCustom
    };

    public static ActivityDocument FromActivity(UserActivity activity) => new()
    {
        NameAr = activity.NameAr, NameEn = activity.NameEn, Icon = activity.Icon, Met = activity.Met,
        Unit = Lower(activity.Unit), TimesPerWeek = activity.TimesPerWeek, IsCustom = activity.IsCustom
    };

    public static WorkoutSession ToSession(string id, SessionDocument doc) => new()
    {
        Id = id,
        ActivityId = doc.ActivityId,
        NameAr = doc.NameAr,
        NameEn = doc.NameEn,
        PerformedAtUtc = ToUtc(doc.At),
        Minutes = doc.Minutes,
        DistanceKm = doc.Km,
        VolumeKg = doc.VolumeKg,
        CompletedSets = doc.Sets,
        Calories = doc.Calories,
        Exercises = doc.Exercises.Select(e => new SessionExercise
        {
            NameAr = e.NameAr,
            NameEn = e.NameEn,
            Sets = e.Sets.Select(s => new SetLog { WeightKg = s.Kg, Reps = s.Reps, Done = s.Done }).ToList()
        }).ToList()
    };

    public static SessionDocument FromSession(WorkoutSession session) => new()
    {
        ActivityId = session.ActivityId,
        NameAr = session.NameAr,
        NameEn = session.NameEn,
        At = ToTimestamp(session.PerformedAtUtc),
        Minutes = session.Minutes,
        Km = session.DistanceKm,
        VolumeKg = session.VolumeKg,
        Sets = session.CompletedSets,
        Calories = session.Calories,
        Exercises = session.Exercises.Select(e => new SessionExerciseDocument
        {
            NameAr = e.NameAr,
            NameEn = e.NameEn,
            Sets = e.Sets.Select(s => new SetDocument { Kg = s.WeightKg, Reps = s.Reps, Done = s.Done }).ToList()
        }).ToList()
    };

    public static TrainingProgram ToProgram(ProgramDocument doc) => new()
    {
        TrainingDays = doc.TrainingDays,
        UpdatedAtUtc = ToUtc(doc.UpdatedAt),
        Days = doc.Days.Select(d => new ProgramDay
        {
            NameAr = d.NameAr,
            NameEn = d.NameEn,
            Exercises = d.Exercises.Select(e => new ProgramExercise
            {
                NameAr = e.NameAr, NameEn = e.NameEn, Sets = e.Sets, Reps = e.Reps
            }).ToList()
        }).ToList()
    };

    public static ProgramDocument FromProgram(TrainingProgram program) => new()
    {
        TrainingDays = program.TrainingDays,
        UpdatedAt = ToTimestamp(program.UpdatedAtUtc),
        Days = program.Days.Select(d => new ProgramDayDocument
        {
            NameAr = d.NameAr,
            NameEn = d.NameEn,
            Exercises = d.Exercises.Select(e => new ProgramExerciseDocument
            {
                NameAr = e.NameAr, NameEn = e.NameEn, Sets = e.Sets, Reps = e.Reps
            }).ToList()
        }).ToList()
    };

    public static FoodItem ToFood(string id, FoodDocument doc) => new()
    {
        Id = id, NameAr = doc.NameAr, NameEn = doc.NameEn, Unit = doc.Unit, BaseAmount = doc.BaseAmount,
        Calories = doc.Calories, Protein = doc.Protein, Carbs = doc.Carbs, Fat = doc.Fat,
        Barcode = doc.Barcode, Brand = doc.Brand, OwnerUid = doc.OwnerUid
    };

    public static FoodDocument FromFood(FoodItem food) => new()
    {
        NameAr = food.NameAr, NameEn = food.NameEn, Unit = food.Unit, BaseAmount = food.BaseAmount,
        Calories = food.Calories, Protein = food.Protein, Carbs = food.Carbs, Fat = food.Fat,
        Barcode = food.Barcode, Brand = food.Brand, OwnerUid = food.OwnerUid,
        Search = Tokenize(food.NameAr).Concat(Tokenize(food.NameEn)).Distinct().Take(30).ToList()
    };

    /// <summary>Firestore has no LIKE, so names are indexed as lowercase prefixes to search on.</summary>
    public static List<string> Tokenize(string value)
    {
        var tokens = new List<string>();
        foreach (var word in value.ToLowerInvariant().Split(' ', StringSplitOptions.RemoveEmptyEntries))
            for (var length = 2; length <= Math.Min(word.Length, 8); length++)
                tokens.Add(word[..length]);
        return tokens;
    }

    public static CoachInvite ToInvite(string id, InviteDocument doc) => new()
    {
        Id = id,
        CoachUid = doc.CoachUid,
        CoachName = doc.CoachName,
        Email = doc.Email,
        TraineeName = doc.TraineeName,
        State = ParseEnum(doc.State, InviteState.Pending),
        CreatedAtUtc = ToUtc(doc.CreatedAt),
        AnsweredAtUtc = doc.AnsweredAt is null ? null : ToUtc(doc.AnsweredAt.Value),
        TraineeUid = doc.TraineeUid
    };

    public static InviteDocument FromInvite(CoachInvite invite) => new()
    {
        CoachUid = invite.CoachUid,
        CoachName = invite.CoachName,
        Email = invite.Email,
        TraineeName = invite.TraineeName,
        State = Lower(invite.State),
        CreatedAt = ToTimestamp(invite.CreatedAtUtc),
        AnsweredAt = invite.AnsweredAtUtc is null ? null : ToTimestamp(invite.AnsweredAtUtc.Value),
        TraineeUid = invite.TraineeUid
    };

    public static CoachLink ToLink(string id, CoachLinkDocument doc) => new()
    {
        Id = id, CoachUid = doc.CoachUid, TraineeUid = doc.TraineeUid, TraineeName = doc.TraineeName,
        Status = ParseEnum(doc.Status, TraineeStatus.Invited), StartedAtUtc = ToUtc(doc.StartedAt),
        AssignedDietId = doc.AssignedDietId, Notes = doc.Notes
    };

    public static CoachLinkDocument FromLink(CoachLink link) => new()
    {
        CoachUid = link.CoachUid, TraineeUid = link.TraineeUid, TraineeName = link.TraineeName,
        Status = Lower(link.Status), StartedAt = ToTimestamp(link.StartedAtUtc),
        AssignedDietId = link.AssignedDietId, Notes = link.Notes
    };
}
