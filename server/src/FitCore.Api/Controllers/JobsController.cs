using FitCore.Application.Contracts;
using FitCore.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitCore.Api.Controllers;

/// <summary>
/// Scheduled work. Cloud Scheduler calls this every quarter hour with a shared secret, since a
/// cron job has no member to sign in as. The secret is required — an unset one closes the route
/// rather than opening it.
/// </summary>
[ApiController]
[AllowAnonymous]
[Route("api/jobs")]
public sealed class JobsController(
    ReminderService reminders,
    IConfiguration configuration,
    ILogger<JobsController> log) : ControllerBase
{
    [HttpPost("reminders")]
    public async Task<ActionResult<ReminderRunResult>> Reminders(CancellationToken ct)
    {
        var expected = configuration["Jobs:Secret"];
        if (string.IsNullOrWhiteSpace(expected))
        {
            log.LogWarning("A reminder run was refused: Jobs:Secret is not configured");
            return NotFound();
        }

        if (!Request.Headers.TryGetValue("X-Job-Secret", out var given) || given != expected)
            return Unauthorized();

        var result = await reminders.RunAsync(ct);
        log.LogInformation("Reminder run: {Checked} checked, {Sent} sent", result.Checked, result.Sent);
        return Ok(result);
    }
}
