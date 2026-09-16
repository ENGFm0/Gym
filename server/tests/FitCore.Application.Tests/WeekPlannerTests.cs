using FitCore.Application.Training;
using FitCore.Domain.Common;
using FitCore.Domain.Entities;
using Xunit;

namespace FitCore.Application.Tests;

public class WeekPlannerTests
{
    [Theory]
    [InlineData(ActivityLevel.Light, 3)]
    [InlineData(ActivityLevel.Moderate, 4)]
    [InlineData(ActivityLevel.High, 5)]
    public void The_week_is_seeded_from_the_activity_level(ActivityLevel level, int expected)
    {
        var program = WeekPlanner.Seed(level);

        Assert.Equal(expected, program.DaysPerWeek);
        Assert.Equal(expected, program.Days.Count);
        Assert.Equal(expected, program.TrainingDays.Distinct().Count());
    }

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    [InlineData(4)]
    [InlineData(5)]
    [InlineData(6)]
    [InlineData(7)]
    public void Every_count_from_one_to_seven_has_a_split(int days)
    {
        var program = WeekPlanner.SetDaysPerWeek(new TrainingProgram(), days);

        Assert.Equal(days, program.Days.Count);
        Assert.All(program.Days, day => Assert.False(string.IsNullOrWhiteSpace(day.NameAr)));
        Assert.All(program.TrainingDays, weekday => Assert.InRange(weekday, 0, 6));
    }

    [Fact]
    public void Changing_the_count_keeps_the_exercises_already_entered()
    {
        var program = WeekPlanner.Seed(ActivityLevel.Moderate);
        program.Days[0].Exercises.Add(new ProgramExercise { NameAr = "بنش برس", NameEn = "Bench", Sets = 4, Reps = 10 });

        WeekPlanner.SetDaysPerWeek(program, 5);

        Assert.Single(program.Days[0].Exercises);
        Assert.Equal("بنش برس", program.Days[0].Exercises[0].NameAr);
    }

    [Fact]
    public void Flipping_a_rest_day_on_adds_a_training_day_in_weekday_order()
    {
        var program = WeekPlanner.SetDaysPerWeek(new TrainingProgram(), 3); // Sunday, Tuesday, Thursday
        Assert.Equal(new[] { 1, 3, 5 }, program.TrainingDays);

        WeekPlanner.ToggleDay(program, 0); // Saturday

        Assert.Equal(new[] { 0, 1, 3, 5 }, program.TrainingDays);
        Assert.Equal(4, program.Days.Count);
    }

    [Fact]
    public void Flipping_a_training_day_off_drops_that_day()
    {
        var program = WeekPlanner.SetDaysPerWeek(new TrainingProgram(), 4);
        var before = program.TrainingDays.ToList();

        WeekPlanner.ToggleDay(program, before[0]);

        Assert.DoesNotContain(before[0], program.TrainingDays);
        Assert.Equal(3, program.Days.Count);
    }

    [Fact]
    public void The_last_training_day_cannot_be_removed()
    {
        var program = WeekPlanner.SetDaysPerWeek(new TrainingProgram(), 1);
        var only = program.TrainingDays[0];

        WeekPlanner.ToggleDay(program, only);

        Assert.Single(program.TrainingDays);
    }

    [Fact]
    public void A_rest_day_has_no_slot_and_a_training_day_does()
    {
        var program = WeekPlanner.SetDaysPerWeek(new TrainingProgram(), 2); // Sunday and Wednesday

        Assert.Equal(0, program.SlotFor(1));
        Assert.Equal(1, program.SlotFor(4));
        Assert.Null(program.SlotFor(6)); // Friday is off
    }

    [Fact]
    public void Only_completed_sets_count_towards_the_volume()
    {
        var exercises = new List<SessionExercise>
        {
            new()
            {
                NameAr = "سكوات",
                Sets =
                {
                    new SetLog { WeightKg = 100, Reps = 5, Done = true },
                    new SetLog { WeightKg = 100, Reps = 5, Done = false }
                }
            }
        };

        var (volume, sets) = WeekPlanner.Tally(exercises);

        Assert.Equal(500, volume);
        Assert.Equal(1, sets);
    }

    [Fact]
    public void The_week_starts_on_saturday()
    {
        Assert.Equal(0, WeekDays.IndexOf(DayOfWeek.Saturday));
        Assert.Equal(6, WeekDays.IndexOf(DayOfWeek.Friday));

        var wednesday = new DateTime(2026, 9, 16, 12, 0, 0, DateTimeKind.Utc);
        Assert.Equal(new DateTime(2026, 9, 12), WeekDays.StartOfWeek(wednesday));
    }
}
