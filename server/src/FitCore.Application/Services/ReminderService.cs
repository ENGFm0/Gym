using FitCore.Application.Abstractions;
using FitCore.Application.Contracts;
using FitCore.Domain.Common;
using FitCore.Domain.Entities;

namespace FitCore.Application.Services;

/// <summary>
/// The nudges the app promises: a meal that has not been logged, a training day with nothing
/// on it yet, and the weekly weigh-in.
///
/// A scheduler calls <see cref="RunAsync"/> every quarter hour. Each member is judged in their
/// own local time, a reminder is only sent when the thing it is about is actually missing, and
/// the day it last fired is written down so a re-run cannot send it twice.
/// </summary>
public sealed class ReminderService(
    IUserRepository users,
    IDiaryRepository diary,
    ITrainingRepository training,
    IProgressRepository progress,
    INotifier notifier,
    IClock clock)
{
    /// <summary>How late a reminder may still fire — one scheduler tick, plus slack.</summary>
    private static readonly TimeSpan Window = TimeSpan.FromMinutes(20);

    public async Task<ReminderRunResult> RunAsync(CancellationToken ct = default)
    {
        var checkedCount = 0;
        var sent = 0;
        string? cursor = null;

        while (true)
        {
            var batch = await users.GetRemindableAsync(200, cursor, ct);
            if (batch.Count == 0) break;

            foreach (var profile in batch)
            {
                checkedCount++;
                sent += await ForMemberAsync(profile, ct);
            }

            if (batch.Count < 200) break;
            cursor = batch[^1].Uid;
        }

        return new ReminderRunResult(checkedCount, sent);
    }

    /// <summary>Everything one member might be due, judged against their own clock.</summary>
    public async Task<int> ForMemberAsync(UserProfile profile, CancellationToken ct = default)
    {
        var settings = profile.Reminders;
        if (!settings.Enabled) return 0;

        var localNow = clock.UtcNow.AddMinutes(settings.UtcOffsetMinutes);
        var today = DateOnly.FromDateTime(localNow);
        var stamp = today.ToString("yyyy-MM-dd");
        var sent = 0;

        var dirty = false;

        bool Due(string key, string at)
        {
            if (settings.LastSent.TryGetValue(key, out var last) && last == stamp) return false;
            if (!ReminderSettings.TryParseTime(at, out var time)) return false;

            var scheduled = today.ToDateTime(time);
            var late = localNow - scheduled;
            return late >= TimeSpan.Zero && late <= Window;
        }

        void Mark(string key)
        {
            settings.LastSent[key] = stamp;
            dirty = true;
            sent++;
        }

        // 1. Meals: only when that part of the day really is empty.
        for (var i = 0; i < settings.MealTimes.Count; i++)
        {
            var key = $"meal{i}";
            if (!Due(key, settings.MealTimes[i])) continue;

            var day = await diary.GetDayAsync(profile.Uid, today, ct);
            var slot = SlotFor(settings.MealTimes[i]);
            if (day.Slot(slot).Count > 0) continue;

            await notifier.SendAsync(profile.Uid, new PushMessage(
                "ما سجّلت أكلك",
                $"سجّل {MealAr(slot)} وشوف كم باقي لك اليوم",
                "Nothing logged yet",
                $"Log your {slot.ToString().ToLowerInvariant()} and see what is left today",
                "/meals"), ct);

            Mark(key);
        }

        // 2. Training: only on a training day, and only if nothing was logged.
        if (settings.Training && Due("training", settings.TrainingTime))
        {
            var program = await training.GetProgramAsync(profile.Uid, ct);
            var weekday = WeekDays.IndexOf(localNow.DayOfWeek);
            var slot = program?.SlotFor(weekday);

            if (slot is not null && program!.Days.Count > slot)
            {
                var from = clock.UtcNow.Date;
                var sessions = await training.GetSessionsAsync(profile.Uid, from, 10, ct);

                if (sessions.Count == 0)
                {
                    var day = program.Days[slot.Value];
                    await notifier.SendAsync(profile.Uid, new PushMessage(
                        "اليوم يوم تمرينك",
                        $"{day.NameAr} — {day.Exercises.Count} تمارين بانتظارك",
                        "Training day",
                        $"{day.NameEn} — {day.Exercises.Count} exercises waiting",
                        "/training"), ct);

                    Mark("training");
                }
            }
        }

        // 3. The weekly weigh-in.
        if (settings.WeighIn
            && WeekDays.IndexOf(localNow.DayOfWeek) == settings.WeighInWeekday
            && Due("weighin", settings.WeighInTime))
        {
            var weights = await progress.GetWeightsAsync(profile.Uid, 1, ct);
            var last = weights.FirstOrDefault();

            if (last is null || (clock.UtcNow - last.TakenAtUtc).TotalDays >= 5)
            {
                await notifier.SendAsync(profile.Uid, new PushMessage(
                    "وزنك الأسبوعي",
                    "نفس اليوم ونفس الوقت كل أسبوع — هنا يبان الفرق",
                    "Your weekly weigh-in",
                    "Same day, same time each week — that is where the change shows",
                    "/progress"), ct);

                Mark("weighin");
            }
        }

        if (dirty)
        {
            Trim(settings);
            profile.UpdatedAtUtc = clock.UtcNow;
            await users.SaveAsync(profile, ct);
        }

        return sent;
    }

    public async Task<RemindersDto> UpdateAsync(string uid, RemindersDto request, CancellationToken ct = default)
    {
        var profile = await users.GetAsync(uid, ct) ?? throw new KeyNotFoundException("Profile not found.");
        var settings = profile.Reminders;

        settings.Enabled = request.Enabled;
        settings.UtcOffsetMinutes = Math.Clamp(request.UtcOffsetMinutes, -720, 840);
        settings.MealTimes = request.MealTimes
            .Where(time => ReminderSettings.TryParseTime(time, out _))
            .Distinct()
            .Take(4)
            .ToList();

        settings.Training = request.Training;
        if (ReminderSettings.TryParseTime(request.TrainingTime, out _)) settings.TrainingTime = request.TrainingTime;

        settings.WeighIn = request.WeighIn;
        settings.WeighInWeekday = Math.Clamp(request.WeighInWeekday, 0, 6);
        if (ReminderSettings.TryParseTime(request.WeighInTime, out _)) settings.WeighInTime = request.WeighInTime;

        profile.UpdatedAtUtc = clock.UtcNow;
        await users.SaveAsync(profile, ct);
        return Map(settings);
    }

    public static RemindersDto Map(ReminderSettings settings) => new(
        settings.Enabled, settings.UtcOffsetMinutes, settings.MealTimes,
        settings.Training, settings.TrainingTime,
        settings.WeighIn, settings.WeighInWeekday, settings.WeighInTime);

    /// <summary>A time of day says which meal it is about better than any setting would.</summary>
    private static MealSlot SlotFor(string at) =>
        ReminderSettings.TryParseTime(at, out var time)
            ? time.Hour switch
            {
                < 11 => MealSlot.Breakfast,
                < 16 => MealSlot.Lunch,
                < 18 => MealSlot.Snack,
                _ => MealSlot.Dinner
            }
            : MealSlot.Dinner;

    private static string MealAr(MealSlot slot) => slot switch
    {
        MealSlot.Breakfast => "فطورك",
        MealSlot.Lunch => "غداك",
        MealSlot.Snack => "سناكك",
        _ => "عشاك"
    };

    /// <summary>Yesterday's marks are noise; only the current day can stop a re-send.</summary>
    private static void Trim(ReminderSettings settings)
    {
        if (settings.LastSent.Count <= 8) return;
        var keep = settings.LastSent.OrderByDescending(pair => pair.Value).Take(8).ToDictionary(p => p.Key, p => p.Value);
        settings.LastSent = keep;
    }
}
