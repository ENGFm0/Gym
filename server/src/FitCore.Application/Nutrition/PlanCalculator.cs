using FitCore.Application.Catalogs;
using FitCore.Domain.Common;
using FitCore.Domain.Entities;
using FitCore.Domain.ValueObjects;

namespace FitCore.Application.Nutrition;

/// <summary>
/// Mifflin-St Jeor for the BMR, a PAL factor for the spend, and a deficit or surplus
/// driven by the pace the member chose. The app never computes this on the client.
/// </summary>
public static class PlanCalculator
{
    private const int MinimumCalories = 1200;

    public static double PalFor(ActivityLevel level) => level switch
    {
        ActivityLevel.Moderate => 1.55,
        ActivityLevel.High => 1.725,
        _ => 1.375
    };

    public static NutritionPlan For(UserProfile profile, DateOnly today)
    {
        var weight = profile.WeightKg > 0 ? profile.WeightKg : 81.4;
        var height = profile.HeightCm > 0 ? profile.HeightCm : 178;
        var age = profile.AgeOn(today) ?? 29;

        var bmr = 10 * weight + 6.25 * height - 5 * age + (profile.Gender == Gender.Female ? -161 : 5);
        var tdee = bmr * PalFor(profile.Activity);

        var pace = Math.Clamp(profile.PaceKgPerWeek, 0.1, 1.0);
        var delta = profile.Goal switch
        {
            Goal.Bulking => Math.Round(pace * 1000),
            Goal.Maintenance => 0,
            Goal.Recomp => -250,
            _ => -Math.Round(pace * 1000)
        };

        var calories = Math.Max(MinimumCalories, (int)(Math.Round((tdee + delta) / 10) * 10));
        var diet = DietCatalog.Find(profile.DietId);

        var macros = new MacroTargets(
            Protein: (int)Math.Round(calories * diet.Split.Protein / 4),
            Carbs: (int)Math.Round(calories * diet.Split.Carbs / 4),
            Fat: (int)Math.Round(calories * diet.Split.Fat / 9));

        return new NutritionPlan((int)Math.Round(bmr), (int)Math.Round(tdee), calories, macros, diet.Id);
    }

    /// <summary>Body mass index and the band it falls in.</summary>
    public static (double Bmi, string BandAr, string BandEn) Bmi(double weightKg, double heightCm)
    {
        if (heightCm <= 0) return (0, "—", "—");
        var metres = heightCm / 100.0;
        var bmi = Math.Round(weightKg / (metres * metres), 1);
        return bmi switch
        {
            < 18.5 => (bmi, "نحافة", "Underweight"),
            < 25 => (bmi, "وزن طبيعي", "Healthy"),
            < 30 => (bmi, "زيادة وزن", "Overweight"),
            _ => (bmi, "سمنة", "Obese")
        };
    }
}
