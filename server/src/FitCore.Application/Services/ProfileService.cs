using FitCore.Application.Abstractions;
using FitCore.Application.Contracts;
using FitCore.Application.Nutrition;
using FitCore.Domain.Common;
using FitCore.Domain.Entities;
using FitCore.Domain.ValueObjects;

namespace FitCore.Application.Services;

public sealed class ProfileService(IUserRepository users, IClock clock)
{
    public async Task<UserProfile> GetOrCreateAsync(string uid, string? email, string? name, CancellationToken ct = default)
    {
        var profile = await users.GetAsync(uid, ct);
        if (profile is not null) return profile;

        profile = new UserProfile { Uid = uid, Email = email, DisplayName = name };
        await users.SaveAsync(profile, ct);
        return profile;
    }

    public async Task<ProfileDto> UpdateAsync(string uid, UpdateProfileRequest request, CancellationToken ct = default)
    {
        var profile = await GetOrCreateAsync(uid, null, null, ct);

        if (request.Name is not null) profile.DisplayName = request.Name;
        if (request.Phone is not null) profile.Phone = request.Phone;
        if (request.BirthDate is not null) profile.BirthDate = request.BirthDate;
        if (request.Gender is not null && Enum.TryParse<Gender>(request.Gender, true, out var gender)) profile.Gender = gender;
        if (request.Activity is not null && Enum.TryParse<ActivityLevel>(request.Activity, true, out var activity)) profile.Activity = activity;
        if (request.Goal is not null && Enum.TryParse<Goal>(request.Goal, true, out var goal)) profile.Goal = goal;
        if (request.DietId is not null) profile.DietId = request.DietId;
        if (request.Pace is not null) profile.PaceKgPerWeek = Math.Clamp(request.Pace.Value, 0.1, 1.0);
        if (request.RestSeconds is not null) profile.RestSeconds = Math.Clamp(request.RestSeconds.Value, 15, 600);

        var mass = request.MassUnit is not null && Enum.TryParse<MassUnit>(request.MassUnit, true, out var m)
            ? m : profile.Units.Mass;
        var length = request.LengthUnit is not null && Enum.TryParse<LengthUnit>(request.LengthUnit, true, out var l)
            ? l : profile.Units.Length;
        profile.Units = new UnitPreference(mass, length);

        // Incoming body numbers are in the member's own units; storage stays metric.
        if (request.HeightCm is > 0) profile.HeightCm = Math.Round(profile.Units.ToStoredLength(request.HeightCm.Value), 1);
        if (request.WeightKg is > 0) profile.WeightKg = Math.Round(profile.Units.ToStoredMass(request.WeightKg.Value), 1);
        if (request.TargetWeightKg is > 0) profile.TargetWeightKg = Math.Round(profile.Units.ToStoredMass(request.TargetWeightKg.Value), 1);

        profile.UpdatedAtUtc = clock.UtcNow;
        await users.SaveAsync(profile, ct);
        return Map(profile, clock.Today);
    }

    public async Task<ProfileDto> SetCoachAsync(string uid, bool isCoach, CancellationToken ct = default)
    {
        var profile = await GetOrCreateAsync(uid, null, null, ct);
        profile.IsCoach = isCoach;
        profile.UpdatedAtUtc = clock.UtcNow;
        await users.SaveAsync(profile, ct);
        return Map(profile, clock.Today);
    }

    public ProfileDto Map(UserProfile profile) => Map(profile, clock.Today);

    public static ProfileDto Map(UserProfile p, DateOnly today) => new(
        p.Uid,
        p.DisplayName,
        p.Email,
        p.Phone,
        p.Gender.ToString().ToLowerInvariant(),
        p.BirthDate,
        p.AgeOn(today),
        p.HeightCm,
        p.WeightKg,
        p.TargetWeightKg,
        p.Activity.ToString().ToLowerInvariant(),
        p.Goal.ToString().ToLowerInvariant(),
        p.PaceKgPerWeek,
        p.DietId,
        new UnitsDto(p.Units.Mass.ToString().ToLowerInvariant(), p.Units.Length.ToString().ToLowerInvariant()),
        p.RestSeconds,
        p.IsCoach);

    public PlanDto PlanFor(UserProfile profile)
    {
        var plan = PlanCalculator.For(profile, clock.Today);
        var (bmi, ar, en) = PlanCalculator.Bmi(profile.WeightKg, profile.HeightCm);
        return new PlanDto(
            plan.Bmr, plan.Tdee, plan.Calories,
            new MacrosDto(plan.Macros.Protein, plan.Macros.Carbs, plan.Macros.Fat),
            plan.DietId, bmi, ar, en);
    }
}
