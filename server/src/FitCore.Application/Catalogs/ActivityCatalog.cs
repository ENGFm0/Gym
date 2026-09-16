using FitCore.Domain.Common;

namespace FitCore.Application.Catalogs;

public sealed record ActivityDefinition(
    string Id,
    string NameAr,
    string NameEn,
    double Met,
    ActivityUnit Unit,
    string Icon);

/// <summary>Training is not iron only: this is the library a member picks from.</summary>
public static class ActivityCatalog
{
    public static readonly IReadOnlyList<ActivityDefinition> All = new List<ActivityDefinition>
    {
        new("gym",   "حديد",         "Weights",   5.0, ActivityUnit.Session, "fitness_center"),
        new("run",   "ركض",          "Running",   9.8, ActivityUnit.Minutes, "directions_run"),
        new("walk",  "مشي",          "Walking",   3.5, ActivityUnit.Minutes, "directions_walk"),
        new("swim",  "سباحة",        "Swimming",  7.0, ActivityUnit.Minutes, "pool"),
        new("bike",  "دراجة",        "Cycling",   7.5, ActivityUnit.Minutes, "pedal_bike"),
        new("cross", "كروسفت",       "CrossFit",  8.0, ActivityUnit.Minutes, "sports_gymnastics"),
        new("box",   "ملاكمة",       "Boxing",    9.0, ActivityUnit.Minutes, "sports_mma"),
        new("foot",  "كرة قدم",      "Football",  7.0, ActivityUnit.Minutes, "sports_soccer"),
        new("pad",   "بادل / تنس",   "Padel",     6.5, ActivityUnit.Minutes, "sports_tennis"),
        new("yoga",  "يوغا / إطالة", "Yoga",      3.0, ActivityUnit.Minutes, "self_improvement"),
        new("row",   "تجديف",        "Rowing",    7.0, ActivityUnit.Minutes, "rowing"),
        new("hike",  "هايكنق",       "Hiking",    6.0, ActivityUnit.Minutes, "hiking")
    };

    public static ActivityDefinition? Find(string id) =>
        All.FirstOrDefault(a => string.Equals(a.Id, id, StringComparison.OrdinalIgnoreCase));
}
