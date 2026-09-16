using FitCore.Application.Abstractions;
using FitCore.Infrastructure.Catalog;
using FitCore.Infrastructure.Firestore;
using FitCore.Infrastructure.Firestore.Repositories;
using FitCore.Infrastructure.Identity;
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

        services.AddSingleton(sp =>
        {
            var options = sp.GetRequiredService<IOptions<FirebaseOptions>>().Value;
            if (string.IsNullOrWhiteSpace(options.ProjectId))
                throw new InvalidOperationException("Firebase:ProjectId is not configured.");

            var builder = new FirestoreDbBuilder { ProjectId = options.ProjectId };
            if (!string.IsNullOrWhiteSpace(options.CredentialsJson))
                builder.JsonCredentials = options.CredentialsJson;

            return builder.Build();
        });

        services.AddScoped<IUserRepository, FirestoreUserRepository>();
        services.AddScoped<IDiaryRepository, FirestoreDiaryRepository>();
        services.AddScoped<IProgressRepository, FirestoreProgressRepository>();
        services.AddScoped<ITrainingRepository, FirestoreTrainingRepository>();
        services.AddScoped<ICoachRepository, FirestoreCoachRepository>();
        services.AddScoped<IFoodCatalog, FirestoreFoodCatalog>();
        services.AddSingleton<IPhotoStorage, FirebasePhotoStorage>();
        services.AddSingleton<IIdentityService, FirebaseIdentityService>();
        services.AddSingleton<IInBodyScanner, ClaudeInBodyScanner>();

        return services;
    }

    /// <summary>Writes the shipped food catalog once, at startup.</summary>
    public static async Task SeedFoodCatalogAsync(this IServiceProvider services, CancellationToken ct = default)
    {
        var db = services.GetRequiredService<FirestoreDb>();
        await FirestoreFoodCatalog.EnsureSeededAsync(db, ct);
    }
}
