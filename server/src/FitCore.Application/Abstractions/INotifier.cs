namespace FitCore.Application.Abstractions;

/// <summary>One push, to one member's devices.</summary>
public sealed record PushMessage(string TitleAr, string BodyAr, string TitleEn, string BodyEn, string? Route = null);

public interface INotifier
{
    /// <summary>Sends to every device the member registered. A dead token is dropped, not retried.</summary>
    Task SendAsync(string uid, PushMessage message, CancellationToken ct = default);
}

/// <summary>Used when push is not configured, so nothing in the app has to check first.</summary>
public sealed class NoNotifier : INotifier
{
    public Task SendAsync(string uid, PushMessage message, CancellationToken ct = default) => Task.CompletedTask;
}

/// <summary>Where a member's device tokens live.</summary>
public interface IDeviceRepository
{
    Task<IReadOnlyList<string>> GetTokensAsync(string uid, CancellationToken ct = default);
    Task AddTokenAsync(string uid, string token, string? platform, string? lang, CancellationToken ct = default);
    Task RemoveTokenAsync(string uid, string token, CancellationToken ct = default);
    Task<string?> GetLangAsync(string uid, CancellationToken ct = default);
}

/// <summary>Counts what a member has used of something metered, per day.</summary>
public interface IQuotaRepository
{
    Task<int> GetAsync(string uid, string key, DateOnly day, CancellationToken ct = default);
    Task<int> IncrementAsync(string uid, string key, DateOnly day, CancellationToken ct = default);
}
