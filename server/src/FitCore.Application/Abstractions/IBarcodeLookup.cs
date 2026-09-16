namespace FitCore.Application.Abstractions;

/// <summary>
/// Looks a barcode up outside our own catalog. A scanned code that nobody has entered yet is
/// the normal case, so the app asks the open product database before giving up on it.
/// </summary>
public interface IBarcodeLookup
{
    Task<Domain.Entities.FoodItem?> FindAsync(string barcode, CancellationToken ct = default);
}

/// <summary>Used when the external lookup is switched off.</summary>
public sealed class NoBarcodeLookup : IBarcodeLookup
{
    public Task<Domain.Entities.FoodItem?> FindAsync(string barcode, CancellationToken ct = default) =>
        Task.FromResult<Domain.Entities.FoodItem?>(null);
}
