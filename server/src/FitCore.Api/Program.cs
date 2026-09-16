using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using FitCore.Api.Auth;
using FitCore.Api.Middleware;
using FitCore.Application;
using FitCore.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Cloud Run reads stdout as structured logs, so JSON here is what makes a field searchable.
builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole(options =>
{
    options.IncludeScopes = true;
    options.JsonWriterOptions = new System.Text.Json.JsonWriterOptions { Indented = false };
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<CurrentUser>();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddFirebaseAuth(builder.Configuration);
builder.Services.AddFitCoreApplication();
builder.Services.AddFitCoreInfrastructure(builder.Configuration);

// Rate limits are per member, not per IP: a gym's wifi is one IP for everyone in it.
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.User.FindFirst("user_id")?.Value
                ?? context.Connection.RemoteIpAddress?.ToString()
                ?? "anonymous",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 300,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    // Reading a body-composition sheet calls a model, so it gets its own, much tighter window.
    options.AddPolicy("scan", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.User.FindFirst("user_id")?.Value ?? "anonymous",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(5),
                QueueLimit = 0
            }));

    options.OnRejected = async (context, ct) =>
    {
        context.HttpContext.Response.Headers.RetryAfter = "60";
        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            title = "Too many requests",
            detail = "Slow down a little and try again."
        }, ct);
    };
});

var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy
    .WithOrigins(origins)
    .AllowAnyHeader()
    .AllowAnyMethod()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "FitCore API", Version = "v1" });
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "A Firebase ID token."
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// One line per request, carrying an id the client can quote when something goes wrong.
app.Use(async (context, next) =>
{
    var requestId = context.Request.Headers["X-Request-Id"].FirstOrDefault() ?? context.TraceIdentifier;
    context.Response.Headers["X-Request-Id"] = requestId;

    using (app.Logger.BeginScope(new Dictionary<string, object>
           {
               ["requestId"] = requestId,
               ["uid"] = context.User.FindFirst("user_id")?.Value ?? "anonymous"
           }))
    {
        var started = System.Diagnostics.Stopwatch.GetTimestamp();
        await next();
        var ms = System.Diagnostics.Stopwatch.GetElapsedTime(started).TotalMilliseconds;

        // Only what is worth reading later: the slow, the failed, and nothing else.
        if (context.Response.StatusCode >= 400 || ms > 1000)
        {
            app.Logger.LogWarning("{Method} {Path} -> {Status} in {Elapsed:0}ms",
                context.Request.Method, context.Request.Path, context.Response.StatusCode, ms);
        }
    }
});

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { status = "ok", at = DateTime.UtcNow }))
   .AllowAnonymous()
   .WithName("Health");

// The shipped food catalog is written once; a failure here must not stop the API coming up.
// Tests run against in-memory stores and must not reach for Firestore at all.
if (!app.Environment.IsEnvironment("Testing"))
{
    try
    {
        await app.Services.SeedFoodCatalogAsync();
    }
    catch (Exception e)
    {
        app.Logger.LogWarning(e, "Could not seed the food catalog");
    }
}

app.Run();

/// <summary>Exposed so the API can be hosted in integration tests.</summary>
public partial class Program { }
