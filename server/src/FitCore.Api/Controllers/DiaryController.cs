using FitCore.Api.Auth;
using FitCore.Application.Contracts;
using FitCore.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace FitCore.Api.Controllers;

[Route("api/diary")]
public sealed class DiaryController(CurrentUser user, DiaryService diary) : ApiControllerBase(user)
{
    /// <summary>A whole day: meals, totals, targets, steps, water and what is left to eat.</summary>
    [HttpGet("{date}")]
    public async Task<ActionResult<DayDto>> Get(string date, CancellationToken ct) =>
        Ok(await diary.GetDayAsync(Uid, ParseDate(date), ct));

    [HttpPost("{date}/entries")]
    public async Task<ActionResult<DayDto>> Add(string date, [FromBody] AddMealEntryRequest request, CancellationToken ct) =>
        Ok(await diary.AddEntryAsync(Uid, ParseDate(date), request, ct));

    [HttpDelete("{date}/entries/{entryId}")]
    public async Task<ActionResult<DayDto>> Remove(string date, string entryId, CancellationToken ct) =>
        Ok(await diary.RemoveEntryAsync(Uid, ParseDate(date), entryId, ct));

    /// <summary>Steps and water. Steps normally arrive from the phone's pedometer.</summary>
    [HttpPatch("{date}")]
    public async Task<ActionResult<DayDto>> Patch(string date, [FromBody] PatchDayRequest request, CancellationToken ct) =>
        Ok(await diary.PatchAsync(Uid, ParseDate(date), request, ct));
}
