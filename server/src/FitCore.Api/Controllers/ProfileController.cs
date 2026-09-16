using FitCore.Api.Auth;
using FitCore.Application.Abstractions;
using FitCore.Application.Catalogs;
using FitCore.Application.Contracts;
using FitCore.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace FitCore.Api.Controllers;

[Route("api/me")]
public sealed class ProfileController(CurrentUser user, ProfileService profiles, IIdentityService identity) : ApiControllerBase(user)
{
    /// <summary>The signed-in member; the profile document is created on first call.</summary>
    [HttpGet("profile")]
    public async Task<ActionResult<ProfileDto>> Get(CancellationToken ct)
    {
        var profile = await profiles.GetOrCreateAsync(Uid, Account.Email, Account.Name, ct);
        return Ok(profiles.Map(profile));
    }

    [HttpPut("profile")]
    public async Task<ActionResult<ProfileDto>> Update([FromBody] UpdateProfileRequest request, CancellationToken ct) =>
        Ok(await profiles.UpdateAsync(Uid, request, ct));

    /// <summary>Calories and macros, computed here and never on the client.</summary>
    [HttpGet("plan")]
    public async Task<ActionResult<PlanDto>> Plan(CancellationToken ct)
    {
        var profile = await profiles.GetOrCreateAsync(Uid, Account.Email, Account.Name, ct);
        return Ok(profiles.PlanFor(profile));
    }

    /// <summary>Turns the account into a coach account: sets the claim and flips the profile flag.</summary>
    [HttpPost("become-coach")]
    public async Task<ActionResult<ProfileDto>> BecomeCoach(CancellationToken ct)
    {
        await identity.SetCoachAsync(Uid, true, ct);
        return Ok(await profiles.SetCoachAsync(Uid, true, ct));
    }

    [HttpGet("diets")]
    public ActionResult<IEnumerable<object>> Diets() => Ok(DietCatalog.All.Select(d => new
    {
        d.Id,
        d.NameAr,
        d.NameEn,
        Split = new { d.Split.Fat, d.Split.Protein, d.Split.Carbs },
        d.Eat,
        d.Avoid
    }));
}
