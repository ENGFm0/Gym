using FitCore.Application.Nutrition;
using FitCore.Domain.Common;
using FitCore.Domain.Entities;
using Xunit;

namespace FitCore.Application.Tests;

public class PlanCalculatorTests
{
    private static readonly DateOnly Today = new(2026, 9, 16);

    private static UserProfile Member(Action<UserProfile>? tweak = null)
    {
        var profile = new UserProfile
        {
            Uid = "u1",
            Gender = Gender.Male,
            BirthDate = new DateOnly(1996, 4, 20),
            HeightCm = 185,
            WeightKg = 92.8,
            Activity = ActivityLevel.Moderate,
            Goal = Goal.FatLoss,
            PaceKgPerWeek = 0.5,
            DietId = "balanced"
        };
        tweak?.Invoke(profile);
        return profile;
    }

    [Fact]
    public void Bmr_follows_mifflin_st_jeor()
    {
        var plan = PlanCalculator.For(Member(), Today);

        // 10*92.8 + 6.25*185 - 5*30 + 5 = 1939.5
        Assert.Equal(1940, plan.Bmr);
    }

    [Fact]
    public void Age_comes_from_the_birth_date_not_a_stored_number()
    {
        var beforeBirthday = PlanCalculator.For(Member(), new DateOnly(2026, 4, 19));
        var afterBirthday = PlanCalculator.For(Member(), new DateOnly(2026, 4, 21));

        Assert.True(beforeBirthday.Bmr > afterBirthday.Bmr); // one year older burns 5 kcal less
    }

    [Theory]
    [InlineData(ActivityLevel.Light, 1.375)]
    [InlineData(ActivityLevel.Moderate, 1.55)]
    [InlineData(ActivityLevel.High, 1.725)]
    public void Tdee_uses_the_activity_factor(ActivityLevel level, double pal)
    {
        var plan = PlanCalculator.For(Member(p => p.Activity = level), Today);
        Assert.Equal(pal, PlanCalculator.PalFor(level));
        // Rounding can land either side, so allow the one kcal — Assert.Equal's tolerance
        // overload has no int form and the call is ambiguous.
        var expected = (int)Math.Round(plan.Bmr * pal);
        Assert.InRange(plan.Tdee, expected - 1, expected + 1);
    }

    [Fact]
    public void Cutting_subtracts_the_pace_and_bulking_adds_it()
    {
        var cut = PlanCalculator.For(Member(p => { p.Goal = Goal.FatLoss; p.PaceKgPerWeek = 0.5; }), Today);
        var hold = PlanCalculator.For(Member(p => p.Goal = Goal.Maintenance), Today);
        var bulk = PlanCalculator.For(Member(p => { p.Goal = Goal.Bulking; p.PaceKgPerWeek = 0.5; }), Today);

        Assert.True(cut.Calories < hold.Calories);
        Assert.True(bulk.Calories > hold.Calories);
        Assert.Equal(1000, bulk.Calories - cut.Calories);
    }

    [Fact]
    public void Calories_never_fall_below_the_floor()
    {
        var plan = PlanCalculator.For(Member(p =>
        {
            p.WeightKg = 45;
            p.HeightCm = 150;
            p.Gender = Gender.Female;
            p.Goal = Goal.FatLoss;
            p.PaceKgPerWeek = 1.0;
        }), Today);

        Assert.Equal(1200, plan.Calories);
    }

    [Fact]
    public void Macros_split_by_diet_and_add_back_up_to_the_target()
    {
        var keto = PlanCalculator.For(Member(p => p.DietId = "keto"), Today);
        var balanced = PlanCalculator.For(Member(p => p.DietId = "balanced"), Today);

        Assert.True(keto.Macros.Fat > balanced.Macros.Fat);
        Assert.True(keto.Macros.Carbs < balanced.Macros.Carbs);

        var fromMacros = balanced.Macros.Protein * 4 + balanced.Macros.Carbs * 4 + balanced.Macros.Fat * 9;
        Assert.InRange(fromMacros, balanced.Calories - 15, balanced.Calories + 15);
    }

    [Fact]
    public void An_unknown_diet_falls_back_to_balanced()
    {
        var unknown = PlanCalculator.For(Member(p => p.DietId = "carnivore-extreme"), Today);
        var balanced = PlanCalculator.For(Member(p => p.DietId = "balanced"), Today);

        Assert.Equal(balanced.Macros, unknown.Macros);
    }

    [Theory]
    [InlineData(60, 180, "وزن طبيعي")]
    [InlineData(110, 175, "سمنة")]
    [InlineData(48, 175, "نحافة")]
    public void Bmi_bands(double kg, double cm, string expected)
    {
        var (_, band, _) = PlanCalculator.Bmi(kg, cm);
        Assert.Equal(expected, band);
    }
}

public class CoachAssignmentTests
{
    private static readonly DateOnly Today = new(2026, 9, 16);

    private static UserProfile Member() => new()
    {
        Uid = "u1",
        Gender = Gender.Male,
        BirthDate = new DateOnly(1996, 4, 20),
        HeightCm = 185,
        WeightKg = 92.8,
        Activity = ActivityLevel.Moderate,
        Goal = Goal.FatLoss,
        PaceKgPerWeek = 0.5,
        DietId = "balanced"
    };

    [Fact]
    public void A_coachs_diet_wins_over_the_members_own_pick()
    {
        var member = Member();
        var own = PlanCalculator.For(member, Today);

        member.Assignment = new CoachAssignment { CoachUid = "c1", CoachName = "المدرّب", DietId = "keto" };
        var coached = PlanCalculator.For(member, Today);

        Assert.True(coached.Macros.Fat > own.Macros.Fat);
        Assert.Equal("keto", coached.DietId);
    }

    [Fact]
    public void A_coach_can_set_the_calories_outright()
    {
        var member = Member();
        member.Assignment = new CoachAssignment { CoachUid = "c1", CalorieOverride = 2400 };

        Assert.Equal(2400, PlanCalculator.For(member, Today).Calories);
    }

    [Fact]
    public void Even_a_coach_cannot_go_below_the_floor()
    {
        var member = Member();
        member.Assignment = new CoachAssignment { CoachUid = "c1", CalorieOverride = 600 };

        Assert.Equal(1200, PlanCalculator.For(member, Today).Calories);
    }
}
