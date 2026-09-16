using FitCore.Application.Abstractions;
using FitCore.Application.Contracts;
using FitCore.Application.Summaries;
using FitCore.Domain.Entities;

namespace FitCore.Application.Services;

/// <summary>
/// A coach reads a trainee's numbers through an explicit link, and a link only exists after the
/// member accepted an invite. Every call checks the link first, so one coach can never reach
/// another coach's members.
/// </summary>
public sealed class CoachService(
    ICoachRepository coaches,
    IUserRepository users,
    IProgressRepository progress,
    TrainingService training,
    WeekSummaryService summaries,
    IClock clock)
{
    /* ---------------- the coach's side ---------------- */

    public async Task<IReadOnlyList<TraineeDto>> GetTraineesAsync(string coachUid, CancellationToken ct = default)
    {
        var links = await coaches.GetTraineesAsync(coachUid, ct);
        var list = new List<TraineeDto>(links.Count);

        foreach (var link in links)
        {
            var weights = await progress.GetWeightsAsync(link.TraineeUid, 2, ct);
            var ordered = weights.OrderByDescending(w => w.TakenAtUtc).ToList();
            double? current = ordered.Count > 0 ? ordered[0].Kg : null;
            double? delta = ordered.Count > 1 ? Math.Round(ordered[0].Kg - ordered[1].Kg, 1) : null;

            var week = await summaries.ForAsync(link.TraineeUid, ct);

            list.Add(new TraineeDto(
                link.TraineeUid, link.TraineeName, link.Status.ToString().ToLowerInvariant(),
                link.StartedAtUtc, current, delta, week.SessionsDone, week.AdherencePercent, link.AssignedDietId));
        }

        // Invites that nobody has accepted yet belong on the same list, so the coach sees who is missing.
        var invites = await coaches.GetInvitesForCoachAsync(coachUid, ct);
        foreach (var invite in invites.Where(i => i.State == InviteState.Pending))
        {
            list.Add(new TraineeDto(
                invite.Id, invite.TraineeName, "invited", invite.CreatedAtUtc,
                null, null, 0, 0, null));
        }

        return list;
    }

    public async Task<CoachLink> RequireLinkAsync(string coachUid, string traineeUid, CancellationToken ct = default) =>
        await coaches.GetLinkAsync(coachUid, traineeUid, ct)
        ?? throw new UnauthorizedAccessException("This member is not one of your trainees.");

    /// <summary>Creates a pending invite. No data moves until the member accepts it.</summary>
    public async Task<InviteDto> InviteAsync(string coachUid, InviteTraineeRequest request, CancellationToken ct = default)
    {
        var coach = await users.GetAsync(coachUid, ct) ?? throw new KeyNotFoundException("Coach profile not found.");
        var email = CoachInvite.Normalise(request.Email);

        if (!email.Contains('@')) throw new ArgumentException("That is not an email address.", nameof(request));
        if (string.Equals(email, coach.Email, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("You cannot invite yourself.");

        var existing = await coaches.GetInvitesForCoachAsync(coachUid, ct);
        if (existing.Any(i => i.Email == email && i.State == InviteState.Pending))
            throw new InvalidOperationException("That invite is already waiting.");

        var invite = new CoachInvite
        {
            CoachUid = coachUid,
            CoachName = coach.DisplayName ?? coach.Email ?? "Coach",
            Email = email,
            TraineeName = request.Name ?? request.Email,
            CreatedAtUtc = clock.UtcNow
        };

        await coaches.SaveInviteAsync(invite, ct);
        return Map(invite);
    }

    public async Task RevokeInviteAsync(string coachUid, string inviteId, CancellationToken ct = default)
    {
        var invite = await coaches.GetInviteAsync(inviteId, ct) ?? throw new KeyNotFoundException("No such invite.");
        if (invite.CoachUid != coachUid) throw new UnauthorizedAccessException("That invite is not yours.");

        invite.State = InviteState.Revoked;
        invite.AnsweredAtUtc = clock.UtcNow;
        await coaches.SaveInviteAsync(invite, ct);
    }

    /// <summary>Sets the member's diet from the coach's side, on the member's own document.</summary>
    public async Task AssignAsync(string coachUid, string traineeUid, AssignRequest request, CancellationToken ct = default)
    {
        var link = await RequireLinkAsync(coachUid, traineeUid, ct);
        var coach = await users.GetAsync(coachUid, ct);
        var trainee = await users.GetAsync(traineeUid, ct) ?? throw new KeyNotFoundException("Trainee profile not found.");

        trainee.Assignment = new CoachAssignment
        {
            CoachUid = coachUid,
            CoachName = coach?.DisplayName ?? "Coach",
            DietId = request.DietId,
            CalorieOverride = request.CalorieOverride,
            Note = request.Note,
            AssignedAtUtc = clock.UtcNow
        };
        trainee.UpdatedAtUtc = clock.UtcNow;
        await users.SaveAsync(trainee, ct);

        link.AssignedDietId = request.DietId;
        await coaches.SaveLinkAsync(link, ct);
    }

    public async Task RemoveAsync(string coachUid, string traineeUid, CancellationToken ct = default)
    {
        await RequireLinkAsync(coachUid, traineeUid, ct);
        await coaches.RemoveLinkAsync(coachUid, traineeUid, ct);
        await ClearAssignmentAsync(traineeUid, coachUid, ct);
    }

    /* ---------------- the member's side ---------------- */

    /// <summary>Invites waiting for whoever is signed in, matched on the email on their token.</summary>
    public async Task<IReadOnlyList<InviteDto>> GetMyInvitesAsync(string? email, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(email)) return Array.Empty<InviteDto>();

        var invites = await coaches.GetInvitesForEmailAsync(CoachInvite.Normalise(email), ct);
        return invites.Where(i => i.State == InviteState.Pending).Select(Map).ToList();
    }

    /// <summary>Accepting is what creates the link — and the only thing that does.</summary>
    public async Task<CoachLink> AcceptInviteAsync(string uid, string? email, string inviteId, CancellationToken ct = default)
    {
        var invite = await coaches.GetInviteAsync(inviteId, ct) ?? throw new KeyNotFoundException("No such invite.");

        if (invite.State != InviteState.Pending) throw new InvalidOperationException("That invite was already answered.");
        if (string.IsNullOrWhiteSpace(email) || invite.Email != CoachInvite.Normalise(email))
            throw new UnauthorizedAccessException("That invite was not sent to your email.");

        var me = await users.GetAsync(uid, ct);

        var link = new CoachLink
        {
            CoachUid = invite.CoachUid,
            TraineeUid = uid,
            TraineeName = me?.DisplayName ?? invite.TraineeName,
            Status = TraineeStatus.Active,
            StartedAtUtc = clock.UtcNow
        };
        await coaches.SaveLinkAsync(link, ct);

        invite.State = InviteState.Accepted;
        invite.TraineeUid = uid;
        invite.AnsweredAtUtc = clock.UtcNow;
        await coaches.SaveInviteAsync(invite, ct);

        return link;
    }

    public async Task DeclineInviteAsync(string? email, string inviteId, CancellationToken ct = default)
    {
        var invite = await coaches.GetInviteAsync(inviteId, ct) ?? throw new KeyNotFoundException("No such invite.");
        if (string.IsNullOrWhiteSpace(email) || invite.Email != CoachInvite.Normalise(email))
            throw new UnauthorizedAccessException("That invite was not sent to your email.");

        invite.State = InviteState.Declined;
        invite.AnsweredAtUtc = clock.UtcNow;
        await coaches.SaveInviteAsync(invite, ct);
    }

    /// <summary>The member can walk away from a coach at any time; it is their account.</summary>
    public async Task LeaveCoachAsync(string uid, CancellationToken ct = default)
    {
        var me = await users.GetAsync(uid, ct);
        var coachUid = me?.Assignment?.CoachUid;
        if (coachUid is null) return;

        await coaches.RemoveLinkAsync(coachUid, uid, ct);
        await ClearAssignmentAsync(uid, coachUid, ct);
    }

    private async Task ClearAssignmentAsync(string uid, string coachUid, CancellationToken ct)
    {
        var trainee = await users.GetAsync(uid, ct);
        if (trainee?.Assignment is null || trainee.Assignment.CoachUid != coachUid) return;

        trainee.Assignment = null;
        trainee.UpdatedAtUtc = clock.UtcNow;
        await users.SaveAsync(trainee, ct);
    }

    private static InviteDto Map(CoachInvite invite) => new(
        invite.Id, invite.CoachName, invite.TraineeName, invite.Email,
        invite.State.ToString().ToLowerInvariant(), invite.CreatedAtUtc);
}
