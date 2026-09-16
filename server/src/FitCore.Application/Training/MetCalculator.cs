namespace FitCore.Application.Training;

/// <summary>Energy from movement: MET x body mass x hours, plus what the pedometer picked up.</summary>
public static class MetCalculator
{
    /// <summary>Roughly 0.04 kcal per step for an average adult.</summary>
    public const double CaloriesPerStep = 0.04;

    public static int Burn(double met, int minutes, double weightKg)
    {
        if (minutes <= 0 || met <= 0) return 0;
        var kg = weightKg > 0 ? weightKg : 80;
        return (int)Math.Round(met * kg * (minutes / 60.0));
    }

    public static int StepBurn(int steps) => (int)Math.Round(Math.Max(0, steps) * CaloriesPerStep);
}
