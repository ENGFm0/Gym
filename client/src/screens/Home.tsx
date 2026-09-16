import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Button, Card, Field, Icon, Ring, Sheet, cx } from "@/components/ui";
import { InviteCard } from "@/components/InviteCard";
import { MEAL_LABELS } from "@/lib/catalog";
import { group, n, parseNumber } from "@/lib/format";
import { hasHealthSource, healthSteps, watchHealthSteps } from "@/lib/native";
import { useDay, usePatchDay, useProfile } from "@/lib/queries";
import { t, useUi } from "@/state/ui";

/**
 * The pedometer. Steps are the phone's job, not something to type in —
 * the manual sheet is only there for when the phone was in a bag.
 */
function usePedometer(onStep: () => void) {
  const [on, setOn] = useState(false);
  const buffer = useRef<number[]>([]);
  const lastPeak = useRef(0);
  const handler = useRef(onStep);
  handler.current = onStep;

  useEffect(() => {
    if (!on) return;

    const tick = (event: DeviceMotionEvent) => {
      const a = event.accelerationIncludingGravity ?? event.acceleration;
      if (!a) return;

      const magnitude = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0);
      const window = buffer.current;
      window.push(magnitude);
      if (window.length > 10) window.shift();

      const average = window.reduce((sum, value) => sum + value, 0) / window.length;
      const now = Date.now();
      if (magnitude - average > 1.5 && now - lastPeak.current > 280) {
        lastPeak.current = now;
        handler.current();
      }
    };

    window.addEventListener("devicemotion", tick);
    return () => window.removeEventListener("devicemotion", tick);
  }, [on]);

  async function toggle(): Promise<"on" | "off" | "denied" | "unsupported"> {
    if (on) {
      setOn(false);
      return "off";
    }
    if (typeof DeviceMotionEvent === "undefined") return "unsupported";

    const request = (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission;
    if (typeof request === "function") {
      const state = await request().catch(() => "denied");
      if (state !== "granted") return "denied";
    }

    setOn(true);
    return "on";
  }

  return { on, toggle };
}

export function Home() {
  const { lang, say } = useUi();
  const navigate = useNavigate();
  const profile = useProfile();
  const day = useDay();
  const patch = usePatchDay();
  const [manualSteps, setManualSteps] = useState(false);
  const [stepsDraft, setStepsDraft] = useState("");
  const pending = useRef(0);

  // The sensor fires many times a second; the API hears about it once.
  const pedometer = usePedometer(() => {
    pending.current += 1;
    if (pending.current >= 20) {
      const add = pending.current;
      pending.current = 0;
      patch.mutate({ steps: (day.data?.steps ?? 0) + add });
    }
  });

  // A native shell is the real source when there is one; the sensor is the browser's best effort.
  useEffect(() => {
    if (!hasHealthSource() || !day.data) return;

    let alive = true;
    healthSteps(day.data.date).then((steps) => {
      if (alive && steps !== null && steps !== day.data!.steps) patch.mutate({ steps });
    });

    const stop = watchHealthSteps((steps) => {
      if (alive) patch.mutate({ steps });
    });

    return () => {
      alive = false;
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day.data?.date]);

  if (!day.data || !profile.data) return null;

  const { plan, totals, steps, waterLitres, burnedCalories, caloriesLeft } = day.data;
  const name = profile.data.name || t(lang, "بك", "there");

  return (
    <div className="flex flex-col gap-4 pt-1 fade">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-headline-md text-on-surface">{t(lang, `أهلاً ${name}`, `Hey ${name}`)}</div>
          <button onClick={() => navigate("/diet")} className="tap text-label-lg text-on-surface-variant">
            {t(lang, "هدفك ", "target ")}
            {group(plan.calories, lang)}
            {t(lang, " سعرة", " kcal")}
          </button>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="tap w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-on-surface"
        >
          <Icon name="person" size={20} />
        </button>
      </div>

      <InviteCard />

      <Card>
        <div className="flex items-center justify-between gap-4">
          <Ring
            progress={totals.calories / (plan.calories || 1)}
            center={group(Math.abs(caloriesLeft), lang)}
            caption={caloriesLeft >= 0 ? t(lang, "سعرة متبقية", "kcal left") : t(lang, "سعرة زيادة", "over")}
          />
          <div className="flex-1 flex flex-col gap-3">
            {[
              [t(lang, "الهدف", "Target"), group(plan.calories, lang), "text-on-surface"],
              [t(lang, "تناولت", "Eaten"), group(totals.calories, lang), "text-on-surface"],
              [t(lang, "المحروق", "Burned"), group(burnedCalories, lang), "text-primary-fixed"]
            ].map(([label, value, tone], index) => (
              <div key={String(label)}>
                {index > 0 && <div className="h-px bg-outline-variant/50 mb-3" />}
                <div className="flex items-center justify-between">
                  <span className="text-label-sm text-on-surface-variant">{label}</span>
                  <span className={cx("text-title-md tabular-nums", tone)}>{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          {([
            [t(lang, "بروتين", "Protein"), totals.protein, plan.macros.protein, "primary-fixed"],
            [t(lang, "كارب", "Carbs"), totals.carbs, plan.macros.carbs, "secondary-fixed-dim"],
            [t(lang, "دهون", "Fat"), totals.fat, plan.macros.fat, "tertiary-fixed-dim"]
          ] as const).map(([label, value, max, tone]) => (
            <div key={label} className="flex flex-col gap-1.5">
              <span className="text-label-sm text-on-surface-variant">{label}</span>
              <span className="text-label-lg text-on-surface tabular-nums">
                {n(value, lang)} / {n(max, lang)}
              </span>
              <Bar value={value} max={max} tone={tone} />
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant">{t(lang, "الخطوات", "Steps")}</span>
            <button
              hidden={hasHealthSource()}
              onClick={async () => {
                const state = await pedometer.toggle();
                if (state === "on") say(t(lang, "بدأ عدّ خطواتك", "Counting your steps"));
                if (state === "denied") say(t(lang, "ما سمحت بالحركة", "Motion access denied"));
                if (state === "unsupported") say(t(lang, "ما فيه حسّاس حركة بهالجهاز", "No motion sensor here"));
              }}
              className={cx(
                "tap px-2.5 h-8 rounded-lg flex items-center gap-1 text-label-sm",
                pedometer.on ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-high text-on-surface-variant"
              )}
            >
              <Icon name={pedometer.on ? "sensors" : "sensors_off"} size={14} />
              {pedometer.on ? t(lang, "يعدّ", "Counting") : t(lang, "تتبّع", "Track")}
            </button>
          </div>
          <div className="text-headline-md text-on-surface tabular-nums mt-1">{group(steps, lang)}</div>
          <Bar value={steps} max={10000} />
          <div className="mt-2 text-label-sm text-on-surface-variant">
            {hasHealthSource()
              ? t(lang, "من صحة جوالك · ", "From your phone's health app · ")
              : t(lang, "يسجّلها الجوال · ", "From your phone · ")}
            <button
              onClick={() => {
                setStepsDraft(String(steps));
                setManualSteps(true);
              }}
              className="tap text-primary-fixed"
            >
              {t(lang, "إدخال يدوي", "enter manually")}
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-label-sm text-on-surface-variant">{t(lang, "الماء", "Water")}</span>
            <div className="flex gap-1">
              <button
                onClick={() => patch.mutate({ waterLitres: Math.max(0, waterLitres - 0.25) })}
                className="tap w-8 h-8 rounded-lg bg-surface-container-high text-on-surface"
              >
                −
              </button>
              <button
                onClick={() => patch.mutate({ waterLitres: waterLitres + 0.25 })}
                className="tap w-8 h-8 rounded-lg bg-primary-fixed text-on-primary-fixed"
              >
                +
              </button>
            </div>
          </div>
          <div className="text-headline-md text-on-surface tabular-nums mt-1">
            {waterLitres.toFixed(2)}
            <span className="text-label-sm text-on-surface-variant"> {t(lang, "لتر", "L")}</span>
          </div>
          <Bar value={waterLitres} max={3} tone="secondary-fixed-dim" />
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-title-md text-on-surface">{t(lang, "وجبات اليوم", "Today's meals")}</span>
        <button onClick={() => navigate("/meals")} className="tap text-label-lg text-primary-fixed">
          {t(lang, "اليوميات", "Diary")}
        </button>
      </div>

      <div className="rounded-2xl bg-surface-container divide-y divide-outline-variant/40">
        {day.data.meals.map((meal) => (
          <button
            key={meal.slot}
            onClick={() => navigate(`/meals/add?slot=${meal.slot}`)}
            className="tap w-full flex items-center justify-between px-4 py-3.5 text-start"
          >
            <span className="flex items-center gap-3">
              <span
                className={cx(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  meal.items.length ? "bg-primary-fixed/15 text-primary-fixed" : "bg-surface-container-high text-on-surface-variant"
                )}
              >
                <Icon name={meal.items.length ? "check_circle" : "add"} />
              </span>
              <span>
                <span className="block text-label-lg text-on-surface">
                  {t(lang, MEAL_LABELS[meal.slot][0], MEAL_LABELS[meal.slot][1])}
                </span>
                <span className="block text-label-sm text-on-surface-variant">
                  {meal.items.length
                    ? meal.items.map((item) => t(lang, item.nameAr, item.nameEn)).join(" · ")
                    : t(lang, "ما سجّلت شي", "nothing logged")}
                </span>
              </span>
            </span>
            <span className={cx("text-label-lg tabular-nums", meal.items.length ? "text-on-surface" : "text-on-surface-variant")}>
              {meal.items.length ? group(meal.totals.calories, lang) : "+"}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="soft" onClick={() => navigate("/progress")} className="h-auto py-4 justify-start">
          <Icon name="monitor_weight" />
          {t(lang, "سجّل وزنك", "Log weight")}
        </Button>
        <Button variant="soft" onClick={() => navigate("/training")} className="h-auto py-4 justify-start">
          <Icon name="fitness_center" />
          {t(lang, "برنامجي", "My program")}
        </Button>
      </div>

      <Sheet open={manualSteps} onClose={() => setManualSteps(false)}>
        <div className="text-title-md text-on-surface mb-1">{t(lang, "خطوات اليوم", "Steps today")}</div>
        <p className="text-label-sm text-on-surface-variant mb-3">
          {t(
            lang,
            "جوالك يعدّها بنفسه — اكتبها يدوياً فقط إذا كان بالشنطة.",
            "Your phone counts them on its own; type them in only when it was in your bag."
          )}
        </p>
        <Field label={t(lang, "الخطوات", "Steps")} value={stepsDraft} onChange={setStepsDraft} inputMode="numeric" />
        <Button
          className="w-full mt-3"
          onClick={() => {
            const value = parseNumber(stepsDraft);
            if (!Number.isFinite(value) || value < 0) {
              say(t(lang, "اكتب الخطوات", "Enter the steps"));
              return;
            }
            patch.mutate({ steps: Math.round(value) });
            setManualSteps(false);
            say(t(lang, "تحدّثت خطواتك", "Steps updated"));
          }}
        >
          {t(lang, "احفظ", "Save")}
        </Button>
      </Sheet>
    </div>
  );
}
