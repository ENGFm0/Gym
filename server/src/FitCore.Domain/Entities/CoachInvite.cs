namespace FitCore.Domain.Entities;

public enum InviteState { Pending, Accepted, Declined, Revoked }

/// <summary>
/// A coach invites by email, because they do not know the member's uid. The invite waits
/// until that member signs in and accepts it — only then does a link exist and any data move.
/// </summary>
public sealed class CoachInvite
{
    public string Id { get; set; } = Guid.NewGuid().ToString("n");
    public string CoachUid { get; set; } = string.Empty;
    public string CoachName { get; set; } = string.Empty;

    /// <summary>Lowercased, trimmed: this is what a signing-in member is matched against.</summary>
    public string Email { get; set; } = string.Empty;

    public string TraineeName { get; set; } = string.Empty;
    public InviteState State { get; set; } = InviteState.Pending;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? AnsweredAtUtc { get; set; }
    public string? TraineeUid { get; set; }

    public static string Normalise(string email) => email.Trim().ToLowerInvariant();
}

/// <summary>
/// What a coach set for a member. It lives on the member's own document, so their app can
/// read it without ever querying the coach's data, and they can drop it whenever they like.
/// </summary>
public sealed class CoachAssignment
{
    public string CoachUid { get; set; } = string.Empty;
    public string CoachName { get; set; } = string.Empty;
    public string? DietId { get; set; }
    public int? CalorieOverride { get; set; }
    public string? Note { get; set; }
    public DateTime AssignedAtUtc { get; set; } = DateTime.UtcNow;
}
