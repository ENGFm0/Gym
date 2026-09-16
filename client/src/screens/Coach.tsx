import { useState } from "react";
import { Button, Card, Empty, Field, Icon, Label, Sheet, Title, cx } from "@/components/ui";
import { dec, n, shortDate } from "@/lib/format";
import {
  useAssignDiet, useBecomeCoach, useDiets, useInviteTrainee, useProfile, useRemoveTrainee, useTrainees
} from "@/lib/queries";
import { t, useUi } from "@/state/ui";
import type { Trainee } from "@/lib/types";

/**
 * The coach side: who you train, how their week went, and the plan you set them.
 * A member's data reaches a coach only through an explicit link, which the API checks on every call.
 */
export function Coach() {
  const { lang, say } = useUi();
  const profile = useProfile();
  const become = useBecomeCoach();
  const trainees = useTrainees(Boolean(profile.data?.isCoach));
  const invite = useInviteTrainee();
  const assign = useAssignDiet();
  const remove = useRemoveTrainee();
  const diets = useDiets();

  const [inviting, setInviting] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState<Trainee | null>(null);

  if (!profile.data) return null;

  if (!profile.data.isCoach) {
    return (
      <div className="flex flex-col gap-4 pt-1 fade">
        <div>
          <div className="text-headline-md text-on-surface">{t(lang, "وضع المدرّب", "Coach mode")}</div>
          <Label>{t(lang, "أضف متدربينك وتابع تقدّمهم", "Add your trainees and follow their progress")}</Label>
        </div>

        <Card className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
              <Icon name="sports" size={20} />
            </span>
            <div className="min-w-0">
              <Title>{t(lang, "أنت مدرّب؟", "Are you a coach?")}</Title>
              <Label>
                {t(
                  lang,
                  "تشوف وزن متدربيك وصورهم والتزامهم، وتعطيهم نظامهم الغذائي.",
                  "See your trainees' weight, photos and adherence, and set their diet."
                )}
              </Label>
            </div>
          </div>
          <Button
            onClick={async () => {
              await become.mutateAsync();
              say(t(lang, "صار حسابك مدرّب", "Your account is a coach account now"));
            }}
            disabled={become.isPending}
          >
            {t(lang, "فعّل وضع المدرّب", "Turn on coach mode")}
          </Button>
          <p className="text-label-sm text-on-surface-variant">
            {t(
              lang,
              "متدربك يقرر يربط حسابه فيك — ما يوصلك شي قبل موافقته.",
              "A trainee links their own account to you; nothing reaches you before they accept."
            )}
          </p>
        </Card>
      </div>
    );
  }

  const list = trainees.data ?? [];
  const active = list.filter((trainee) => trainee.status === "active");
  const averageAdherence = active.length
    ? Math.round(active.reduce((sum, trainee) => sum + trainee.adherencePercent, 0) / active.length)
    : 0;

  return (
    <div className="flex flex-col gap-4 pt-1 fade">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-headline-md text-on-surface">{t(lang, "متدربيني", "My trainees")}</div>
          <Label>{t(lang, "أسبوعهم في نظرة", "Their week at a glance")}</Label>
        </div>
        <Button className="h-10 px-3 shrink-0" onClick={() => setInviting(true)}>
          <Icon name="person_add" size={18} />
          {t(lang, "أضف", "Add")}
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-2">
          {([
            [t(lang, "نشطين", "Active"), n(active.length, lang), "text-on-surface"],
            [t(lang, "دعوات", "Invited"), n(list.length - active.length, lang), "text-on-surface"],
            [t(lang, "متوسط الالتزام", "Adherence"), `${n(averageAdherence, lang)}${t(lang, "٪", "%")}`,
              averageAdherence >= 80 ? "text-primary-fixed" : "text-tertiary-fixed-dim"]
          ] as const).map(([label, value, tone]) => (
            <div key={label} className="flex flex-col">
              <span className="text-label-sm text-on-surface-variant">{label}</span>
              <span className={cx("text-title-md tabular-nums", tone)}>{value}</span>
            </div>
          ))}
        </div>
      </Card>

      {list.length === 0 ? (
        <Empty
          title={t(lang, "ما عندك متدربين", "No trainees yet")}
          hint={t(lang, "ادعُ أول متدرب ببريده.", "Invite your first trainee by email.")}
        />
      ) : (
        <div className="rounded-2xl bg-surface-container divide-y divide-outline-variant/40 overflow-hidden">
          {list.map((trainee) => (
            <button
              key={trainee.uid}
              onClick={() => setOpen(trainee)}
              className="tap w-full flex items-center gap-3 px-4 py-3 text-start"
            >
              <span className="w-11 h-11 rounded-xl bg-primary-fixed/15 text-primary-fixed flex items-center justify-center text-title-md shrink-0">
                {trainee.name.trim().charAt(0)}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-label-lg text-on-surface truncate">{trainee.name}</span>
                <span className="block text-label-sm text-on-surface-variant truncate">
                  {trainee.status === "invited"
                    ? t(lang, "بانتظار قبوله", "waiting on them")
                    : [
                        trainee.weightKg ? `${dec(trainee.weightKg, 1, lang)}${t(lang, " كجم", " kg")}` : null,
                        `${n(trainee.sessionsThisWeek, lang)}${t(lang, " جلسات", " sessions")}`,
                        `${n(trainee.adherencePercent, lang)}${t(lang, "٪ التزام", "% adherence")}`
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                </span>
              </span>
              {trainee.weightDelta != null && trainee.weightDelta !== 0 && (
                <span
                  className={cx(
                    "text-label-sm tabular-nums shrink-0",
                    trainee.weightDelta < 0 ? "text-primary-fixed" : "text-tertiary-fixed-dim"
                  )}
                >
                  {dec(Math.abs(trainee.weightDelta), 1, lang)}
                  {trainee.weightDelta < 0 ? "−" : "+"}
                </span>
              )}
              <Icon name="chevron_right" className="text-on-surface-variant rtl:rotate-180 shrink-0" />
            </button>
          ))}
        </div>
      )}

      <Sheet open={inviting} onClose={() => setInviting(false)}>
        <Title>{t(lang, "ادعُ متدرب", "Invite a trainee")}</Title>
        <Label>{t(lang, "يوصله رابط يربط حسابه فيك", "They get a link that joins their account to yours")}</Label>
        <div className="flex flex-col gap-2 mt-3">
          <Field label={t(lang, "الاسم", "Name")} value={name} onChange={setName} inputMode="text" />
          <Field label={t(lang, "البريد", "Email")} value={email} onChange={setEmail} inputMode="email" type="email" />
        </div>
        <Button
          className="w-full mt-3"
          onClick={async () => {
            if (!email.includes("@")) {
              say(t(lang, "اكتب بريداً صحيحاً", "Enter a valid email"));
              return;
            }
            await invite.mutateAsync({ email, name: name || undefined });
            setEmail("");
            setName("");
            setInviting(false);
            say(t(lang, "انرسلت الدعوة", "Invite sent"));
          }}
        >
          {t(lang, "أرسل الدعوة", "Send invite")}
        </Button>
      </Sheet>

      <Sheet open={Boolean(open)} onClose={() => setOpen(null)}>
        {open && (
          <>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-title-md shrink-0">
                {open.name.trim().charAt(0)}
              </span>
              <div className="min-w-0">
                <Title>{open.name}</Title>
                <Label>
                  {t(lang, "بدأ معك ", "with you since ")}
                  {shortDate(open.startedAtUtc, lang)}
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {([
                [t(lang, "الوزن", "Weight"), open.weightKg ? dec(open.weightKg, 1, lang) : "—"],
                [t(lang, "جلسات", "Sessions"), n(open.sessionsThisWeek, lang)],
                [t(lang, "الالتزام", "Adherence"), `${n(open.adherencePercent, lang)}${t(lang, "٪", "%")}`]
              ] as const).map(([label, value]) => (
                <div key={label} className="rounded-xl bg-surface-container-high p-3 text-center">
                  <div className="text-title-md text-on-surface tabular-nums">{value}</div>
                  <div className="text-label-sm text-on-surface-variant">{label}</div>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <Label>{t(lang, "نظامه الغذائي", "Their diet")}</Label>
              <div className="rounded-2xl bg-surface-container-high divide-y divide-outline-variant/40 mt-1 overflow-hidden max-h-56 overflow-y-auto">
                {(diets.data ?? []).map((diet) => (
                  <button
                    key={diet.id}
                    onClick={async () => {
                      await assign.mutateAsync({ uid: open.uid, dietId: diet.id });
                      setOpen({ ...open, assignedDietId: diet.id });
                      say(t(lang, "انحدّد نظامه", "Diet assigned"));
                    }}
                    className="tap w-full flex items-center justify-between px-4 py-3 text-start"
                  >
                    <span className="text-label-lg text-on-surface">{t(lang, diet.nameAr, diet.nameEn)}</span>
                    {open.assignedDietId === diet.id && (
                      <span className="px-2.5 py-1 rounded-lg bg-primary-fixed text-on-primary-fixed text-label-sm">
                        {t(lang, "معطى", "Assigned")}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="soft"
              className="w-full mt-3"
              onClick={async () => {
                await remove.mutateAsync(open.uid);
                setOpen(null);
                say(t(lang, "انفكّ الارتباط", "Unlinked"));
              }}
            >
              {t(lang, "فكّ الارتباط", "Unlink trainee")}
            </Button>
          </>
        )}
      </Sheet>
    </div>
  );
}
