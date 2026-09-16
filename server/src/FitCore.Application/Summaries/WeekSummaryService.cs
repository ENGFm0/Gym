using FitCore.Application.Abstractions;
using FitCore.Application.Contracts;
using FitCore.Application.Services;
using FitCore.Domain.Common;

namespace FitCore.Application.Summaries;

/// <summary>The training dashboard: done against target, adherence, load, burn and the seven day strip.</summary>
public sealed class WeekSummaryService(TrainingService training, IClock clock)
{
    public async Task<WeekSummaryDto> ForAsync(string uid, CancellationToken ct = default)
    {
        var activities = await training.GetActivitiesAsync(uid, ct);
        var sessions = await training.SessionsThisWeekAsync(uid, ct);
        var program = await training.GetProgramAsync(uid, ct);

        var target = activities.Sum(a => a.TimesPerWeek);
        var done = sessions.Count;
        var adherence = target > 0 ? Math.Min(100, (int)Math.Round(done * 100.0 / target)) : 0;

        var bars = new int[WeekDays.Count];
        foreach (var session in sessions)
            bars[WeekDays.IndexOf(session.PerformedAtUtc.DayOfWeek)]++;

        var days = bars
            .Select((count, index) => new WeekDayBarDto(index, WeekDays.Arabic[index], WeekDays.English[index], count))
            .ToList();

        var progress = activities
            .Select(a => new ActivityProgressDto(
                a.Id, a.NameAr, a.NameEn, a.Icon,
                sessions.Count(s => s.ActivityId == a.Id), a.TimesPerWeek))
            .ToList();

        var todayIndex = WeekDays.IndexOf(clock.UtcNow.DayOfWeek);
        var slot = program.SlotFor(todayIndex);
        ProgramDayDto? today = null;

        if (slot is not null)
        {
            var mapped = TrainingService.MapProgram(program);
            today = mapped.Days.FirstOrDefault(d => d.Slot == slot.Value);
        }

        return new WeekSummaryDto(
            done,
            target,
            adherence,
            sessions.Sum(s => s.VolumeKg),
            sessions.Sum(s => s.Calories),
            sessions.Sum(s => s.Minutes),
            days,
            progress,
            today,
            slot is null);
    }
}
