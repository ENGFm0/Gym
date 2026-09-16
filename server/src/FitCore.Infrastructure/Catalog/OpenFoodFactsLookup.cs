using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FitCore.Application.Abstractions;
using FitCore.Domain.Entities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FitCore.Infrastructure.Catalog;

public sealed class FoodLookupOptions
{
    public const string SectionName = "Foods";

    /// <summary>Off by default: turning it on sends scanned barcodes to a third party.</summary>
    public bool ExternalLookup { get; set; }

    public string BaseUrl { get; set; } = "https://world.openfoodfacts.org";

    /// <summary>Open Food Facts asks every client to identify itself; anonymous traffic gets throttled.</summary>
    public string UserAgent { get; set; } = "FitCore/1.0 (support@fitcore.app)";

    public int TimeoutSeconds { get; set; } = 6;
}

/// <summary>
/// Open Food Facts, the open product database. Nutrition there is per 100 g or 100 ml, which is
/// the same shape our catalog uses, so a hit can be stored as an ordinary food and never
/// looked up again.
/// </summary>
public sealed class OpenFoodFactsLookup(
    HttpClient http,
    IOptions<FoodLookupOptions> options,
    ILogger<OpenFoodFactsLookup> log) : IBarcodeLookup
{
    private readonly FoodLookupOptions _options = options.Value;

    public async Task<FoodItem?> FindAsync(string barcode, CancellationToken ct = default)
    {
        if (!_options.ExternalLookup) return null;
        if (string.IsNullOrWhiteSpace(barcode) || !barcode.All(char.IsDigit)) return null;

        try
        {
            var url = $"/api/v2/product/{barcode}.json"
                    + "?fields=product_name,product_name_ar,brands,quantity,serving_quantity,nutriments";

            var response = await http.GetAsync(url, ct);
            if (!response.IsSuccessStatusCode) return null;

            var payload = await response.Content.ReadFromJsonAsync<OffResponse>(cancellationToken: ct);
            if (payload?.Status != 1 || payload.Product is null) return null;

            var product = payload.Product;
            var nutriments = product.Nutriments ?? new Dictionary<string, JsonElement>();

            double Read(params string[] keys)
            {
                foreach (var key in keys)
                {
                    if (!nutriments.TryGetValue(key, out var value)) continue;
                    if (value.ValueKind == JsonValueKind.Number) return value.GetDouble();
                    if (value.ValueKind == JsonValueKind.String && double.TryParse(value.GetString(), out var parsed))
                        return parsed;
                }
                return 0;
            }

            var calories = Read("energy-kcal_100g");
            if (calories <= 0)
            {
                // Some entries only carry kilojoules.
                var kj = Read("energy_100g", "energy-kj_100g");
                calories = kj > 0 ? Math.Round(kj / 4.184) : 0;
            }

            if (calories <= 0) return null; // an entry with no energy is not worth logging

            var name = string.IsNullOrWhiteSpace(product.NameAr) ? product.Name : product.NameAr;
            if (string.IsNullOrWhiteSpace(name)) return null;

            var brand = product.Brands?.Split(',').FirstOrDefault()?.Trim();

            return new FoodItem
            {
                Id = "off" + barcode,
                NameAr = string.IsNullOrWhiteSpace(brand) ? name : $"{name} — {brand}",
                NameEn = string.IsNullOrWhiteSpace(product.Name) ? name : product.Name,
                Unit = "جم",
                BaseAmount = 100,
                Calories = Math.Round(calories, 1),
                Protein = Math.Round(Read("proteins_100g"), 1),
                Carbs = Math.Round(Read("carbohydrates_100g"), 1),
                Fat = Math.Round(Read("fat_100g"), 1),
                Barcode = barcode,
                Brand = brand
            };
        }
        catch (Exception e) when (e is HttpRequestException or TaskCanceledException or JsonException)
        {
            // A lookup that fails is a miss, not an error the member should see.
            log.LogDebug(e, "Barcode {Barcode} could not be looked up", barcode);
            return null;
        }
    }

    private sealed class OffResponse
    {
        [JsonPropertyName("status")] public int Status { get; set; }
        [JsonPropertyName("product")] public OffProduct? Product { get; set; }
    }

    private sealed class OffProduct
    {
        [JsonPropertyName("product_name")] public string? Name { get; set; }
        [JsonPropertyName("product_name_ar")] public string? NameAr { get; set; }
        [JsonPropertyName("brands")] public string? Brands { get; set; }
        [JsonPropertyName("quantity")] public string? Quantity { get; set; }
        [JsonPropertyName("nutriments")] public Dictionary<string, JsonElement>? Nutriments { get; set; }
    }
}
