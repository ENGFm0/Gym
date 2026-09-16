namespace FitCore.Domain.ValueObjects;

/// <summary>Grams of each macro for a day.</summary>
public sealed record MacroTargets(int Protein, int Carbs, int Fat);

/// <summary>Everything the calculator derives from a profile: the numbers the app shows.</summary>
public sealed record NutritionPlan(
    int Bmr,
    int Tdee,
    int Calories,
    MacroTargets Macros,
    string DietId);

/// <summary>What a member actually ate, summed.</summary>
public sealed record NutritionTotals(double Calories, double Protein, double Carbs, double Fat)
{
    public static readonly NutritionTotals Zero = new(0, 0, 0, 0);

    public NutritionTotals Add(NutritionTotals other) => new(
        Calories + other.Calories,
        Protein + other.Protein,
        Carbs + other.Carbs,
        Fat + other.Fat);

    public NutritionTotals Rounded() => new(
        Math.Round(Calories), Math.Round(Protein), Math.Round(Carbs), Math.Round(Fat));
}
