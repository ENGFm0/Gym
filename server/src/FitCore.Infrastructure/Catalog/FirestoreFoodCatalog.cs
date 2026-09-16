using FitCore.Application.Abstractions;
using FitCore.Domain.Entities;
using FitCore.Infrastructure.Firestore;
using FitCore.Infrastructure.Firestore.Documents;
using Google.Cloud.Firestore;

namespace FitCore.Infrastructure.Catalog;

/// <summary>
/// Firestore has no LIKE, so every food carries a prefix token array and search is an
/// array-contains on the lowercased query. Custom items are visible to their owner only.
/// </summary>
public sealed class FirestoreFoodCatalog(FirestoreDb db) : IFoodCatalog
{
    public async Task<IReadOnlyList<FoodItem>> SearchAsync(string? query, string uid, int limit = 40, CancellationToken ct = default)
    {
        var foods = db.Collection(Paths.Foods);

        if (string.IsNullOrWhiteSpace(query))
        {
            var top = await foods.WhereEqualTo("ownerUid", null).Limit(limit).GetSnapshotAsync(ct);
            var mine = await foods.WhereEqualTo("ownerUid", uid).Limit(limit).GetSnapshotAsync(ct);
            return top.Documents.Concat(mine.Documents)
                .Select(d => Mapping.ToFood(d.Id, d.ConvertTo<FoodDocument>()))
                .ToList();
        }

        var token = query.Trim().ToLowerInvariant();
        if (token.Length > 8) token = token[..8];

        var shared = await foods.WhereArrayContains("search", token).Limit(limit).GetSnapshotAsync(ct);
        return shared.Documents
            .Select(d => Mapping.ToFood(d.Id, d.ConvertTo<FoodDocument>()))
            .Where(f => f.OwnerUid is null || f.OwnerUid == uid)
            .ToList();
    }

    public async Task<FoodItem?> GetAsync(string id, string uid, CancellationToken ct = default)
    {
        var snapshot = await db.Collection(Paths.Foods).Document(id).GetSnapshotAsync(ct);
        if (!snapshot.Exists) return null;

        var food = Mapping.ToFood(snapshot.Id, snapshot.ConvertTo<FoodDocument>());
        return food.OwnerUid is null || food.OwnerUid == uid ? food : null;
    }

    public async Task<FoodItem?> FindByBarcodeAsync(string barcode, CancellationToken ct = default)
    {
        var snapshot = await db.Collection(Paths.Foods)
            .WhereEqualTo("barcode", barcode).Limit(1).GetSnapshotAsync(ct);

        var doc = snapshot.Documents.FirstOrDefault();
        return doc is null ? null : Mapping.ToFood(doc.Id, doc.ConvertTo<FoodDocument>());
    }

    public async Task<FoodItem> AddCustomAsync(FoodItem item, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(item.Id)) item.Id = "u" + Guid.NewGuid().ToString("n")[..10];
        await db.Collection(Paths.Foods).Document(item.Id).SetAsync(Mapping.FromFood(item), SetOptions.Overwrite, ct);
        return item;
    }

    /// <summary>Writes the shipped catalog on first run. Existing documents are left alone.</summary>
    public static async Task EnsureSeededAsync(FirestoreDb db, CancellationToken ct = default)
    {
        var probe = await db.Collection(Paths.Foods).Limit(1).GetSnapshotAsync(ct);
        if (probe.Count > 0) return;

        var batch = db.StartBatch();
        foreach (var food in SeedFoods.All)
            batch.Set(db.Collection(Paths.Foods).Document(food.Id), Mapping.FromFood(food));

        await batch.CommitAsync(ct);
    }
}
