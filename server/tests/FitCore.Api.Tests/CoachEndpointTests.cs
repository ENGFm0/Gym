using System.Net;
using System.Net.Http.Json;
using FitCore.Application.Contracts;
using Xunit;

namespace FitCore.Api.Tests;

/// <summary>
/// The coaching rules, which are the ones with teeth: nothing is readable before the member
/// accepts, and no coach can reach a member who is not theirs.
/// </summary>
public class CoachEndpointTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task An_invite_reveals_nothing_until_it_is_accepted()
    {
        var coach = factory.ClientFor("coach-a", "coach.a@example.com", coach: true);
        var member = factory.ClientFor("member-a", "member.a@example.com");

        await coach.GetAsync("/api/me/profile");
        await member.GetAsync("/api/me/profile");

        var invited = await coach.PostAsJsonAsync("/api/coach/trainees",
            new InviteTraineeRequest("member.a@example.com", "عضو"));
        invited.EnsureSuccessStatusCode();
        var invite = await invited.Content.ReadFromJsonAsync<InviteDto>();

        // Before accepting: the coach sees a pending row and cannot read the member.
        var blocked = await coach.GetAsync("/api/coach/trainees/member-a/week");
        Assert.Equal(HttpStatusCode.Forbidden, blocked.StatusCode);

        var waiting = await member.GetFromJsonAsync<List<InviteDto>>("/api/me/invites");
        Assert.Single(waiting!);

        var accepted = await member.PostAsync($"/api/me/invites/{invite!.Id}/accept", null);
        accepted.EnsureSuccessStatusCode();

        // After accepting: the link exists and the week is readable.
        var week = await coach.GetAsync("/api/coach/trainees/member-a/week");
        Assert.Equal(HttpStatusCode.OK, week.StatusCode);

        var roster = await coach.GetFromJsonAsync<List<TraineeDto>>("/api/coach/trainees");
        Assert.Contains(roster!, trainee => trainee.Uid == "member-a" && trainee.Status == "active");
    }

    [Fact]
    public async Task An_invite_sent_to_someone_else_cannot_be_accepted()
    {
        var coach = factory.ClientFor("coach-b", "coach.b@example.com", coach: true);
        var stranger = factory.ClientFor("member-b", "someone.else@example.com");

        await coach.GetAsync("/api/me/profile");
        var invited = await coach.PostAsJsonAsync("/api/coach/trainees",
            new InviteTraineeRequest("intended@example.com", null));
        var invite = await invited.Content.ReadFromJsonAsync<InviteDto>();

        var response = await stranger.PostAsync($"/api/me/invites/{invite!.Id}/accept", null);
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task A_coach_cannot_read_a_member_who_is_not_theirs()
    {
        var other = factory.ClientFor("coach-c", "coach.c@example.com", coach: true);
        await other.GetAsync("/api/me/profile");

        foreach (var route in new[] { "week", "weights", "photos" })
        {
            var response = await other.GetAsync($"/api/coach/trainees/member-a/{route}");
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        }
    }

    [Fact]
    public async Task What_a_coach_assigns_changes_the_members_plan_and_the_member_can_drop_it()
    {
        var coach = factory.ClientFor("coach-d", "coach.d@example.com", coach: true);
        var member = factory.ClientFor("member-d", "member.d@example.com");

        await coach.GetAsync("/api/me/profile");
        await member.PutAsJsonAsync("/api/me/profile", new UpdateProfileRequest(
            "متدرب", null, "male", new DateOnly(1996, 4, 20), 185, 92.8, 88,
            "moderate", "fatloss", 0.5, "balanced", "kg", "cm", 90));

        var invited = await coach.PostAsJsonAsync("/api/coach/trainees",
            new InviteTraineeRequest("member.d@example.com", "متدرب"));
        var invite = await invited.Content.ReadFromJsonAsync<InviteDto>();
        await member.PostAsync($"/api/me/invites/{invite!.Id}/accept", null);

        var before = await member.GetFromJsonAsync<PlanDto>("/api/me/plan");

        var assigned = await coach.PutAsJsonAsync("/api/coach/trainees/member-d/plan",
            new AssignRequest("keto", 2400, "نبدأ كيتو أسبوعين"));
        assigned.EnsureSuccessStatusCode();

        var after = await member.GetFromJsonAsync<PlanDto>("/api/me/plan");
        Assert.Equal("keto", after!.DietId);
        Assert.Equal(2400, after.Calories);
        Assert.True(after.Macros.Fat > before!.Macros.Fat);

        // The member was told, and can walk away.
        Assert.Contains(factory.Notifier.Sent, sent => sent.Uid == "member-d");

        await member.PostAsync("/api/me/leave-coach", null);
        var own = await member.GetFromJsonAsync<PlanDto>("/api/me/plan");
        Assert.Equal("balanced", own!.DietId);
    }

    [Fact]
    public async Task A_coach_can_set_the_training_week_and_the_member_sees_it()
    {
        var coach = factory.ClientFor("coach-e", "coach.e@example.com", coach: true);
        var member = factory.ClientFor("member-e", "member.e@example.com");

        await coach.GetAsync("/api/me/profile");
        await member.GetAsync("/api/me/profile");

        var invited = await coach.PostAsJsonAsync("/api/coach/trainees",
            new InviteTraineeRequest("member.e@example.com", "متدرب"));
        var invite = await invited.Content.ReadFromJsonAsync<InviteDto>();
        await member.PostAsync($"/api/me/invites/{invite!.Id}/accept", null);

        var set = await coach.PutAsJsonAsync("/api/coach/trainees/member-e/program", new SetProgramRequest(
            new[] { 1, 3, 5 },
            new[]
            {
                new ProgramDayDto(0, 1, "", "", "", "", new[] { new ExerciseDto("سكوات", "Squat", 5, 5) })
            }));
        set.EnsureSuccessStatusCode();

        var theirs = await member.GetFromJsonAsync<ProgramDto>("/api/training/program");
        Assert.Equal(3, theirs!.DaysPerWeek);
        Assert.Equal("سكوات", theirs.Days[0].Exercises.Single().NameAr);
    }

    [Fact]
    public async Task The_reminder_job_needs_the_secret()
    {
        var anonymous = factory.CreateClient();

        var without = await anonymous.PostAsync("/api/jobs/reminders", null);
        Assert.Equal(HttpStatusCode.Unauthorized, without.StatusCode);

        anonymous.DefaultRequestHeaders.Add("X-Job-Secret", "test-secret");
        var with = await anonymous.PostAsync("/api/jobs/reminders", null);
        Assert.Equal(HttpStatusCode.OK, with.StatusCode);
    }
}
