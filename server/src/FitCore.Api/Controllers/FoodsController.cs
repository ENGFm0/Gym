using FitCore.Api.Auth;
using FitCore.Application.Abstractions;
using FitCore.Application.Contracts;
using FitCore.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace FitCore.Api.Controllers;

[Route("api/foods")]
public sealed class FoodsController(CurrentUser user, IFoodCatalog foods) : ApiControllerBase(user)
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<FoodDto>>> Search([FromQuery] string? q, CancellationToken ct)
    {
        var results = await foods.SearchAsync(q, Uid, 40, ct);
        return Ok(results.Select(Map));
    }

    [HttpGet("barcode/{code}")]
    public async Task<ActionResult<FoodDto>> Barcode(string code, CancellationToken ct)
    {
        var food = await foods.FindByBarcodeAsync(code, ct);
        return food is null ? NotFound() : Ok(Map(food));
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
