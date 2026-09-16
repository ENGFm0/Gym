using FirebaseAdmin.Messaging;
using FitCore.Application.Abstractions;
using Microsoft.Extensions.Logging;

namespace FitCore.Infrastructure.Notifications;

/// <summary>
/// Firebase Cloud Messaging. The member's own language decides which text is sent, and a token
/// the device has thrown away is deleted rather than retried — that is the common failure.
/// </summary>
public sealed class FirebaseNotifier(
    IDeviceRepository devices,
    ILogger<FirebaseNotifier> log) : INotifier
{
    public async Task SendAsync(string uid, PushMessage message, CancellationToken ct = default)
    {
        var tokens = await devices.GetTokensAsync(uid, ct);
        if (tokens.Count == 0) return;

        var english = string.Equals(await devices.GetLangAsync(uid, ct), "en", StringComparison.OrdinalIgnoreCase);
        var title = english ? message.TitleEn : message.TitleAr;
        var body = english ? message.BodyEn : message.BodyAr;

        foreach (var token in tokens)
        {
            try
            {
                // Token is marked obsolete in favour of Fid, but they are different fields on the
                // wire and what the browser hands us is an FCM registration token, not an
                // installation id. Moving to Fid would send the wrong thing.
#pragma warning disable CS0618
                await FirebaseMessaging.DefaultInstance.SendAsync(new Message
                {
                    Token = token,
                    Notification = new Notification { Title = title, Body = body },
                    Data = message.Route is null ? null : new Dictionary<string, string> { ["route"] = message.Route }
                }, ct);
#pragma warning restore CS0618
            }
            catch (FirebaseMessagingException e) when (
                e.MessagingErrorCode is MessagingErrorCode.Unregistered or MessagingErrorCode.InvalidArgument)
            {
                // The app was removed or the token rotated: stop carrying it.
                await devices.RemoveTokenAsync(uid, token, ct);
            }
            catch (Exception e)
            {
                log.LogWarning(e, "Push to {Uid} failed", uid);
            }
        }
    }
}
