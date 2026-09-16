using FitCore.Application.Abstractions;
using FitCore.Infrastructure.Firestore;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Storage.V1;
using Microsoft.Extensions.Options;

namespace FitCore.Infrastructure.Storage;

/// <summary>
/// Progress photos never pass through the API: the browser uploads straight to the bucket with a
/// short lived signed URL, and Firestore only keeps the object path.
/// </summary>
public sealed class FirebasePhotoStorage : IPhotoStorage
{
    private readonly FirebaseOptions _options;
    private readonly UrlSigner _signer;
    private readonly StorageClient _storage;

    public FirebasePhotoStorage(IOptions<FirebaseOptions> options)
    {
        _options = options.Value;

        var credential = FirebaseCredentials.Resolve(_options.CredentialsJson);

        _signer = UrlSigner.FromCredential(credential);
        _storage = StorageClient.Create(credential);
    }

    public Task<(string UploadUrl, string StoragePath)> CreateUploadUrlAsync(
        string uid, string contentType, CancellationToken ct = default)
    {
        var extension = contentType switch
        {
            "image/png" => "png",
            "image/webp" => "webp",
            _ => "jpg"
        };

        var path = $"progress/{uid}/{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():n}.{extension}";

        var url = _signer.Sign(
            _options.StorageBucket,
            path,
            TimeSpan.FromMinutes(_options.SignedUrlMinutes),
            HttpMethod.Put);

        return Task.FromResult((url, path));
    }

    public Task<string> CreateReadUrlAsync(string storagePath, CancellationToken ct = default)
    {
        var url = _signer.Sign(
            _options.StorageBucket,
            storagePath,
            TimeSpan.FromMinutes(_options.SignedUrlMinutes),
            HttpMethod.Get);

        return Task.FromResult(url);
    }

    public async Task DeleteAsync(string storagePath, CancellationToken ct = default)
    {
        try
        {
            await _storage.DeleteObjectAsync(_options.StorageBucket, storagePath, cancellationToken: ct);
        }
        catch (Google.GoogleApiException e) when (e.HttpStatusCode == System.Net.HttpStatusCode.NotFound)
        {
            // Already gone: deleting the row is what matters.
        }
    }
}
