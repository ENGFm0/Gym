using FitCore.Api.Auth;
using FitCore.Application.Catalogs;
using FitCore.Application.Contracts;
using FitCore.Application.Services;
using FitCore.Application.Summaries;
using Microsoft.AspNetCore.Mvc;

namespace FitCore.Api.Controllers;

[Route("api/training")]
public sealed class TrainingController(
    CurrentUser user,
    TrainingService training,
    WeekSummaryService summaries) : ApiControllerBase(user)
{
    /* ---- the week ---- */

    /// <summary>The dashboard: done against target, adherence, load, burn, the day strip and today's split.</summary>
    [HttpGet("week")]
    public async Task<ActionResult<WeekSummaryDto>> Week(CancellationToken ct) =>
        Ok(await summaries.ForAsync(Uid, ct));

    /* ---- program ---- */

    [HttpGet("program")]
    public async Task<ActionResult<ProgramDto>> Program(CancellationToken ct) =>
        Ok(await training.GetProgramDtoAsync(Uid, ct));

    /// <summary>
    /// Sets the week: a number of days (1 to 7, laid out with rest in between), a single weekday
    /// flipped between training and rest, or an explicit list of weekdays.
    /// </summary>
    [HttpPut("program/days")]
    public async Task<ActionResult<ProgramDto>> SetDays([FromBody] SetTrainingDaysRequest request, CancellationToken ct) =>
        Ok(await training.SetTrainingDaysAsync(Uid, request, ct));

    [HttpPut("program/days/{slot:int}/exercises")]
    public async Task<ActionResult<ProgramDto>> SetExercises(
        int slot, [FromBody] SaveDayExercisesRequest request, CancellationToken ct) =>
        Ok(await training.SaveDayExercisesAsync(Uid, slot, request, ct));

    [HttpGet("exercises")]
    public ActionResult<IEnumerable<object>> Exercises() =>
        Ok(ExerciseCatalog.All.Select(e => new { e.NameAr, e.NameEn }));

    /* ---- activities ---- */

    [HttpGet("activities")]
    public async Task<ActionResult<IEnumerable<ActivityDto>>> Activities(CancellationToken ct) =>
        Ok(await training.GetActivityDtosAsync(Uid, ct));

    [HttpGet("activities/catalog")]
    public ActionResult<IEnumerable<object>> Catalog() => Ok(ActivityCatalog.All.Select(a => new
    {
        a.Id, a.NameAr, a.NameEn, a.Met, a.Icon, Unit = a.Unit.ToString().ToLowerInvariant()
    }));

    /// <summary>Adding an activity always carries its weekly target.</summary>
    [HttpPost("activities")]
    public async Task<ActionResult<ActivityDto>> AddActivity([FromBody] AddActivityRequest request, CancellationToken ct) =>
        Ok(await training.AddActivityAsync(Uid, request, ct));

    [HttpPatch("activities/{id}")]
    public async Task<ActionResult<ActivityDto>> UpdateActivity(
        string id, [FromBody] UpdateActivityRequest request, CancellationToken ct) =>
        Ok(await training.UpdateActivityAsync(Uid, id, request, ct));

    [HttpDelete("activities/{id}")]
    public async Task<IActionResult> RemoveActivity(string id, CancellationToken ct)
    {
        await training.RemoveActivityAsync(Uid, id, ct);
        return NoContent();
    }

    /* ---- sessions ---- */

    [HttpGet("sessions")]
    public async Task<ActionResult<IEnumerable<SessionDto>>> Sessions([FromQuery] int limit, CancellationToken ct) =>
        Ok(await training.GetSessionsAsync(Uid, limit <= 0 ? 60 : Math.Min(limit, 200), ct));

    /// <summary>Logs a session — iron with its sets, or minutes and distance for anything else.</summary>
    [HttpPost("sessions")]
    public async Task<ActionResult<SessionDto>> LogSession([FromBody] LogSessionRequest request, CancellationToken ct) =>
        Ok(await training.LogSessionAsync(Uid, request, ct));

    [HttpDelete("sessions/{id}")]
    public async Task<IActionResult> DeleteSession(string id, CancellationToken ct)
    {
        await training.DeleteSessionAsync(Uid, id, ct);
        return NoContent();
    }

    /// <summary>The last working set for an exercise, shown while logging the next one.</summary>
    [HttpGet("exercises/{name}/last")]
    public async Task<ActionResult<object>> LastSet(string name, CancellationToken ct)
    {
        var memory = await training.GetMemoryAsync(Uid, name, ct);
        return memory is null ? NotFound() : Ok(new { memory.WeightKg, memory.Reps, memory.AtUtc });
    }
}
