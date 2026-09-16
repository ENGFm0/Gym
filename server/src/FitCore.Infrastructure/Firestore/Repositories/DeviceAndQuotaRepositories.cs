using FitCore.Application.Abstractions;
using Google.Cloud.Firestore;

namespace FitCore.Infrastructure.Firestore.Repositories;

[FirestoreData]
internal sealed class DeviceDocument
{
    [FirestoreProperty("token")] public string Token { get; set; } = string.Empty;
    [FirestoreProperty("platform")] public string? Platform { get; set; }
    [FirestoreProperty("lang")] public string? Lang { get; set; }
    [FirestoreProperty("at")] public Timestamp At { get; set; }
}

public sealed class FirestoreDeviceRepository(FirestoreDb db) : IDeviceRepository
{
    private static CollectionReference Devices(FirestoreDb db, string uid) =>
        Paths.User(db, uid).Collection("devices");

    /// <summary>The token is the document id, so registering the same device twice is one write.</summary>
    private static string Key(string token) =>
        Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(token)).Replace('/', '_').Replace('+', '-')[..Math.Min(120, token.Length + 4)];

    public async Task<IReadOnlyList<string>> GetTokensAsync(string uid, CancellationToken ct = default)
    {
        var snapshot = await Devices(db, uid).Limit(20).GetSnapshotAsync(ct);
        return snapshot.Documents.Select(d => d.ConvertTo<DeviceDocument>().Token).Where(t => t.Length > 0).ToList();
    }

    public Task AddTokenAsync(string uid, string token, string? platform, string? lang, CancellationToken ct = default) =>
        Devices(db, uid).Document(Key(token)).SetAsync(new DeviceDocument
        {
            Token = token,
            Platform = platform,
            Lang = lang,
            At = Timestamp.FromDateTime(DateTime.UtcNow)
        }, SetOptions.Overwrite, ct);

    public Task RemoveTokenAsync(string uid, string token, CancellationToken ct = default) =>
        Devices(db, uid).Document(Key(token)).DeleteAsync(cancellationToken: ct);

    public async Task<string?> GetLangAsync(string uid, CancellationToken ct = default)
    {
        var snapshot = await Devices(db, uid).Limit(1).GetSnapshotAsync(ct);
        return snapshot.Documents.FirstOrDefault()?.ConvertTo<DeviceDocument>().Lang;
    }
}

[FirestoreData]
internal sealed class QuotaDocument
{
    [FirestoreProperty("used")] public int Used { get; set; }
    [FirestoreProperty("day")] public string Day { get; set; } = string.Empty;
}

/// <summary>
/// A per-day counter for the endpoints that cost money. It is a transaction, because two
/// phones tapping at once must not both read the same number.
/// </summary>
public sealed class FirestoreQuotaRepository(FirestoreDb db) : IQuotaRepository
{
    private static DocumentReference Doc(FirestoreDb db, string uid, string key, DateOnly day) =>
        Paths.User(db, uid).Collection("quota").Document($"{key}-{day:yyyy-MM-dd}");

    public async Task<int> GetAsync(string uid, string key, DateOnly day, CancellationToken ct = default)
    {
        var snapshot = await Doc(db, uid, key, day).GetSnapshotAsync(ct);
        return snapshot.Exists ? snapshot.ConvertTo<QuotaDocument>().Used : 0;
    }

    public Task<int> IncrementAsync(string uid, string key, DateOnly day, CancellationToken ct = default)
    {
        var reference = Doc(db, uid, key, day);
        return db.RunTransactionAsync(async transaction =>
        {
            var snapshot = await transaction.GetSnapshotAsync(reference, ct);
            var used = snapshot.Exists ? snapshot.ConvertTo<QuotaDocument>().Used : 0;
            var next = used + 1;

            transaction.Set(reference, new QuotaDocument { Used = next, Day = day.ToString("yyyy-MM-dd") });
            return next;
        }, cancellationToken: ct);
    }
}
