using FitCore.Application.Abstractions;
using FitCore.Application.Contracts;
using FitCore.Application.Summaries;
using FitCore.Domain.Entities;

namespace FitCore.Application.Services;

/// <summary>
/// A coach reads a trainee's numbers through an explicit link. Every call checks the link first,
/// so one coach can never reach another coach's members.
/// </summary>
public sealed class CoachService(
    ICoachRepository coaches,
    IUserRepository users,
    IProgressRepository progress,
    TrainingService training,
    WeekSummaryService summaries)
{
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

        return list;
    }

    public async Task<CoachLink> RequireLinkAsync(string coachUid, string traineeUid, CancellationToken ct = default) =>
        await coaches.GetLinkAsync(coachUid, traineeUid, ct)
        ?? throw new UnauthorizedAccessException("This member is not one of your trainees.");

    public async Task<CoachLink> InviteAsync(string coachUid, InviteTraineeRequest request, CancellationToken ct = default)
    {
        var coach = await users.GetAsync(coachUid, ct);
        if (coach is null) throw new KeyNotFoundException("Coach profile not found.");

        var link = new CoachLink
        {
            CoachUid = coachUid,
            TraineeUid = request.Email.Trim().ToLowerInvariant(), // resolved to a uid once the member accepts
            TraineeName = request.Name ?? request.Email,
            Status = TraineeStatus.Invited
        };

        await coaches.SaveLinkAsync(link, ct);
        return link;
    }

    public async Task AssignDietAsync(string coachUid, string traineeUid, string dietId, CancellationToken ct = default)
    {
        var link = await RequireLinkAsync(coachUid, traineeUid, ct);
        link.AssignedDietId = dietId;
        await coaches.SaveLinkAsync(link, ct);
    }

    public async Task RemoveAsync(string coachUid, string traineeUid, CancellationToken ct = default)
    {
        await RequireLinkAsync(coachUid, traineeUid, ct);
        await coaches.RemoveLinkAsync(coachUid, traineeUid, ct);
    }
}
