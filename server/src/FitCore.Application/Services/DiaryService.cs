using FitCore.Application.Abstractions;
using FitCore.Application.Contracts;
using FitCore.Application.Training;
using FitCore.Domain.Common;
using FitCore.Domain.Entities;
using FitCore.Domain.ValueObjects;

namespace FitCore.Application.Services;

public sealed class DiaryService(
    IDiaryRepository diary,
    IFoodCatalog foods,
    ITrainingRepository training,
    ProfileService profiles,
    IClock clock)
{
    public async Task<DayDto> GetDayAsync(string uid, DateOnly date, CancellationToken ct = default)
    {
        var profile = await profiles.GetOrCreateAsync(uid, null, null, ct);
        var day = await diary.GetDayAsync(uid, date, ct);
        var plan = profiles.PlanFor(profile);

        var from = date.ToDateTime(TimeOnly.MinValue).ToUniversalTime();
        var sessions = await training.GetSessionsAsync(uid, from, 40, ct);
        var sessionBurn = sessions
            .Where(s => DateOnly.FromDateTime(s.PerformedAtUtc) == date)
            .Sum(s => s.Calories);

        var burned = sessionBurn + MetCalculator.StepBurn(day.Steps);
        var totals = day.Totals().Rounded();

        var meals = Enum.GetValues<MealSlot>()
            .Select(slot => new MealDto(
                slot.ToString().ToLowerInvariant(),
                day.Slot(slot).Select(Map).ToList(),
                ToDto(day.TotalsFor(slot).Rounded())))
            .ToList();

        return new DayDto(
            date, meals, ToDto(totals), plan, day.Steps, day.WaterLitres, burned,
            Math.Round(plan.Calories - totals.Calories + burned));
    }

    public async Task<DayDto> AddEntryAsync(string uid, DateOnly date, AddMealEntryRequest request, CancellationToken ct = default)
    {
        var slot = ParseSlot(request.Slot);
        var day = await diary.GetDayAsync(uid, date, ct);

        MealEntry entry;
        if (!string.IsNullOrWhiteSpace(request.FoodId))
        {
            var food = await foods.GetAsync(request.FoodId!, uid, ct)
                       ?? throw new KeyNotFoundException($"Unknown food '{request.FoodId}'.");
            entry = new MealEntry
            {
                FoodId = food.Id,
                NameAr = food.NameAr,
                NameEn = food.NameEn,
                Unit = food.Unit,
                BaseAmount = food.BaseAmount,
                Quantity = request.Quantity > 0 ? request.Quantity : food.BaseAmount,
                Calories = food.Calories,
                Protein = food.Protein,
                Carbs = food.Carbs,
                Fat = food.Fat
            };
        }
        else
        {
            // A typed-in item: one serving, nutrition exactly as entered.
            entry = new MealEntry
            {
                NameAr = request.NameAr ?? "صنف يدوي",
                NameEn = request.NameEn ?? request.NameAr ?? "Custom item",
                Unit = request.Unit ?? "حصة",
                BaseAmount = 1,
                Quantity = request.Quantity > 0 ? request.Quantity : 1,
                Calories = request.Calories ?? 0,
                Protein = request.Protein ?? 0,
                Carbs = request.Carbs ?? 0,
                Fat = request.Fat ?? 0
            };
        }

        entry.LoggedAtUtc = clock.UtcNow;
        day.Slot(slot).Add(entry);
        await diary.SaveDayAsync(uid, day, ct);
        return await GetDayAsync(uid, date, ct);
    }

    public async Task<DayDto> RemoveEntryAsync(string uid, DateOnly date, string entryId, CancellationToken ct = default)
    {
        var day = await diary.GetDayAsync(uid, date, ct);
        foreach (var slot in day.Meals.Keys.ToList())
            day.Meals[slot].RemoveAll(e => e.Id == entryId);

        await diary.SaveDayAsync(uid, day, ct);
        return await GetDayAsync(uid, date, ct);
    }

    /// <summary>Steps come from the phone's pedometer; the manual path is a fallback and is capped.</summary>
    public async Task<DayDto> PatchAsync(string uid, DateOnly date, PatchDayRequest request, CancellationToken ct = default)
    {
        var day = await diary.GetDayAsync(uid, date, ct);
        if (request.Steps is not null) day.Steps = Math.Clamp(request.Steps.Value, 0, 200_000);
        if (request.WaterLitres is not null) day.WaterLitres = Math.Clamp(Math.Round(request.WaterLitres.Value, 2), 0, 20);
        await diary.SaveDayAsync(uid, day, ct);
        return await GetDayAsync(uid, date, ct);
    }

    public static MealSlot ParseSlot(string slot) =>
        Enum.TryParse<MealSlot>(slot, true, out var parsed) ? parsed : MealSlot.Lunch;

    private static MealEntryDto Map(MealEntry e) => new(
        e.Id, e.FoodId, e.NameAr, e.NameEn, e.Unit, e.BaseAmount, e.Quantity,
        e.Calories, e.Protein, e.Carbs, e.Fat);

    private static TotalsDto ToDto(NutritionTotals t) =>
        new(t.Calories, t.Protein, t.Carbs, t.Fat);
}
