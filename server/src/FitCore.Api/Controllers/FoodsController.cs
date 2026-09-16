using FitCore.Api.Auth;
using FitCore.Application.Abstractions;
using FitCore.Application.Contracts;
using FitCore.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace FitCore.Api.Controllers;

[Route("api/foods")]
public sealed class FoodsController(CurrentUser user, IFoodCatalog foods, IBarcodeLookup lookup) : ApiControllerBase(user)
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<FoodDto>>> Search([FromQuery] string? q, CancellationToken ct)
    {
        var results = await foods.SearchAsync(q, Uid, 40, ct);
        return Ok(results.Select(Map));
    }

    /// <summary>
    /// Our catalog first, then the open product database. A hit from outside is written into the
    /// catalog, so the next person who scans that packet gets it instantly and offline.
    /// </summary>
    [HttpGet("barcode/{code}")]
    public async Task<ActionResult<FoodDto>> Barcode(string code, CancellationToken ct)
    {
        var known = await foods.FindByBarcodeAsync(code, ct);
        if (known is not null) return Ok(Map(known));

        var found = await lookup.FindAsync(code, ct);
        if (found is null) return NotFound();

        await foods.AddCustomAsync(found, ct);   // shared, not owned: OwnerUid stays null
        return Ok(Map(found));
    }

    /// <summary>A member's own item — visible only to them.</summary>
    [HttpPost("custom")]
    public async Task<ActionResult<FoodDto>> AddCustom([FromBody] FoodDto request, CancellationToken ct)
    {
        var food = await foods.AddCustomAsync(new FoodItem
        {
            NameAr = request.NameAr,
            NameEn = string.IsNullOrWhiteSpace(request.NameEn) ? request.NameAr : request.NameEn,
            Unit = request.Unit,
            BaseAmount = request.BaseAmount <= 0 ? 1 : request.BaseAmount,
            Calories = request.Calories,
            Protein = request.Protein,
            Carbs = request.Carbs,
            Fat = request.Fat,
            Barcode = request.Barcode,
            OwnerUid = Uid
        }, ct);

        return Ok(Map(food));
    }

    private static FoodDto Map(FoodItem f) => new(
        f.Id, f.NameAr, f.NameEn, f.Unit, f.BaseAmount, f.Calories, f.Protein, f.Carbs, f.Fat,
        f.Barcode, f.OwnerUid is not null);
}
