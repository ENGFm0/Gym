namespace FitCore.Domain.Entities;

/// <summary>A catalog item: nutrition per <see cref="BaseAmount"/> of <see cref="Unit"/>.</summary>
public sealed class FoodItem
{
    public string Id { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string Unit { get; set; } = "جم";
    public double BaseAmount { get; set; } = 100;
    public double Calories { get; set; }
    public double Protein { get; set; }
    public double Carbs { get; set; }
    public double Fat { get; set; }
    public string? Barcode { get; set; }
    public string? Brand { get; set; }
    /// <summary>Null for the shared catalog, a uid for a member's own custom item.</summary>
    public string? OwnerUid { get; set; }
}
