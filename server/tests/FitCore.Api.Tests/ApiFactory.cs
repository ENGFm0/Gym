using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Encodings.Web;
using FitCore.Application.Abstractions;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FitCore.Api.Tests;

/// <summary>
/// Runs the real API — its controllers, services, maths and validation — against in-memory
/// stores, and signs requests with a test scheme instead of a Firebase token. What is faked is
/// the database and the identity provider; everything the app actually does is real.
/// </summary>
public sealed class ApiFactory : WebApplicationFactory<Program>
{
    public FakeUsers Users { get; } = new();
    public FakeDiary Diary { get; } = new();
    public FakeProgress Progress { get; } = new();
    public FakeTraining Training { get; } = new();
    public FakeCoaches Coaches { get; } = new();
    public FakeFoods Foods { get; } = new();
    public FakeDevices Devices { get; } = new();
    public FakeQuota Quota { get; } = new();
    public FakeNotifier Notifier { get; } = new();
    public FakeIdentity Identity { get; } = new();
    public FakePhotos Photos { get; } = new();
    public FakeScanner Scanner { get; } = new();
    public TestClock Clock { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration(configuration =>
        {
            configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                // Set so infrastructure registration does not refuse to start; nothing reaches Firestore.
                ["Firebase:ProjectId"] = "fitcore-tests",
                ["Firebase:StorageBucket"] = "fitcore-tests.appspot.com",
                ["Jobs:Secret"] = "test-secret",
                ["Foods:ExternalLookup"] = "false"
            });
        });

        builder.ConfigureServices(services =>
        {
            Replace<IUserRepository>(services, Users);
            Replace<IDiaryRepository>(services, Diary);
            Replace<IProgressRepository>(services, Progress);
            Replace<ITrainingRepository>(services, Training);
            Replace<ICoachRepository>(services, Coaches);
            Replace<IFoodCatalog>(services, Foods);
            Replace<IDeviceRepository>(services, Devices);
            Replace<IQuotaRepository>(services, Quota);
            Replace<INotifier>(services, Notifier);
            Replace<IIdentityService>(services, Identity);
            Replace<IPhotoStorage>(services, Photos);
            Replace<IInBodyScanner>(services, Scanner);
            Replace<IClock>(services, Clock);

            // Sign in with a header instead of a Firebase token.
            services.AddAuthentication(TestAuth.Scheme)
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuth.Scheme, _ => { });

            services.PostConfigure<AuthenticationOptions>(options =>
            {
                options.DefaultAuthenticateScheme = TestAuth.Scheme;
                options.DefaultChallengeScheme = TestAuth.Scheme;
            });
        });
    }

    private static void Replace<T>(IServiceCollection services, T instance) where T : class
    {
        services.RemoveAll<T>();
        services.AddSingleton(instance);
    }

    /// <summary>A client that acts as one member.</summary>
    public HttpClient ClientFor(string uid, string? email = null, bool coach = false)
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(TestAuth.Scheme);
        client.DefaultRequestHeaders.Add(TestAuth.UidHeader, uid);
        if (email is not null) client.DefaultRequestHeaders.Add(TestAuth.EmailHeader, email);
        if (coach) client.DefaultRequestHeaders.Add(TestAuth.CoachHeader, "true");
        return client;
    }
}

public static class TestAuth
{
    public const string Scheme = "Test";
    public const string UidHeader = "X-Test-Uid";
    public const string EmailHeader = "X-Test-Email";
    public const string CoachHeader = "X-Test-Coach";
}

public sealed class TestAuthHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(TestAuth.UidHeader, out var uid))
            return Task.FromResult(AuthenticateResult.NoResult());

        var claims = new List<Claim>
        {
            new("user_id", uid.ToString()),
            new(ClaimTypes.NameIdentifier, uid.ToString())
        };

        if (Request.Headers.TryGetValue(TestAuth.EmailHeader, out var email))
            claims.Add(new Claim("email", email.ToString()));

        if (Request.Headers.TryGetValue(TestAuth.CoachHeader, out var coach) && coach == "true")
            claims.Add(new Claim("coach", "true"));

        var ticket = new AuthenticationTicket(
            new ClaimsPrincipal(new ClaimsIdentity(claims, TestAuth.Scheme)), TestAuth.Scheme);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
