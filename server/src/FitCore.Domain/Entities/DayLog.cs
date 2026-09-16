using FitCore.Domain.Common;
using FitCore.Domain.ValueObjects;

namespace FitCore.Domain.Entities;

/// <summary>One logged item inside a meal. The nutrition is copied in, so editing the catalog never rewrites history.</summary>
public sealed class MealEntry
{
    public string Id { get; set; } = Guid.NewGuid().ToString("n");
    public string? FoodId { get; set; }
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string Unit { get; set; } = "جم";
    public double BaseAmount { get; set; } = 100;
    public double Quantity { get; set; } = 100;
    public double Calories { get; set; }
    public double Protein { get; set; }
    public double Carbs { get; set; }
    public double Fat { get; set; }
    public DateTime LoggedAtUtc { get; set; } = DateTime.UtcNow;

    private double Factor => BaseAmount <= 0 ? 0 : Quantity / BaseAmount;

    public NutritionTotals Totals() => new(
        Calories * Factor, Protein * Factor, Carbs * Factor, Fat * Factor);
}

/// <summary>A single day: what was eaten, how much water, and the steps the phone counted.</summary>
public sealed class DayLog
{
    public DateOnly Date { get; set; }
    public Dictionary<MealSlot, List<MealEntry>> Meals { get; set; } = new()
    {
        [MealSlot.Breakfast] = new(),
        [MealSlot.Lunch] = new(),
        [MealSlot.Snack] = new(),
        [MealSlot.Dinner] = new()
    };

    public int Steps { get; set; }
    public double WaterLitres { get; set; }

    public List<MealEntry> Slot(MealSlot slot)
    {
        if (!Meals.TryGetValue(slot, out var list))
        {
            list = new List<MealEntry>();
            Meals[slot] = list;
        }
        return list;
    }

    public NutritionTotals Totals()
    {
        var sum = NutritionTotals.Zero;
        foreach (var entries in Meals.Values)
            foreach (var entry in entries)
                sum = sum.Add(entry.Totals());
        return sum;
    }

    public NutritionTotals TotalsFor(MealSlot slot)
    {
        var sum = NutritionTotals.Zero;
        foreach (var entry in Slot(slot)) sum = sum.Add(entry.Totals());
        return sum;
    }
}
