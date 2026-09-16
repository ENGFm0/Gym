using FitCore.Domain.Common;

namespace FitCore.Domain.ValueObjects;

/// <summary>The units a member reads their numbers in. Everything is stored metric.</summary>
public sealed record UnitPreference(MassUnit Mass = MassUnit.Kg, LengthUnit Length = LengthUnit.Cm)
{
    public const double KgPerLb = 0.45359237;
    public const double CmPerInch = 2.54;

    public double ToDisplayMass(double kg) => Mass == MassUnit.Lb ? kg / KgPerLb : kg;
    public double ToStoredMass(double value) => Mass == MassUnit.Lb ? value * KgPerLb : value;
    public double ToDisplayLength(double cm) => Length == LengthUnit.In ? cm / CmPerInch : cm;
    public double ToStoredLength(double value) => Length == LengthUnit.In ? value * CmPerInch : value;
}
