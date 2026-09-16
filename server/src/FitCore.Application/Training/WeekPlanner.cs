using FitCore.Application.Catalogs;
using FitCore.Domain.Common;
using FitCore.Domain.Entities;

namespace FitCore.Application.Training;

/// <summary>
/// Turns "how many days a week" into an actual week: which weekdays are training days,
/// which split lands on each of them, and what happens when the member flips a day.
/// </summary>
public static class WeekPlanner
{
    /// <summary>Where the training days sit for a given count, rest spread in between. Saturday = 0.</summary>
    public static readonly IReadOnlyDictionary<int, int[]> Shapes = new Dictionary<int, int[]>
    {
        [1] = new[] { 1 },
        [2] = new[] { 1, 4 },
        [3] = new[] { 1, 3, 5 },
        [4] = new[] { 0, 1, 3, 4 },
        [5] = new[] { 0, 1, 2, 4, 5 },
        [6] = new[] { 0, 1, 2, 3, 4, 5 },
        [7] = new[] { 0, 1, 2, 3, 4, 5, 6 }
    };

    public static readonly IReadOnlyDictionary<int, (string Ar, string En)[]> Templates =
        new Dictionary<int, (string, string)[]>
        {
            [1] = new[] { ("جسم كامل", "Full body") },
            [2] = new[] { ("علوي", "Upper body"), ("سفلي", "Lower body") },
            [3] = new[] { ("دفع", "Push"), ("سحب", "Pull"), ("أرجل", "Legs") },
            [4] = new[]
            {
                ("صدر وترايسبس", "Chest & triceps"), ("ظهر وبايسبس", "Back & biceps"),
                ("أرجل", "Legs"), ("أكتاف وبطن", "Shoulders & core")
            },
            [5] = new[]
            {
                ("صدر", "Chest"), ("ظهر", "Back"), ("أرجل", "Legs"),
                ("أكتاف", "Shoulders"), ("ذراعين", "Arms")
            },
            [6] = new[]
            {
                ("دفع أ", "Push A"), ("سحب أ", "Pull A"), ("أرجل أ", "Legs A"),
                ("دفع ب", "Push B"), ("سحب ب", "Pull B"), ("أرجل ب", "Legs B")
            },
            [7] = new[]
            {
                ("دفع أ", "Push A"), ("سحب أ", "Pull A"), ("أرجل أ", "Legs A"),
                ("دفع ب", "Push B"), ("سحب ب", "Pull B"), ("أرجل ب", "Legs B"),
                ("كارديو وبطن", "Cardio & core")
            }
        };

    /// <summary>The starting point comes from the activity level captured at signup.</summary>
    public static int SuggestedDays(ActivityLevel level) => level switch
    {
        ActivityLevel.High => 5,
        ActivityLevel.Moderate => 4,
        _ => 3
    };

    public static TrainingProgram Seed(ActivityLevel level)
    {
        var days = SuggestedDays(level);
        var program = new TrainingProgram { TrainingDays = Shapes[days].ToList() };
        Reflow(program);
        return program;
    }

    /// <summary>Renames the splits to match the number of days, keeping the exercises already entered.</summary>
    public static TrainingProgram Reflow(TrainingProgram program)
    {
        program.TrainingDays = program.TrainingDays
            .Where(d => d is >= 0 and < WeekDays.Count)
            .Distinct()
            .OrderBy(d => d)
            .ToList();

        if (program.TrainingDays.Count == 0) program.TrainingDays.Add(1);
        var count = Math.Clamp(program.TrainingDays.Count, 1, 7);

        var template = Templates[count];
        var kept = program.Days;
        program.Days = template
            .Select((slot, index) => new ProgramDay
            {
                NameAr = slot.Ar,
                NameEn = slot.En,
                Exercises = index < kept.Count ? kept[index].Exercises : new List<ProgramExercise>()
            })
            .ToList();

        program.UpdatedAtUtc = DateTime.UtcNow;
        return program;
    }

    /// <summary>Picks a whole week for a given count, replacing whatever was selected.</summary>
    public static TrainingProgram SetDaysPerWeek(TrainingProgram program, int daysPerWeek)
    {
        var count = Math.Clamp(daysPerWeek, 1, 7);
        program.TrainingDays = Shapes[count].ToList();
        return Reflow(program);
    }

    /// <summary>Flips one weekday between training and rest. The last training day cannot be removed.</summary>
    public static TrainingProgram ToggleDay(TrainingProgram program, int weekday)
    {
        if (weekday is < 0 or >= WeekDays.Count) return program;

        var at = program.TrainingDays.IndexOf(weekday);
        if (at >= 0)
        {
            if (program.TrainingDays.Count == 1) return program;
            program.TrainingDays.RemoveAt(at);
            if (at < program.Days.Count) program.Days.RemoveAt(at);
        }
        else
        {
            program.TrainingDays.Add(weekday);
            program.TrainingDays.Sort();
            var position = program.TrainingDays.IndexOf(weekday);
            program.Days.Insert(Math.Min(position, program.Days.Count), new ProgramDay());
        }

        return Reflow(program);
    }

    /// <summary>Adds up the volume of the sets that were actually completed.</summary>
    public static (double Volume, int Sets) Tally(IEnumerable<SessionExercise> exercises)
    {
        double volume = 0;
        var sets = 0;
        foreach (var exercise in exercises)
        {
            foreach (var set in exercise.Sets)
            {
                if (!set.Done) continue;
                volume += (set.WeightKg ?? 0) * set.Reps;
                sets++;
            }
        }
        return (Math.Round(volume), sets);
    }
}
