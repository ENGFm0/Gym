using Google.Apis.Auth.OAuth2;

namespace FitCore.Infrastructure;

/// <summary>
/// One place that turns configuration into a credential, so the three clients that need one
/// cannot drift apart.
/// </summary>
internal static class FirebaseCredentials
{
    /// <summary>
    /// The service-account key from configuration. What the setup script writes and what
    /// <c>Firebase:CredentialsJson</c> is documented to hold is a service account, so that is what
    /// this reads; anything else fails loudly here rather than at the first call.
    /// </summary>
    public static GoogleCredential FromJson(string json) =>
        CredentialFactory.FromJson<ServiceAccountCredential>(json).ToGoogleCredential();

    /// <summary>On Cloud Run there is no key to carry: the runtime service account is the credential.</summary>
    public static GoogleCredential Resolve(string? json) =>
        string.IsNullOrWhiteSpace(json) ? GoogleCredential.GetApplicationDefault() : FromJson(json);
}
