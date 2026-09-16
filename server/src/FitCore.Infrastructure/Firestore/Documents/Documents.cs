using Google.Cloud.Firestore;

namespace FitCore.Infrastructure.Firestore.Documents;

[FirestoreData]
public sealed class ProfileDocument
{
    [FirestoreProperty("name")] public string? Name { get; set; }
    [FirestoreProperty("email")] public string? Email { get; set; }
    [FirestoreProperty("phone")] public string? Phone { get; set; }
    [FirestoreProperty("gender")] public string Gender { get; set; } = "male";
    [FirestoreProperty("birthDate")] public string? BirthDate { get; set; }
    [FirestoreProperty("heightCm")] public double HeightCm { get; set; }
    [FirestoreProperty("weightKg")] public double WeightKg { get; set; }
    [FirestoreProperty("targetWeightKg")] public double? TargetWeightKg { get; set; }
    [FirestoreProperty("activity")] public string Activity { get; set; } = "light";
    [FirestoreProperty("goal")] public string Goal { get; set; } = "fatloss";
    [FirestoreProperty("pace")] public double Pace { get; set; } = 0.5;
    [FirestoreProperty("dietId")] public string DietId { get; set; } = "balanced";
    [FirestoreProperty("massUnit")] public string MassUnit { get; set; } = "kg";
    [FirestoreProperty("lengthUnit")] public string LengthUnit { get; set; } = "cm";
    [FirestoreProperty("restSeconds")] public int RestSeconds { get; set; } = 90;
    [FirestoreProperty("isCoach")] public bool IsCoach { get; set; }
    [FirestoreProperty("assignment")] public AssignmentDocument? Assignment { get; set; }
    [FirestoreProperty("reminders")] public RemindersDocument? Reminders { get; set; }
    /// <summary>Denormalised so the reminder job can query without reading every profile.</summary>
    [FirestoreProperty("remindersOn")] public bool RemindersOn { get; set; }
    [FirestoreProperty("createdAt")] public Timestamp CreatedAt { get; set; }
    [FirestoreProperty("updatedAt")] public Timestamp UpdatedAt { get; set; }
}

[FirestoreData]
public sealed class MealEntryDocument
{
    [FirestoreProperty("id")] public string Id { get; set; } = string.Empty;
    [FirestoreProperty("foodId")] public string? FoodId { get; set; }
    [FirestoreProperty("nameAr")] public string NameAr { get; set; } = string.Empty;
    [FirestoreProperty("nameEn")] public string NameEn { get; set; } = string.Empty;
    [FirestoreProperty("unit")] public string Unit { get; set; } = "جم";
    [FirestoreProperty("baseAmount")] public double BaseAmount { get; set; }
    [FirestoreProperty("quantity")] public double Quantity { get; set; }
    [FirestoreProperty("kcal")] public double Calories { get; set; }
    [FirestoreProperty("protein")] public double Protein { get; set; }
    [FirestoreProperty("carbs")] public double Carbs { get; set; }
    [FirestoreProperty("fat")] public double Fat { get; set; }
    [FirestoreProperty("at")] public Timestamp At { get; set; }
}

[FirestoreData]
public sealed class DayDocument
{
    [FirestoreProperty("date")] public string Date { get; set; } = string.Empty;
    [FirestoreProperty("steps")] public int Steps { get; set; }
    [FirestoreProperty("water")] public double Water { get; set; }
    [FirestoreProperty("meals")] public Dictionary<string, List<MealEntryDocument>> Meals { get; set; } = new();
}

[FirestoreData]
public sealed class WeightDocument
{
    [FirestoreProperty("kg")] public double Kg { get; set; }
    [FirestoreProperty("at")] public Timestamp At { get; set; }
    [FirestoreProperty("source")] public string? Source { get; set; }
    [FirestoreProperty("bodyFat")] public double? BodyFat { get; set; }
    [FirestoreProperty("muscleKg")] public double? MuscleKg { get; set; }
}

[FirestoreData]
public sealed class MeasurementDocument
{
    [FirestoreProperty("at")] public Timestamp At { get; set; }
    [FirestoreProperty("parts")] public Dictionary<string, double> Parts { get; set; } = new();
}

[FirestoreData]
public sealed class PhotoDocument
{
    [FirestoreProperty("path")] public string Path { get; set; } = string.Empty;
    [FirestoreProperty("at")] public Timestamp At { get; set; }
    [FirestoreProperty("pose")] public string? Pose { get; set; }
    [FirestoreProperty("weightKg")] public double? WeightKg { get; set; }
}

[FirestoreData]
public sealed class ActivityDocument
{
    [FirestoreProperty("nameAr")] public string NameAr { get; set; } = string.Empty;
    [FirestoreProperty("nameEn")] public string NameEn { get; set; } = string.Empty;
    [FirestoreProperty("icon")] public string Icon { get; set; } = "exercise";
    [FirestoreProperty("met")] public double Met { get; set; }
    [FirestoreProperty("unit")] public string Unit { get; set; } = "minutes";
    [FirestoreProperty("timesPerWeek")] public int TimesPerWeek { get; set; }
    [FirestoreProperty("isCustom")] public bool IsCustom { get; set; }
}

[FirestoreData]
public sealed class SetDocument
{
    [FirestoreProperty("kg")] public double? Kg { get; set; }
    [FirestoreProperty("reps")] public int Reps { get; set; }
    [FirestoreProperty("done")] public bool Done { get; set; }
}

[FirestoreData]
public sealed class SessionExerciseDocument
{
    [FirestoreProperty("nameAr")] public string NameAr { get; set; } = string.Empty;
    [FirestoreProperty("nameEn")] public string NameEn { get; set; } = string.Empty;
    [FirestoreProperty("sets")] public List<SetDocument> Sets { get; set; } = new();
}

[FirestoreData]
public sealed class SessionDocument
{
    [FirestoreProperty("activityId")] public string ActivityId { get; set; } = "gym";
    [FirestoreProperty("nameAr")] public string NameAr { get; set; } = string.Empty;
    [FirestoreProperty("nameEn")] public string NameEn { get; set; } = string.Empty;
    [FirestoreProperty("at")] public Timestamp At { get; set; }
    [FirestoreProperty("minutes")] public int Minutes { get; set; }
    [FirestoreProperty("km")] public double? Km { get; set; }
    [FirestoreProperty("volumeKg")] public double VolumeKg { get; set; }
    [FirestoreProperty("sets")] public int Sets { get; set; }
    [FirestoreProperty("kcal")] public int Calories { get; set; }
    [FirestoreProperty("exercises")] public List<SessionExerciseDocument> Exercises { get; set; } = new();
}

[FirestoreData]
public sealed class ProgramExerciseDocument
{
    [FirestoreProperty("nameAr")] public string NameAr { get; set; } = string.Empty;
    [FirestoreProperty("nameEn")] public string NameEn { get; set; } = string.Empty;
    [FirestoreProperty("sets")] public int Sets { get; set; }
    [FirestoreProperty("reps")] public int Reps { get; set; }
}

[FirestoreData]
public sealed class ProgramDayDocument
{
    [FirestoreProperty("nameAr")] public string NameAr { get; set; } = string.Empty;
    [FirestoreProperty("nameEn")] public string NameEn { get; set; } = string.Empty;
    [FirestoreProperty("exercises")] public List<ProgramExerciseDocument> Exercises { get; set; } = new();
}

[FirestoreData]
public sealed class ProgramDocument
{
    [FirestoreProperty("trainingDays")] public List<int> TrainingDays { get; set; } = new();
    [FirestoreProperty("days")] public List<ProgramDayDocument> Days { get; set; } = new();
    [FirestoreProperty("updatedAt")] public Timestamp UpdatedAt { get; set; }
}

[FirestoreData]
public sealed class ExerciseMemoryDocument
{
    [FirestoreProperty("kg")] public double Kg { get; set; }
    [FirestoreProperty("reps")] public int Reps { get; set; }
    [FirestoreProperty("at")] public Timestamp At { get; set; }
}

[FirestoreData]
public sealed class FoodDocument
{
    [FirestoreProperty("nameAr")] public string NameAr { get; set; } = string.Empty;
    [FirestoreProperty("nameEn")] public string NameEn { get; set; } = string.Empty;
    [FirestoreProperty("unit")] public string Unit { get; set; } = "جم";
    [FirestoreProperty("baseAmount")] public double BaseAmount { get; set; } = 100;
    [FirestoreProperty("kcal")] public double Calories { get; set; }
    [FirestoreProperty("protein")] public double Protein { get; set; }
    [FirestoreProperty("carbs")] public double Carbs { get; set; }
    [FirestoreProperty("fat")] public double Fat { get; set; }
    [FirestoreProperty("barcode")] public string? Barcode { get; set; }
    [FirestoreProperty("brand")] public string? Brand { get; set; }
    [FirestoreProperty("ownerUid")] public string? OwnerUid { get; set; }
    [FirestoreProperty("search")] public List<string> Search { get; set; } = new();
}

[FirestoreData]
public sealed class AssignmentDocument
{
    [FirestoreProperty("coachUid")] public string CoachUid { get; set; } = string.Empty;
    [FirestoreProperty("coachName")] public string CoachName { get; set; } = string.Empty;
    [FirestoreProperty("dietId")] public string? DietId { get; set; }
    [FirestoreProperty("calorieOverride")] public int? CalorieOverride { get; set; }
    [FirestoreProperty("note")] public string? Note { get; set; }
    [FirestoreProperty("at")] public Timestamp At { get; set; }
}

[FirestoreData]
public sealed class RemindersDocument
{
    [FirestoreProperty("enabled")] public bool Enabled { get; set; }
    [FirestoreProperty("offset")] public int UtcOffsetMinutes { get; set; } = 180;
    [FirestoreProperty("mealTimes")] public List<string> MealTimes { get; set; } = new();
    [FirestoreProperty("training")] public bool Training { get; set; }
    [FirestoreProperty("trainingTime")] public string TrainingTime { get; set; } = "18:00";
    [FirestoreProperty("weighIn")] public bool WeighIn { get; set; }
    [FirestoreProperty("weighInWeekday")] public int WeighInWeekday { get; set; }
    [FirestoreProperty("weighInTime")] public string WeighInTime { get; set; } = "07:30";
    [FirestoreProperty("lastSent")] public Dictionary<string, string> LastSent { get; set; } = new();
}

[FirestoreData]
public sealed class InviteDocument
{
    [FirestoreProperty("coachUid")] public string CoachUid { get; set; } = string.Empty;
    [FirestoreProperty("coachName")] public string CoachName { get; set; } = string.Empty;
    [FirestoreProperty("email")] public string Email { get; set; } = string.Empty;
    [FirestoreProperty("traineeName")] public string TraineeName { get; set; } = string.Empty;
    [FirestoreProperty("state")] public string State { get; set; } = "pending";
    [FirestoreProperty("createdAt")] public Timestamp CreatedAt { get; set; }
    [FirestoreProperty("answeredAt")] public Timestamp? AnsweredAt { get; set; }
    [FirestoreProperty("traineeUid")] public string? TraineeUid { get; set; }
}

[FirestoreData]
public sealed class CoachLinkDocument
{
    [FirestoreProperty("coachUid")] public string CoachUid { get; set; } = string.Empty;
    [FirestoreProperty("traineeUid")] public string TraineeUid { get; set; } = string.Empty;
    [FirestoreProperty("traineeName")] public string TraineeName { get; set; } = string.Empty;
    [FirestoreProperty("status")] public string Status { get; set; } = "invited";
    [FirestoreProperty("startedAt")] public Timestamp StartedAt { get; set; }
    [FirestoreProperty("assignedDietId")] public string? AssignedDietId { get; set; }
    [FirestoreProperty("notes")] public string? Notes { get; set; }
}
