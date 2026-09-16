using FitCore.Api.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FitCore.Api.Controllers;

public sealed record ClientErrorReport(string Message, string? Stack, string? Route, string? Agent);

/// <summary>
/// Where the app reports a crash it survived. Without this a front-end error is invisible:
/// it happens on someone's phone and nobody hears about it.
/// </summary>
[ApiController]
[Route("api/diagnostics")]
public sealed class DiagnosticsController(CurrentUser user, ILogger<DiagnosticsController> log) : ControllerBase
{
    [HttpPost("client-error")]
    [AllowAnonymous]
    [EnableRateLimiting("scan")]
    public IActionResult Report([FromBody] ClientErrorReport report)
    {
        if (string.IsNullOrWhiteSpace(report.Message)) return BadRequest();

        // Trimmed: a stack from a minified bundle is long and the top of it is the useful part.
        log.LogError("Client error on {Route}: {Message} | {Stack}",
            report.Route ?? "unknown",
            report.Message[..Math.Min(report.Message.Length, 500)],
            report.Stack?[..Math.Min(report.Stack.Length, 2000)]);

        return Accepted();
    }

    /// <summary>Confirms the token reaches the API, and what it says about the caller.</summary>
    [HttpGet("whoami")]
    [Authorize]
    public IActionResult WhoAmI() => Ok(new
    {
        uid = user.Uid,
        email = user.Email,
        isCoach = user.IsCoach
    });
}
