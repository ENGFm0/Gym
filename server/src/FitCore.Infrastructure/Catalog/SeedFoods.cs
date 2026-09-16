using FitCore.Domain.Entities;

namespace FitCore.Infrastructure.Catalog;

/// <summary>
/// The catalog the app ships with: Saudi staples first, nutrition per <c>BaseAmount</c> of <c>Unit</c>.
/// It is written into Firestore on first run and can be extended from the console afterwards.
/// </summary>
public static class SeedFoods
{
    private sealed record Row(
        string Id, string NameAr, string NameEn, string Unit,
        double BaseAmount, double Calories, double Protein, double Carbs, double Fat);

    private static readonly Row[] Rows =
    {
        new("egg", "بيض", "Eggs", "حبة", 1, 90, 6, 0.3, 7.3),
        new("chick", "صدر دجاج مشوي", "Grilled chicken", "جم", 100, 165, 31, 0, 3.6),
        new("beef", "لحم بقري", "Beef", "جم", 100, 250, 26, 0, 16),
        new("salmon", "سلمون", "Salmon", "جم", 100, 208, 20, 0, 13),
        new("shrimp", "روبيان", "Shrimp", "جم", 100, 99, 24, 0.2, 0.3),
        new("tuna", "تونة بالماء", "Tuna", "علبة", 1, 110, 25, 0, 1),
        new("yog", "لبن يوناني", "Greek yogurt", "جم", 170, 100, 17, 6, 0),
        new("milk", "حليب", "Milk", "مل", 200, 104, 7, 10, 4),
        new("halou", "جبن حلوم", "Halloumi", "جم", 100, 325, 22, 2.5, 26),
        new("qareesh", "جبن قريش", "Cottage cheese", "جم", 100, 98, 11, 3.4, 4.3),
        new("rice", "أرز أبيض مطبوخ", "White rice", "جم", 100, 130, 2.7, 28, 0.3),
        new("kabsa", "كبسة دجاج", "Kabsa", "صحن", 1, 640, 34, 72, 22),
        new("shawrma", "شاورما دجاج", "Shawarma", "سندويتش", 1, 390, 24, 36, 16),
        new("bread", "خبز عربي", "Arabic bread", "رغيف", 1, 140, 5, 26, 1.5),
        new("oats", "شوفان", "Oats", "جم", 100, 389, 17, 66, 7),
        new("pasta", "معكرونة", "Pasta", "جم", 100, 158, 6, 31, 0.9),
        new("potato", "بطاطس مقلية", "Fries", "جم", 100, 312, 3.4, 41, 15),
        new("foul", "فول مدمس", "Foul", "صحن", 1, 270, 14, 34, 8),
        new("hummus", "حمص بالطحينة", "Hummus", "جم", 100, 177, 8, 14, 10),
        new("dates", "تمر", "Dates", "حبة", 1, 22, 0.2, 6, 0),
        new("banana", "موز", "Banana", "حبة", 1, 105, 1.3, 27, 0.4),
        new("apple", "تفاح", "Apple", "حبة", 1, 95, 0.5, 25, 0.3),
        new("avo", "أفوكادو", "Avocado", "جم", 100, 214, 2.6, 11, 20),
        new("almond", "لوز", "Almonds", "جم", 100, 579, 21, 22, 50),
        new("pb", "زبدة فول سوداني", "Peanut butter", "جم", 100, 588, 25, 20, 50),
        new("oil", "زيت زيتون", "Olive oil", "ملعقة", 1, 119, 0, 0, 13.5),
        new("butter", "زبدة", "Butter", "جم", 100, 717, 0.9, 0.1, 81),
        new("gsalad", "سلطة يونانية", "Greek salad", "حصة", 1, 310, 8, 10, 27),
        new("broc", "بروكلي", "Broccoli", "جم", 100, 35, 2.4, 7, 0.4),
        new("cucum", "خيار", "Cucumber", "جم", 100, 15, 0.7, 3.6, 0.1),
        new("whey", "بروتين واي", "Whey protein", "سكوب", 1, 120, 24, 3, 1.5),
        new("latte", "قهوة بحليب", "Latte", "كوب", 1, 150, 8, 14, 7),
        new("coffee", "قهوة سادة", "Black coffee", "فنجان", 1, 5, 0.2, 0.8, 0),
        new("burger", "برجر", "Burger", "وجبة", 1, 540, 28, 41, 29),
        new("pizza", "بيتزا", "Pizza slice", "قطعة", 1, 230, 10, 28, 9)
    };

    public static IReadOnlyList<FoodItem> All { get; } = Rows
        .Select(r => new FoodItem
        {
            Id = r.Id,
            NameAr = r.NameAr,
            NameEn = r.NameEn,
            Unit = r.Unit,
            BaseAmount = r.BaseAmount,
            Calories = r.Calories,
            Protein = r.Protein,
            Carbs = r.Carbs,
            Fat = r.Fat
        })
        .ToList();
}
