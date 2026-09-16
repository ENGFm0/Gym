using FitCore.Api.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitCore.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
[Produces("application/json")]
public abstract class ApiControllerBase(CurrentUser user) : ControllerBase
{
    protected CurrentUser Account => user;
    protected string Uid => user.Uid;

    protected static DateOnly ParseDate(string? value) =>
        DateOnly.TryParse(value, out var parsed) ? parsed : DateOnly.FromDateTime(DateTime.UtcNow);
}
