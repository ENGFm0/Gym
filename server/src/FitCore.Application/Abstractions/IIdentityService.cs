namespace FitCore.Application.Abstractions;

/// <summary>Custom claims on the Firebase user — the coach flag the API authorises against.</summary>
public interface IIdentityService
{
    Task SetCoachAsync(string uid, bool isCoach, CancellationToken ct = default);
}
