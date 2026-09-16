using System.Text.Json;
using Anthropic;
using Anthropic.Models.Messages;
using FitCore.Application.Abstractions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FitCore.Infrastructure.Scanning;

public sealed class ClaudeOptions
{
    public const string SectionName = "Anthropic";

    /// <summary>Read from configuration; falls back to the ANTHROPIC_API_KEY the SDK picks up itself.</summary>
    public string? ApiKey { get; set; }

    public string Model { get; set; } = "claude-opus-5";

    public int MaxTokens { get; set; } = 2048;
}

/// <summary>
/// Reads a body-composition printout with Claude and returns typed numbers.
/// The schema is enforced server side through structured output, so the response is
/// always shaped the same and never needs to be parsed out of prose.
/// </summary>
public sealed class ClaudeInBodyScanner : IInBodyScanner
{
    private const string Instruction = """
        This photo is a body composition report (InBody, Tanita, a smart scale app, or similar),
        and it may be in Arabic or English.

        Read the printed values and return them in the schema. Rules:
        - Report every value in metric units: kilograms, centimetres, litres, percent.
        - If the sheet prints pounds, convert to kilograms.
        - Use null for anything not printed or not legible. Never estimate a number that is not there.
        - measuredOn is the date printed on the sheet, as yyyy-MM-dd, or null.
        - confidence is your own read on how legible the sheet is: 1 when the numbers are crisp,
          below 0.5 when glare, angle or blur mean the member should check the values.
        - note: one short sentence, in the same language as the sheet, saying what was unreadable.
          Empty string when everything was clear.
        """;

    private static readonly Dictionary<string, JsonElement> Schema = BuildSchema();

    private readonly AnthropicClient _client;
    private readonly ClaudeOptions _options;
    private readonly ILogger<ClaudeInBodyScanner> _log;

    public ClaudeInBodyScanner(IOptions<ClaudeOptions> options, ILogger<ClaudeInBodyScanner> log)
    {
        _options = options.Value;
        _log = log;
        _client = string.IsNullOrWhiteSpace(_options.ApiKey)
            ? new AnthropicClient()
            : new AnthropicClient { ApiKey = _options.ApiKey };
    }

    public async Task<InBodyReading> ReadAsync(byte[] image, string mediaType, CancellationToken ct = default)
    {
        var response = await _client.Messages.Create(new MessageCreateParams
        {
            Model = _options.Model,
            MaxTokens = _options.MaxTokens,
            OutputConfig = new OutputConfig
            {
                Format = new JsonOutputFormat { Schema = Schema }
            },
            Messages =
            [
                new()
                {
                    Role = Role.User,
                    Content = new List<ContentBlockParam>
                    {
                        new ImageBlockParam
                        {
                            Source = new Base64ImageSource
                            {
                                Data = Convert.ToBase64String(image),
                                MediaType = ToMediaType(mediaType)
                            }
                        },
                        new TextBlockParam { Text = Instruction }
                    }
                }
            ]
        }, ct);

        // A safety classifier can decline the request: that arrives as a normal 200 response
        // carrying stop details, which are populated for a refusal and nothing else.
        if (response.StopDetails is not null)
        {
            _log.LogWarning("The scan was declined: {Details}", response.StopDetails);
            return Empty("declined");
        }

        var json = string.Concat(response.Content
            .Select(block => block.Value)
            .OfType<TextBlock>()
            .Select(block => block.Text));

        if (string.IsNullOrWhiteSpace(json)) return Empty("empty");

        try
        {
            var parsed = JsonSerializer.Deserialize<ScanPayload>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (parsed is null) return Empty("unparsed");

            return new InBodyReading(
                parsed.WeightKg,
                parsed.BodyFatPercent,
                parsed.SkeletalMuscleKg,
                parsed.BodyFatMassKg,
                parsed.Bmi,
                parsed.BasalMetabolicRate,
                parsed.VisceralFatLevel,
                parsed.BodyWaterLitres,
                DateOnly.TryParse(parsed.MeasuredOn, out var date) ? date : null,
                parsed.DeviceName,
                Math.Clamp(parsed.Confidence ?? 0.5, 0, 1),
                string.IsNullOrWhiteSpace(parsed.Note) ? null : parsed.Note);
        }
        catch (JsonException e)
        {
            _log.LogError(e, "The scan came back in a shape we could not read");
            return Empty("unparsed");
        }
    }

    private static MediaType ToMediaType(string contentType) => contentType switch
    {
        "image/png" => MediaType.ImagePng,
        "image/webp" => MediaType.ImageWebP,
        "image/gif" => MediaType.ImageGif,
        _ => MediaType.ImageJpeg
    };

    private static InBodyReading Empty(string reason) =>
        new(null, null, null, null, null, null, null, null, null, null, 0, reason);

    private static Dictionary<string, JsonElement> BuildSchema()
    {
        static object Number(string description) => new { type = new[] { "number", "null" }, description };
        static object Text(string description) => new { type = new[] { "string", "null" }, description };

        return new Dictionary<string, JsonElement>
        {
            ["type"] = JsonSerializer.SerializeToElement("object"),
            ["additionalProperties"] = JsonSerializer.SerializeToElement(false),
            ["properties"] = JsonSerializer.SerializeToElement(new
            {
                weightKg = Number("Total body weight in kilograms"),
                bodyFatPercent = Number("Percent body fat"),
                skeletalMuscleKg = Number("Skeletal muscle mass in kilograms"),
                bodyFatMassKg = Number("Fat mass in kilograms"),
                bmi = Number("Body mass index"),
                basalMetabolicRate = Number("Basal metabolic rate in kilocalories"),
                visceralFatLevel = Number("Visceral fat level"),
                bodyWaterLitres = Number("Total body water in litres"),
                measuredOn = Text("Date printed on the sheet, yyyy-MM-dd"),
                deviceName = Text("Device or app that produced the sheet"),
                confidence = new { type = "number", description = "0 to 1, how legible the sheet was" },
                note = Text("One short sentence about anything unreadable")
            }),
            ["required"] = JsonSerializer.SerializeToElement(new[]
            {
                "weightKg", "bodyFatPercent", "skeletalMuscleKg", "bodyFatMassKg", "bmi",
                "basalMetabolicRate", "visceralFatLevel", "bodyWaterLitres",
                "measuredOn", "deviceName", "confidence", "note"
            })
        };
    }

    private sealed record ScanPayload(
        double? WeightKg,
        double? BodyFatPercent,
        double? SkeletalMuscleKg,
        double? BodyFatMassKg,
        double? Bmi,
        double? BasalMetabolicRate,
        double? VisceralFatLevel,
        double? BodyWaterLitres,
        string? MeasuredOn,
        string? DeviceName,
        double? Confidence,
        string? Note);
}
