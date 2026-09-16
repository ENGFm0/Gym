using System.Security.Claims;
using FitCore.Infrastructure.Firestore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace FitCore.Api.Auth;

/// <summary>
/// Firebase ID tokens are ordinary Google-signed JWTs: the issuer is securetoken.google.com/&lt;project&gt;
/// and the audience is the project id, so the standard JWT handler validates them with no extra SDK call.
/// </summary>
public static class FirebaseAuthExtensions
{
    public const string CoachPolicy = "coach";

    public static IServiceCollection AddFirebaseAuth(this IServiceCollection services, IConfiguration configuration)
    {
        var projectId = configuration[$"{FirebaseOptions.SectionName}:ProjectId"] ?? string.Empty;

        services
            .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.Authority = $"https://securetoken.google.com/{projectId}";
                options.IncludeErrorDetails = true;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = $"https://securetoken.google.com/{projectId}",
                    ValidateAudience = true,
                    ValidAudience = projectId,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(2)
                };
            });

        services.AddAuthorization(options =>
        {
            options.AddPolicy(CoachPolicy, policy => policy.RequireClaim("coach", "true"));
        });

        return services;
    }
}

/// <summary>The signed-in member, taken from the token rather than from anything the client sends.</summary>
public sealed class CurrentUser(IHttpContextAccessor accessor)
{
    private ClaimsPrincipal? Principal => accessor.HttpContext?.User;

    public string Uid =>
        Principal?.FindFirstValue("user_id")
        ?? Principal?.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? Principal?.FindFirstValue("sub")
        ?? throw new UnauthorizedAccessException("No user id on the token.");

    public string? Email => Principal?.FindFirstValue("email") ?? Principal?.FindFirstValue(ClaimTypes.Email);

    public string? Name => Principal?.FindFirstValue("name");

    public bool IsCoach => string.Equals(Principal?.FindFirstValue("coach"), "true", StringComparison.OrdinalIgnoreCase);
}
