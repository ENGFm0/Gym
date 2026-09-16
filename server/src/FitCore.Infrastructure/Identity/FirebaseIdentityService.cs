using FirebaseAdmin;
using FirebaseAdmin.Auth;
using FitCore.Application.Abstractions;
using FitCore.Infrastructure.Firestore;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Options;

namespace FitCore.Infrastructure.Identity;

/// <summary>
/// Sets the coach claim on the Firebase user. The client has to refresh its ID token
/// once afterwards for the new claim to appear.
/// </summary>
public sealed class FirebaseIdentityService : IIdentityService
{
    private static readonly object Gate = new();
    private readonly FirebaseOptions _options;

    public FirebaseIdentityService(IOptions<FirebaseOptions> options)
    {
        _options = options.Value;
        EnsureApp();
    }

    private void EnsureApp()
    {
        if (FirebaseApp.DefaultInstance is not null) return;

        lock (Gate)
        {
            if (FirebaseApp.DefaultInstance is not null) return;

            FirebaseApp.Create(new AppOptions
            {
                ProjectId = _options.ProjectId,
                Credential = string.IsNullOrWhiteSpace(_options.CredentialsJson)
                    ? GoogleCredential.GetApplicationDefault()
                    : GoogleCredential.FromJson(_options.CredentialsJson)
            });
        }
    }

    public Task SetCoachAsync(string uid, bool isCoach, CancellationToken ct = default)
    {
        var claims = new Dictionary<string, object> { ["coach"] = isCoach };
        return FirebaseAuth.DefaultInstance.SetCustomUserClaimsAsync(uid, claims, ct);
    }

    public async Task DeleteUserAsync(string uid, CancellationToken ct = default)
    {
        try
        {
            await FirebaseAuth.DefaultInstance.DeleteUserAsync(uid, ct);
        }
        catch (FirebaseAuthException e) when (e.AuthErrorCode == AuthErrorCode.UserNotFound)
        {
            // Already gone: the data delete is what mattered.
        }
    }
}
