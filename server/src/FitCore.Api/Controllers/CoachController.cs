using FitCore.Api.Auth;
using FitCore.Application.Contracts;
using FitCore.Application.Services;
using FitCore.Application.Summaries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitCore.Api.Controllers;

/// <summary>Coach side. Every route checks the coach to trainee link before reading anything.</summary>
[Route("api/coach")]
[Authorize(Policy = FirebaseAuthExtensions.CoachPolicy)]
public sealed class CoachController(
    CurrentUser user,
    CoachService coaches,
    DiaryService diary,
    ProgressService progress,
    WeekSummaryService summaries) : ApiControllerBase(user)
{
    [HttpGet("trainees")]
    public async Task<ActionResult<IEnumerable<TraineeDto>>> Trainees(CancellationToken ct) =>
        Ok(await coaches.GetTraineesAsync(Uid, ct));

    [HttpPost("trainees")]
    public async Task<ActionResult<object>> Invite([FromBody] InviteTraineeRequest request, CancellationToken ct)
    {
        var link = await coaches.InviteAsync(Uid, request, ct);
        return Ok(new { link.Id, link.TraineeName, Status = link.Status.ToString().ToLowerInvariant() });
    }

    [HttpGet("trainees/{traineeUid}/week")]
    public async Task<ActionResult<WeekSummaryDto>> Week(string traineeUid, CancellationToken ct)
    {
        await coaches.RequireLinkAsync(Uid, traineeUid, ct);
        return Ok(await summaries.ForAsync(traineeUid, ct));
    }

    /// <summary>What the trainee actually ate on a day — the other half of "plan against actual".</summary>
    [HttpGet("trainees/{traineeUid}/diary/{date}")]
    public async Task<ActionResult<DayDto>> Diary(string traineeUid, string date, CancellationToken ct)
    {
        await coaches.RequireLinkAsync(Uid, traineeUid, ct);
        return Ok(await diary.GetDayAsync(traineeUid, ParseDate(date), ct));
    }

    [HttpGet("trainees/{traineeUid}/weights")]
    public async Task<ActionResult<IEnumerable<WeightDto>>> Weights(string traineeUid, CancellationToken ct)
    {
        await coaches.RequireLinkAsync(Uid, traineeUid, ct);
        return Ok(await progress.GetWeightsAsync(traineeUid, ct));
    }

    [HttpGet("trainees/{traineeUid}/photos")]
    public async Task<ActionResult<IEnumerable<PhotoDto>>> Photos(string traineeUid, CancellationToken ct)
    {
        await coaches.RequireLinkAsync(Uid, traineeUid, ct);
        return Ok(await progress.GetPhotosAsync(traineeUid, ct));
    }

    [HttpPut("trainees/{traineeUid}/diet")]
    public async Task<IActionResult> AssignDiet(string traineeUid, [FromBody] string dietId, CancellationToken ct)
    {
        await coaches.AssignDietAsync(Uid, traineeUid, dietId, ct);
        return NoContent();
    }

    [HttpDelete("trainees/{traineeUid}")]
    public async Task<IActionResult> Remove(string traineeUid, CancellationToken ct)
    {
        await coaches.RemoveAsync(Uid, traineeUid, ct);
        return NoContent();
    }
}
