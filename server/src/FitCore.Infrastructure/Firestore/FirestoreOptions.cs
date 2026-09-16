namespace FitCore.Infrastructure.Firestore;

public sealed class FirebaseOptions
{
    public const string SectionName = "Firebase";

    /// <summary>The Firebase project id — also the audience of the ID tokens the app sends.</summary>
    public string ProjectId { get; set; } = string.Empty;

    /// <summary>Optional inline service account JSON. Leave empty to use GOOGLE_APPLICATION_CREDENTIALS.</summary>
    public string? CredentialsJson { get; set; }

    /// <summary>Cloud Storage bucket for progress photos, e.g. my-project.appspot.com.</summary>
    public string StorageBucket { get; set; } = string.Empty;

    /// <summary>How long an upload or read link stays valid.</summary>
    public int SignedUrlMinutes { get; set; } = 15;
}
