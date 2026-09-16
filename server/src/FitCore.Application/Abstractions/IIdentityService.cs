namespace FitCore.Application.Abstractions;

/// <summary>Custom claims on the Firebase user — the coach flag the API authorises against.</summary>
public interface IIdentityService
{
    Task SetCoachAsync(string uid, bool isCoach, CancellationToken ct = default);

    /// <summary>Removes the sign-in itself, so a deleted account cannot come back.</summary>
    Task DeleteUserAsync(string uid, CancellationToken ct = default);
}
