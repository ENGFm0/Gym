import { Button, Card, Icon, Label, Title } from "./ui";
import { useAcceptInvite, useDeclineInvite, useInvites } from "@/lib/queries";
import { t, useUi } from "@/state/ui";

/**
 * A coach can invite anyone, but nothing about a member moves until they accept here.
 * That is why the invite sits on the home screen rather than in a settings corner.
 */
export function InviteCard() {
  const { lang, say } = useUi();
  const invites = useInvites();
  const accept = useAcceptInvite();
  const decline = useDeclineInvite();

  const invite = invites.data?.[0];
  if (!invite) return null;

  return (
    <Card className="border border-secondary-fixed-dim/50">
      <div className="flex items-center gap-3">
        <span className="w-11 h-11 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
          <Icon name="sports" size={20} />
        </span>
        <div className="flex-1 min-w-0">
          <Title className="truncate">{t(lang, `${invite.coachName} يبي يدرّبك`, `${invite.coachName} wants to coach you`)}</Title>
          <Label>
            {t(
              lang,
              "إذا وافقت، يشوف وزنك وتمارينك والتزامك — وتقدر تفكّه أي وقت.",
              "If you accept, they see your weight, training and adherence — and you can leave anytime."
            )}
          </Label>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <Button
          variant="soft"
          className="flex-1"
          disabled={decline.isPending}
          onClick={async () => {
            await decline.mutateAsync(invite.id);
            say(t(lang, "رفضت الدعوة", "Invite declined"));
          }}
        >
          {t(lang, "لا شكراً", "No thanks")}
        </Button>
        <Button
          className="flex-1"
          disabled={accept.isPending}
          onClick={async () => {
            await accept.mutateAsync(invite.id);
            say(t(lang, "صرت مع مدرّبك", "You are with your coach now"));
          }}
        >
          {t(lang, "اقبل", "Accept")}
        </Button>
      </div>
    </Card>
  );
}
