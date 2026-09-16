using FitCore.Domain.Common;

namespace FitCore.Application.Contracts;

public sealed record UnitsDto(string Mass, string Length);

public sealed record ProfileDto(
    string Uid,
    string? Name,
    string? Email,
    string? Phone,
    string Gender,
    DateOnly? BirthDate,
    int? Age,
    double HeightCm,
    double WeightKg,
    double? TargetWeightKg,
    string Activity,
    string Goal,
    double Pace,
    string DietId,
    UnitsDto Units,
    int RestSeconds,
    bool IsCoach,
    AssignmentDto? Assignment);

public sealed record UpdateProfileRequest(
    string? Name,
    string? Phone,
    string? Gender,
    DateOnly? BirthDate,
    double? HeightCm,
    double? WeightKg,
    double? TargetWeightKg,
    string? Activity,
    string? Goal,
    double? Pace,
    string? DietId,
    string? MassUnit,
    string? LengthUnit,
    int? RestSeconds);

public sealed record MacrosDto(int Protein, int Carbs, int Fat);

public sealed record PlanDto(
    int Bmr,
    int Tdee,
    int Calories,
    MacrosDto Macros,
    string DietId,
    double Bmi,
    string BmiBandAr,
    string BmiBandEn);

public sealed record MealEntryDto(
    string Id,
    string? FoodId,
    string NameAr,
    string NameEn,
    string Unit,
    double BaseAmount,
    double Quantity,
    double Calories,
    double Protein,
    double Carbs,
    double Fat);

public sealed record MealDto(string Slot, IReadOnlyList<MealEntryDto> Items, TotalsDto Totals);

public sealed record TotalsDto(double Calories, double Protein, double Carbs, double Fat);

public sealed record DayDto(
    DateOnly Date,
    IReadOnlyList<MealDto> Meals,
    TotalsDto Totals,
    PlanDto Plan,
    int Steps,
    double WaterLitres,
    int BurnedCalories,
    double CaloriesLeft);

public sealed record AddMealEntryRequest(
    string Slot,
    string? FoodId,
    double Quantity,
    string? NameAr,
    string? NameEn,
    string? Unit,
    double? Calories,
    double? Protein,
    double? Carbs,
    double? Fat);

public sealed record PatchDayRequest(int? Steps, double? WaterLitres, string? StepSource);

public sealed record FoodDto(
    string Id,
    string NameAr,
    string NameEn,
    string Unit,
    double BaseAmount,
    double Calories,
    double Protein,
    double Carbs,
    double Fat,
    string? Barcode,
    bool IsCustom);

public sealed record WeightDto(string Id, double Kg, DateTime AtUtc, double? Delta, string? Source);

public sealed record AddWeightRequest(double Kg, string? Unit, string? Source, double? BodyFatPercent, double? MuscleKg);

public sealed record MeasurementDto(string Id, DateTime AtUtc, IReadOnlyDictionary<string, double> Parts,
    IReadOnlyDictionary<string, double> Deltas);

public sealed record AddMeasurementRequest(IReadOnlyDictionary<string, double> Parts, string? Unit);

public sealed record PhotoDto(string Id, string Url, DateTime AtUtc, double? WeightKg);

public sealed record PhotoUploadTicket(string UploadUrl, string StoragePath);

public sealed record ConfirmPhotoRequest(string StoragePath, double? WeightKg, string? Pose);

public sealed record ActivityDto(
    string Id, string NameAr, string NameEn, string Icon, double Met, string Unit,
    int TimesPerWeek, int DoneThisWeek, bool IsCustom);

public sealed record AddActivityRequest(string? CatalogId, string? NameAr, string? NameEn, double? Met, int TimesPerWeek);

public sealed record UpdateActivityRequest(int TimesPerWeek);

public sealed record ExerciseDto(string NameAr, string NameEn, int Sets, int Reps);

public sealed record ProgramDayDto(
    int Slot, int Weekday, string WeekdayAr, string WeekdayEn,
    string NameAr, string NameEn, IReadOnlyList<ExerciseDto> Exercises);

public sealed record ProgramDto(
    int DaysPerWeek,
    IReadOnlyList<int> TrainingDays,
    IReadOnlyList<ProgramDayDto> Days,
    IReadOnlyList<int> RestDays);

public sealed record SetTrainingDaysRequest(int? DaysPerWeek, int? ToggleWeekday, IReadOnlyList<int>? TrainingDays);

public sealed record SaveDayExercisesRequest(IReadOnlyList<ExerciseDto> Exercises);

public sealed record SetLogDto(double? WeightKg, int Reps, bool Done);

public sealed record SessionExerciseDto(string NameAr, string NameEn, IReadOnlyList<SetLogDto> Sets);

public sealed record SessionDto(
    string Id, string ActivityId, string NameAr, string NameEn, DateTime AtUtc,
    int Minutes, double? DistanceKm, double VolumeKg, int Sets, int Calories);

public sealed record LogSessionRequest(
    string ActivityId,
    int? Minutes,
    double? DistanceKm,
    DateTime? PerformedAtUtc,
    IReadOnlyList<SessionExerciseDto>? Exercises);

public sealed record WeekDayBarDto(int Weekday, string LabelAr, string LabelEn, int Sessions);

public sealed record ActivityProgressDto(string Id, string NameAr, string NameEn, string Icon, int Done, int Target);

public sealed record WeekSummaryDto(
    int SessionsDone,
    int SessionsTarget,
    int AdherencePercent,
    double VolumeKg,
    int CaloriesBurned,
    int Minutes,
    IReadOnlyList<WeekDayBarDto> Days,
    IReadOnlyList<ActivityProgressDto> Activities,
    ProgramDayDto? Today,
    bool IsRestDay);

public sealed record TraineeDto(
    string Uid, string Name, string Status, DateTime StartedAtUtc,
    double? WeightKg, double? WeightDelta, int SessionsThisWeek, int AdherencePercent, string? AssignedDietId);

public sealed record InviteTraineeRequest(string Email, string? Name);

public sealed record InviteDto(
    string Id,
    string CoachName,
    string TraineeName,
    string Email,
    string State,
    DateTime CreatedAtUtc);

public sealed record AssignmentDto(
    string CoachUid,
    string CoachName,
    string? DietId,
    int? CalorieOverride,
    string? Note,
    DateTime AssignedAtUtc);

public sealed record AssignRequest(string? DietId, int? CalorieOverride, string? Note);

public sealed record RegisterDeviceRequest(string Token, string? Platform, string? Lang);
