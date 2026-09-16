using FitCore.Application.Abstractions;
using FitCore.Infrastructure.Catalog;
using System.Net.Http.Headers;
using FitCore.Infrastructure.Firestore;
using FitCore.Infrastructure.Firestore.Repositories;
using FitCore.Infrastructure.Identity;
using FitCore.Infrastructure.Notifications;
using FitCore.Infrastructure.Scanning;
using FitCore.Infrastructure.Storage;
using Google.Cloud.Firestore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace FitCore.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddFitCoreInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<FirebaseOptions>(configuration.GetSection(FirebaseOptions.SectionName));
        services.Configure<ClaudeOptions>(configuration.GetSection(ClaudeOptions.SectionName));
        services.Configure<FoodLookupOptions>(configuration.GetSection(FoodLookupOptions.SectionName));

        services.AddSingleton(sp =>
        {
            var options = sp.GetRequiredService<IOptions<FirebaseOptions>>().Value;
            if (string.IsNullOrWhiteSpace(options.ProjectId))
                throw new InvalidOperationException("Firebase:ProjectId is not configured.");

            var builder = new FirestoreDbBuilder { ProjectId = options.ProjectId };
            // Left unset without a key so the builder finds the ambient credentials itself,
            // which is how it runs on Cloud Run.
            if (!string.IsNullOrWhiteSpace(options.CredentialsJson))
                builder.GoogleCredential = FirebaseCredentials.FromJson(options.CredentialsJson);

            return builder.Build();
        });

        services.AddScoped<IUserRepository, FirestoreUserRepository>();
        services.AddScoped<IDiaryRepository, FirestoreDiaryRepository>();
        services.AddScoped<IProgressRepository, FirestoreProgressRepository>();
        services.AddScoped<ITrainingRepository, FirestoreTrainingRepository>();
        services.AddScoped<ICoachRepository, FirestoreCoachRepository>();
        services.AddScoped<IFoodCatalog, FirestoreFoodCatalog>();

        var foods = configuration.GetSection(FoodLookupOptions.SectionName).Get<FoodLookupOptions>() ?? new();
        if (foods.ExternalLookup)
        {
            services.AddHttpClient<IBarcodeLookup, OpenFoodFactsLookup>(client =>
            {
                client.BaseAddress = new Uri(foods.BaseUrl);
                client.Timeout = TimeSpan.FromSeconds(foods.TimeoutSeconds);
                client.DefaultRequestHeaders.UserAgent.ParseAdd(foods.UserAgent);
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            });
        }
        else
        {
            services.AddSingleton<IBarcodeLookup, NoBarcodeLookup>();
        }
        services.AddSingleton<IPhotoStorage, FirebasePhotoStorage>();
        services.AddSingleton<IIdentityService, FirebaseIdentityService>();
        services.AddSingleton<IInBodyScanner, ClaudeInBodyScanner>();
        services.AddScoped<IDeviceRepository, FirestoreDeviceRepository>();
        services.AddScoped<IQuotaRepository, FirestoreQuotaRepository>();
        services.AddScoped<INotifier, FirebaseNotifier>();

        return services;
    }

    /// <summary>Writes the shipped food catalog once, at startup.</summary>
    public static async Task SeedFoodCatalogAsync(this IServiceProvider services, CancellationToken ct = default)
    {
        var db = services.GetRequiredService<FirestoreDb>();
        await FirestoreFoodCatalog.EnsureSeededAsync(db, ct);
    }
}
