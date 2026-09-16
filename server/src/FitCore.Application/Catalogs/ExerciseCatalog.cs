namespace FitCore.Application.Catalogs;

public sealed record ExerciseDefinition(string NameAr, string NameEn);

public static class ExerciseCatalog
{
    public static readonly IReadOnlyList<ExerciseDefinition> All = new List<ExerciseDefinition>
    {
        new("بنش برس", "Bench press"),
        new("سكوات", "Squat"),
        new("رفعة ميتة", "Deadlift"),
        new("ضغط أكتاف", "Shoulder press"),
        new("سحب أمامي", "Lat pulldown"),
        new("تجديف بالبار", "Barbell row"),
        new("عقلة", "Pull-up"),
        new("مرجحة بايسبس", "Biceps curl"),
        new("ترايسبس بالحبل", "Triceps pushdown"),
        new("دمبل صدر مائل", "Incline dumbbell press"),
        new("لانجز", "Lunges"),
        new("رفرفة جانبي", "Lateral raise"),
        new("سمانة واقف", "Standing calf raise"),
        new("بلانك", "Plank"),
        new("كارديو", "Cardio")
    };
}
