using System.Net;
using System.Net.Http.Json;
using FitCore.Application.Contracts;
using Xunit;

namespace FitCore.Api.Tests;

/// <summary>The routes a member uses, end to end through the real pipeline.</summary>
public class MemberEndpointTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    private const string Uid = "member-1";

    [Fact]
    public async Task Health_is_open()
    {
        var response = await factory.CreateClient().GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Without_a_token_nothing_is_readable()
    {
        var response = await factory.CreateClient().GetAsync("/api/me/profile");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task The_profile_is_created_on_first_read_and_drives_the_plan()
    {
        var client = factory.ClientFor("plan-1", "plan1@example.com");

        var created = await client.GetFromJsonAsync<ProfileDto>("/api/me/profile");
        Assert.NotNull(created);
        Assert.Equal("plan-1", created!.Uid);

        var update = await client.PutAsJsonAsync("/api/me/profile", new UpdateProfileRequest(
            "فهد", null, "male", new DateOnly(1996, 4, 20), 185, 92.8, 88,
            "moderate", "fatloss", 0.5, "balanced", "kg", "cm", 90));
        update.EnsureSuccessStatusCode();

        var plan = await client.GetFromJsonAsync<PlanDto>("/api/me/plan");
        Assert.NotNull(plan);
        Assert.Equal(1940, plan!.Bmr);                       // Mifflin-St Jeor, by hand
        Assert.True(plan.Calories < plan.Tdee);              // cutting
        Assert.InRange(plan.Bmi, 27.0, 27.2);
    }

    [Fact]
    public async Task Logging_food_moves_the_day_totals()
    {
        var client = factory.ClientFor("diary-1", "diary1@example.com");
        await client.GetAsync("/api/me/profile");

        var date = factory.Clock.Today.ToString("yyyy-MM-dd");
        var response = await client.PostAsJsonAsync($"/api/diary/{date}/entries",
            new AddMealEntryRequest("lunch", "chick", 200, null, null, null, null, null, null, null));

        var day = await response.Content.ReadFromJsonAsync<DayDto>();
        Assert.NotNull(day);
        Assert.Equal(330, day!.Totals.Calories);             // 165 per 100 g, twice
        Assert.Equal(62, day.Totals.Protein);

        var entryId = day.Meals.Single(meal => meal.Slot == "lunch").Items.Single().Id;
        var after = await client.DeleteAsync($"/api/diary/{date}/entries/{entryId}");
        var empty = await after.Content.ReadFromJsonAsync<DayDto>();
        Assert.Equal(0, empty!.Totals.Calories);
    }

    [Fact]
    public async Task Steps_feed_the_burn_and_what_is_left_to_eat()
    {
        var client = factory.ClientFor("steps-1", "steps1@example.com");
        await client.GetAsync("/api/me/profile");

        var date = factory.Clock.Today.ToString("yyyy-MM-dd");
        var response = await client.PatchAsJsonAsync($"/api/diary/{date}", new PatchDayRequest(10_000, 1.5, "phone"));
        var day = await response.Content.ReadFromJsonAsync<DayDto>();

        Assert.Equal(10_000, day!.Steps);
        Assert.Equal(400, day.BurnedCalories);               // 0.04 kcal a step
        Assert.Equal(day.Plan.Calories + 400, day.CaloriesLeft);
    }

    [Fact]
    public async Task Every_weigh_in_is_kept_with_its_difference()
    {
        var client = factory.ClientFor("weight-1", "weight1@example.com");
        await client.GetAsync("/api/me/profile");

        await client.PostAsJsonAsync("/api/progress/weights", new AddWeightRequest(93.4, "kg", null, null, null));
        factory.Clock.UtcNow = factory.Clock.UtcNow.AddDays(3);
        var response = await client.PostAsJsonAsync("/api/progress/weights", new AddWeightRequest(92.8, "kg", null, null, null));

        var readings = await response.Content.ReadFromJsonAsync<List<WeightDto>>();
        Assert.Equal(2, readings!.Count);                     // the old one stayed
        Assert.Equal(92.8, readings[0].Kg);
        Assert.Equal(-0.6, readings[0].Delta);
    }

    [Fact]
    public async Task The_training_week_rearranges_and_keeps_its_exercises()
    {
        var client = factory.ClientFor("prog-1", "prog1@example.com");
        await client.GetAsync("/api/me/profile");

        var program = await client.GetFromJsonAsync<ProgramDto>("/api/training/program");
        Assert.NotNull(program);

        var five = await client.PutAsJsonAsync("/api/training/program/days", new SetTrainingDaysRequest(5, null, null));
        var week = await five.Content.ReadFromJsonAsync<ProgramDto>();
        Assert.Equal(5, week!.DaysPerWeek);
        Assert.Equal(2, week.RestDays.Count);

        await client.PutAsJsonAsync("/api/training/program/days/0/exercises",
            new SaveDayExercisesRequest(new[] { new ExerciseDto("بنش برس", "Bench press", 4, 10) }));

        var toggled = await client.PutAsJsonAsync("/api/training/program/days", new SetTrainingDaysRequest(null, 6, null));
        var after = await toggled.Content.ReadFromJsonAsync<ProgramDto>();

        Assert.Equal(6, after!.DaysPerWeek);
        Assert.Contains(after.Days, day => day.Exercises.Any(exercise => exercise.NameAr == "بنش برس"));
    }

    [Fact]
    public async Task A_logged_session_is_counted_and_burns_by_met()
    {
        var client = factory.ClientFor("session-1", "session1@example.com");
        await client.PutAsJsonAsync("/api/me/profile", new UpdateProfileRequest(
            null, null, null, null, null, 92.8, null, null, null, null, null, null, null, null));

        var response = await client.PostAsJsonAsync("/api/training/sessions",
            new LogSessionRequest("swim", 45, 1.4, null, null));

        var session = await response.Content.ReadFromJsonAsync<SessionDto>();
        Assert.Equal(487, session!.Calories);                 // 7 MET x 92.8 kg x 0.75 h

        var week = await client.GetFromJsonAsync<WeekSummaryDto>("/api/training/week");
        Assert.Equal(1, week!.SessionsDone);
        Assert.Equal(487, week.CaloriesBurned);
    }

    [Fact]
    public async Task A_session_with_no_completed_sets_is_refused()
    {
        var client = factory.ClientFor("session-2", "session2@example.com");
        await client.GetAsync("/api/me/profile");

        var response = await client.PostAsJsonAsync("/api/training/sessions", new LogSessionRequest(
            "gym", null, null, null,
            new[]
            {
                new SessionExerciseDto("سكوات", "Squat", new[] { new SetLogDto(100, 5, false) })
            }));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task The_scan_stops_at_the_daily_allowance()
    {
        var client = factory.ClientFor("scan-1", "scan1@example.com");
        await client.GetAsync("/api/me/profile");

        HttpResponseMessage? last = null;
        for (var i = 0; i < 4; i++) last = await PostImage(client);

        Assert.Equal(HttpStatusCode.OK, last!.StatusCode);
        var reading = await last.Content.ReadFromJsonAsync<InBodyScanDto>();
        Assert.Equal(88.4, reading!.WeightKg);

        // The per-day counter is what the rest of the allowance runs into.
        for (var i = 0; i < 20; i++) last = await PostImage(client);
        Assert.Contains(last!.StatusCode, new[] { HttpStatusCode.Conflict, HttpStatusCode.TooManyRequests });
    }

    private static async Task<HttpResponseMessage> PostImage(HttpClient client)
    {
        using var content = new MultipartFormDataContent();
        var image = new ByteArrayContent(new byte[] { 1, 2, 3, 4 });
        image.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/jpeg");
        content.Add(image, "image", "inbody.jpg");
        return await client.PostAsync("/api/scan/inbody", content);
    }

    [Fact]
    public async Task Data_can_be_taken_out_and_the_account_deleted()
    {
        var client = factory.ClientFor("gone-1", "gone1@example.com");
        await client.GetAsync("/api/me/profile");
        await client.PostAsJsonAsync("/api/progress/weights", new AddWeightRequest(80, "kg", null, null, null));

        var export = await client.GetAsync("/api/me/export");
        export.EnsureSuccessStatusCode();
        var text = await export.Content.ReadAsStringAsync();
        Assert.Contains("weights", text);

        var refused = await client.DeleteAsync("/api/me?confirm=no");
        Assert.Equal(HttpStatusCode.BadRequest, refused.StatusCode);

        var deleted = await client.DeleteAsync("/api/me?confirm=delete");
        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);
        Assert.Contains("gone-1", factory.Identity.Deleted);
        Assert.False(factory.Users.Items.ContainsKey("gone-1"));
    }
}
