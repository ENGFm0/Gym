import { useEffect, useState } from "react";
import { Button, Icon, Label, Sheet, Title, cx } from "./ui";
import { WEEK_AR, WEEK_EN } from "@/lib/engine";
import { useReminders, useSaveReminders } from "@/lib/queries";
import { enablePush, pushSupported } from "@/lib/push";
import { t, useUi } from "@/state/ui";
import type { Reminders } from "@/lib/types";

const MEAL_CHOICES = ["08:00", "13:30", "17:00", "20:30"];
const TRAINING_CHOICES = ["16:00", "17:00", "18:00", "19:00", "20:00"];

/**
 * The nudges themselves. A reminder only fires when the thing it is about is missing — the
 * server checks before it sends — so this is about when to look, not how often to nag.
 */
export function RemindersCard() {
  const { lang, say } = useUi();
  const reminders = useReminders();
  const save = useSaveReminders();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Reminders | null>(null);

  useEffect(() => {
    if (reminders.data && !draft) setDraft(reminders.data);
  }, [reminders.data, draft]);

  const current = draft ?? reminders.data;
  if (!current) return null;

  const summary = current.enabled
    ? [
        current.mealTimes.length ? t(lang, `${current.mealTimes.length} تذكير وجبة`, `${current.mealTimes.length} meal nudges`) : null,
        current.training ? t(lang, "التمرين", "training") : null,
        current.weighIn ? t(lang, "الوزن الأسبوعي", "weekly weigh-in") : null
      ]
        .filter(Boolean)
        .join(" · ")
    : t(lang, "مطفية", "off");

  async function persist(next: Reminders) {
    setDraft(next);
    await save.mutateAsync(next);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="tap w-full rounded-2xl bg-surface-container px-4 py-3.5 flex items-center justify-between text-start"
      >
        <span>
          <span className="block text-label-lg text-on-surface">{t(lang, "التذكيرات", "Reminders")}</span>
          <span className="block text-label-sm text-on-surface-variant">{summary}</span>
        </span>
        <Icon name="chevron_right" className="text-on-surface-variant rtl:rotate-180" />
      </button>

      <Sheet open={open} onClose={() => setOpen(false)}>
        <Title>{t(lang, "متى نذكّرك", "When to nudge you")}</Title>
        <Label>
          {t(
            lang,
            "ما نذكّرك إلا إذا الشي فعلاً ناقص — ما سجّلت وجبتك، أو اليوم يوم تمرينك وما بدأت.",
            "You only hear from us when something is actually missing — an unlogged meal, or a training day you have not started."
          )}
        </Label>

        <div className="mt-3 flex flex-col gap-3">
          <Row
            label={t(lang, "شغّل التذكيرات", "Turn reminders on")}
            on={current.enabled}
            onToggle={async () => {
              const next = { ...current, enabled: !current.enabled, utcOffsetMinutes: -new Date().getTimezoneOffset() };
              await persist(next);

              if (next.enabled && pushSupported()) {
                const state = await enablePush(lang);
                if (state !== "granted") {
                  say(t(lang, "التذكيرات تحتاج إذن التنبيهات", "Reminders need notification permission"));
                }
              }
            }}
          />

          {current.enabled && (
            <>
              <div>
                <Label>{t(lang, "أوقات الوجبات", "Meal times")}</Label>
                <div className="flex gap-1.5 mt-1.5">
                  {MEAL_CHOICES.map((time) => {
                    const on = current.mealTimes.includes(time);
                    return (
                      <button
                        key={time}
                        onClick={() =>
                          persist({
                            ...current,
                            mealTimes: on
                              ? current.mealTimes.filter((value) => value !== time)
                              : [...current.mealTimes, time].sort()
                          })
                        }
                        className={cx(
                          "tap flex-1 h-10 rounded-xl text-label-sm tabular-nums",
                          on ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-high text-on-surface-variant"
                        )}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Row
                label={t(lang, "يوم تمرينك", "Your training day")}
                on={current.training}
                onToggle={() => persist({ ...current, training: !current.training })}
              />

              {current.training && (
                <div className="flex gap-1.5">
                  {TRAINING_CHOICES.map((time) => (
                    <button
                      key={time}
                      onClick={() => persist({ ...current, trainingTime: time })}
                      className={cx(
                        "tap flex-1 h-10 rounded-xl text-label-sm tabular-nums",
                        current.trainingTime === time
                          ? "bg-primary-fixed text-on-primary-fixed"
                          : "bg-surface-container-high text-on-surface-variant"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}

              <Row
                label={t(lang, "الوزن الأسبوعي", "Weekly weigh-in")}
                on={current.weighIn}
                onToggle={() => persist({ ...current, weighIn: !current.weighIn })}
              />

              {current.weighIn && (
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3, 4, 5, 6].map((weekday) => (
                    <button
                      key={weekday}
                      onClick={() => persist({ ...current, weighInWeekday: weekday })}
                      className={cx(
                        "tap flex-1 h-10 rounded-xl text-label-sm",
                        current.weighInWeekday === weekday
                          ? "bg-primary-fixed text-on-primary-fixed"
                          : "bg-surface-container-high text-on-surface-variant"
                      )}
                    >
                      {t(lang, WEEK_AR[weekday].slice(2, 4) || WEEK_AR[weekday], WEEK_EN[weekday].slice(0, 2))}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <Button className="w-full mt-4" onClick={() => setOpen(false)}>
          {t(lang, "تمام", "Done")}
        </Button>
      </Sheet>
    </>
  );
}

function Row({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="tap w-full flex items-center justify-between">
      <span className="text-label-lg text-on-surface">{label}</span>
      <span
        className={cx(
          "w-12 h-7 rounded-full p-1 flex transition-colors",
          on ? "bg-primary-fixed justify-end" : "bg-surface-container-highest justify-start"
        )}
      >
        <span className={cx("w-5 h-5 rounded-full", on ? "bg-on-primary-fixed" : "bg-on-surface-variant")} />
      </span>
    </button>
  );
}
