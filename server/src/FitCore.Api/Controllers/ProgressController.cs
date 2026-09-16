using FitCore.Api.Auth;
using FitCore.Application.Contracts;
using FitCore.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace FitCore.Api.Controllers;

/// <summary>Weight, measurements and photos. Nothing here overwrites an earlier reading.</summary>
[Route("api/progress")]
public sealed class ProgressController(CurrentUser user, ProgressService progress) : ApiControllerBase(user)
{
    [HttpGet("weights")]
    public async Task<ActionResult<IEnumerable<WeightDto>>> Weights(CancellationToken ct) =>
        Ok(await progress.GetWeightsAsync(Uid, ct));

    /// <summary>Adds a reading; the previous one stays, so the app can show the difference.</summary>
    [HttpPost("weights")]
    public async Task<ActionResult<IEnumerable<WeightDto>>> AddWeight([FromBody] AddWeightRequest request, CancellationToken ct) =>
        Ok(await progress.AddWeightAsync(Uid, request, ct));

    [HttpDelete("weights/{id}")]
    public async Task<IActionResult> DeleteWeight(string id, CancellationToken ct)
    {
        await progress.DeleteWeightAsync(Uid, id, ct);
        return NoContent();
    }

    [HttpGet("measurements")]
    public async Task<ActionResult<IEnumerable<MeasurementDto>>> Measurements(CancellationToken ct) =>
        Ok(await progress.GetMeasurementsAsync(Uid, ct));

    [HttpPost("measurements")]
    public async Task<ActionResult<IEnumerable<MeasurementDto>>> AddMeasurement(
        [FromBody] AddMeasurementRequest request, CancellationToken ct) =>
        Ok(await progress.AddMeasurementAsync(Uid, request, ct));

    [HttpDelete("measurements/{id}")]
    public async Task<IActionResult> DeleteMeasurement(string id, CancellationToken ct)
    {
        await progress.DeleteMeasurementAsync(Uid, id, ct);
        return NoContent();
    }

    [HttpGet("photos")]
    public async Task<ActionResult<IEnumerable<PhotoDto>>> Photos(CancellationToken ct) =>
        Ok(await progress.GetPhotosAsync(Uid, ct));

    /// <summary>Hands back a short lived URL the browser uploads to directly.</summary>
    [HttpPost("photos/ticket")]
    public async Task<ActionResult<PhotoUploadTicket>> PhotoTicket([FromQuery] string contentType, CancellationToken ct)
    {
        var (url, path) = await progress.CreatePhotoTicketAsync(Uid, contentType, ct);
        return Ok(new PhotoUploadTicket(url, path));
    }

    [HttpPost("photos")]
    public async Task<ActionResult<IEnumerable<PhotoDto>>> ConfirmPhoto([FromBody] ConfirmPhotoRequest request, CancellationToken ct) =>
        Ok(await progress.ConfirmPhotoAsync(Uid, request, ct));

    [HttpDelete("photos/{id}")]
    public async Task<IActionResult> DeletePhoto(string id, CancellationToken ct)
    {
        await progress.DeletePhotoAsync(Uid, id, ct);
        return NoContent();
    }
}
