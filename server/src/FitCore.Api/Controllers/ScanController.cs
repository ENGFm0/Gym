using FitCore.Api.Auth;
using FitCore.Application.Contracts;
using FitCore.Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FitCore.Api.Controllers;

/// <summary>
/// Reading a body-composition printout. The numbers come back for the member to confirm —
/// nothing is written until they say so.
/// </summary>
[Route("api/scan")]
public sealed class ScanController(CurrentUser user, ScanService scans) : ApiControllerBase(user)
{
    [HttpPost("inbody")]
    [RequestSizeLimit(ScanService.MaxImageBytes + 1024)]
    [EnableRateLimiting("scan")]
    public async Task<ActionResult<InBodyScanDto>> ReadInBody(IFormFile image, CancellationToken ct)
    {
        if (image is null || image.Length == 0) return BadRequest(new { message = "No image was sent." });

        using var buffer = new MemoryStream();
        await image.CopyToAsync(buffer, ct);

        return Ok(await scans.ReadAsync(Uid, buffer.ToArray(), image.ContentType ?? "image/jpeg", ct));
    }

    /// <summary>Keeps the numbers the member confirmed as an ordinary weigh-in.</summary>
    [HttpPost("inbody/save")]
    public async Task<IActionResult> Save([FromBody] SaveScanRequest request, CancellationToken ct)
    {
        await scans.SaveAsync(Uid, request, ct);
        return NoContent();
    }
}
