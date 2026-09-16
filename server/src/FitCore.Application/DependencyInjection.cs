using FitCore.Application.Abstractions;
using FitCore.Application.Services;
using FitCore.Application.Summaries;
using Microsoft.Extensions.DependencyInjection;

namespace FitCore.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddFitCoreApplication(this IServiceCollection services)
    {
        services.AddSingleton<IClock, SystemClock>();
        services.AddScoped<ProfileService>();
        services.AddScoped<DiaryService>();
        services.AddScoped<ProgressService>();
        services.AddScoped<TrainingService>();
        services.AddScoped<WeekSummaryService>();
        services.AddScoped<CoachService>();
        return services;
    }
}
