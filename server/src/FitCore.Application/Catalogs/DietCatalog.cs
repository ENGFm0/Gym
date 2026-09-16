using FitCore.Domain.ValueObjects;

namespace FitCore.Application.Catalogs;

public sealed record MacroSplit(double Fat, double Protein, double Carbs);

public sealed record DietDefinition(
    string Id,
    string NameAr,
    string NameEn,
    MacroSplit Split,
    string[] Eat,
    string[] Avoid);

/// <summary>The diets the app ships with, and the macro split each one implies.</summary>
public static class DietCatalog
{
    public static readonly IReadOnlyList<DietDefinition> All = new List<DietDefinition>
    {
        new("keto", "الكيتو دايت", "Keto", new MacroSplit(0.70, 0.25, 0.05),
            new[] { "لحوم وأسماك", "بيض", "زبدة وزيت زيتون", "أفوكادو", "جبن كامل الدسم", "خضار ورقي" },
            new[] { "أرز ومعكرونة", "خبز", "سكر وحلويات", "تمر وموز", "بطاطس" }),
        new("highprotein", "عالي البروتين", "High protein", new MacroSplit(0.28, 0.37, 0.35),
            new[] { "دجاج ولحم وسمك", "بيض وبياض بيض", "بروتين واي", "جبن قريش", "بقوليات" },
            new[] { "الكارب الفارغ", "المقليات اليومية", "العصائر بدل الوجبات" }),
        new("balanced", "متوازن", "Balanced", new MacroSplit(0.30, 0.30, 0.40),
            new[] { "كل المجموعات الغذائية", "بروتين بكل وجبة", "خضار في وجبتين" },
            new[] { "السكر المضاف اليومي", "المقليات المتكررة" }),
        new("mediterranean", "البحر المتوسط", "Mediterranean", new MacroSplit(0.35, 0.20, 0.45),
            new[] { "زيت زيتون", "أسماك", "بقوليات", "حبوب كاملة", "خضار وفواكه" },
            new[] { "اللحوم المصنعة", "السكر المضاف", "الخبز الأبيض" }),
        new("if", "صيام متقطع ١٦:٨", "Intermittent fasting", new MacroSplit(0.30, 0.30, 0.40),
            new[] { "كل الأصناف داخل النافذة", "بروتين بكل وجبة", "ماء وقهوة سادة أثناء الصيام" },
            new[] { "الأكل خارج النافذة", "العصائر أثناء الصيام" })
    };

    public static DietDefinition Find(string? id) =>
        All.FirstOrDefault(d => string.Equals(d.Id, id, StringComparison.OrdinalIgnoreCase))
        ?? All.First(d => d.Id == "balanced");
}
