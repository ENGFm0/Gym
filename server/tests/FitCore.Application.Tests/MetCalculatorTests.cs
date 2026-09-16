using FitCore.Application.Training;
using Xunit;

namespace FitCore.Application.Tests;

public class MetCalculatorTests
{
    [Fact]
    public void Burn_is_met_times_mass_times_hours()
    {
        // Swimming at MET 7 for 45 minutes at 92.8 kg: 7 * 92.8 * 0.75
        Assert.Equal(487, MetCalculator.Burn(7, 45, 92.8));
    }

    [Fact]
    public void A_missing_weight_falls_back_rather_than_returning_zero()
    {
        Assert.Equal(MetCalculator.Burn(7, 45, 80), MetCalculator.Burn(7, 45, 0));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-30)]
    public void No_minutes_means_no_burn(int minutes) => Assert.Equal(0, MetCalculator.Burn(7, minutes, 90));

    [Fact]
    public void Steps_burn_is_proportional_and_never_negative()
    {
        Assert.Equal(400, MetCalculator.StepBurn(10_000));
        Assert.Equal(0, MetCalculator.StepBurn(-500));
    }
}
