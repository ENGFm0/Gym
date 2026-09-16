import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bar, Button, Card, Icon, Label, Sheet, Title, cx } from "@/components/ui";
import { api } from "@/lib/api";
import { clock, dec, group, n, parseNumber, raw } from "@/lib/format";
import { useLogSession, useProfile, useProgram } from "@/lib/queries";
import { t, useUi } from "@/state/ui";
import type { SetLog } from "@/lib/types";

const REST_CHOICES = [60, 90, 120, 180];

/** The live workout: one exercise in focus, and the rest countdown starts itself. */
export function Session() {
  const { lang, say } = useUi();
  const navigate = useNavigate();
  const { slot } = useParams();
  const program = useProgram();
  const profile = useProfile();
  const log = useLogSession();

  const day = program.data?.days.find((d) => d.slot === Number(slot));

  const [startedAt] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [restLeft, setRestLeft] = useState(0);
  const [restOf, setRestOf] = useState(90);
  const [index, setIndex] = useState(0);
  const [sheet, setSheet] = useState(false);
  const [lastSet, setLastSet] = useState<{ weightKg: number; reps: number } | null>(null);
  const [sets, setSets] = useState<Record<number, SetLog[]>>({});
  const restRef = useRef(0);
  restRef.current = restLeft;

  // Seed the rest length from the profile, then leave it to the buttons.
  useEffect(() => {
    if (profile.data?.restSeconds) {
      setRestOf(profile.data.restSeconds);
    }
  }, [profile.data?.restSeconds]);

  // Fill in the planned sets once the program arrives.
  useEffect(() => {
    if (!day) return;
    setSets((current) => {
      if (Object.keys(current).length) return current;
      const seeded: Record<number, SetLog[]> = {};
      day.exercises.forEach((exercise, at) => {
        seeded[at] = Array.from({ length: exercise.sets }, () => ({ weightKg: null, reps: exercise.reps, done: false }));
      });
      return seeded;
    });
  }, [day]);

  // One timer drives both the session clock and the rest countdown.
  useEffect(() => {
    const id = window.setInterval(() => {
      setElapsed(Date.now() - startedAt);
      if (restRef.current > 0) {
        const next = restRef.current - 1;
        setRestLeft(next);
        if (next === 0) {
          navigator.vibrate?.([120, 80, 120]);
          say(t(lang, "خلصت الراحة — الجولة الجاية", "Rest over — next set"));
        }
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [startedAt, lang, say]);

  const exercise = day?.exercises[index];

  // What this exercise weighed last time, so the first set is not a guess.
  useEffect(() => {
    let alive = true;
    if (!exercise) return;
    api.getLastSet(exercise.nameAr).then((memory) => {
      if (alive) setLastSet(memory);
    });
    return () => {
      alive = false;
    };
  }, [exercise?.nameAr]);

  const tally = useMemo(() => {
    let total = 0;
    let done = 0;
    let volume = 0;
    Object.values(sets).forEach((rows) =>
      rows.forEach((row) => {
        total += 1;
        if (row.done) {
          done += 1;
          volume += (row.weightKg ?? 0) * row.reps;
        }
      })
    );
    return { total, done, volume };
  }, [sets]);

  if (!day || !exercise) return null;

  const rows = sets[index] ?? [];
  const exerciseDone = rows.length > 0 && rows.every((row) => row.done);

  function update(at: number, patch: Partial<SetLog>) {
    setSets((current) => {
      const rowsForIndex = [...(current[index] ?? [])];
      rowsForIndex[at] = { ...rowsForIndex[at], ...patch };
      return { ...current, [index]: rowsForIndex };
    });
  }

  function toggle(at: number) {
    const row = rows[at];
    const nowDone = !row.done;
    update(at, { done: nowDone });

    if (!nowDone) return;
    setRestLeft(restOf);

    const after = rows.map((r, i) => (i === at ? { ...r, done: true } : r));
    if (after.every((r) => r.done) && index < day!.exercises.length - 1) {
      setIndex(index + 1);
      say(t(lang, `التالي · ${day!.exercises[index + 1].nameAr}`, `Next · ${day!.exercises[index + 1].nameEn}`));
    }
  }

  async function finish() {
    if (tally.done === 0) {
      say(t(lang, "ما سجّلت ولا جولة — انلغت الجلسة", "No sets logged — session dropped"));
      navigate("/training");
      return;
    }

    await log.mutateAsync({
      activityId: "gym",
      minutes: Math.max(5, Math.round(elapsed / 60000)),
      exercises: day!.exercises.map((item, at) => ({
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        sets: sets[at] ?? []
      }))
    });

    say(t(lang, `انحفظت الجلسة · ${group(tally.volume, lang)} كجم`, `Session saved · ${tally.volume} kg`));
    navigate("/training");
  }

  return (
    <div className="flex flex-col gap-4 pt-1 fade">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-title-md text-on-surface truncate">{t(lang, day.nameAr, day.nameEn)}</div>
            <div className="text-label-sm text-primary-fixed">{t(lang, "الجلسة شغّالة", "Session running")}</div>
          </div>
          <div className="text-metric text-on-surface tabular-nums shrink-0">{clock(elapsed, lang)}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="rounded-xl bg-surface-container-high p-3">
            <Label>{t(lang, "الجولات", "Sets")}</Label>
            <div className="text-title-md text-on-surface tabular-nums">
              {n(tally.done, lang)}
              {t(lang, " من ", " of ")}
              {n(tally.total, lang)}
            </div>
          </div>
          <div className="rounded-xl bg-surface-container-high p-3">
            <Label>{t(lang, "الحمل", "Volume")}</Label>
            <div className="text-title-md text-primary-fixed tabular-nums">
              {group(tally.volume, lang)}
              {t(lang, " كجم", " kg")}
            </div>
          </div>
        </div>

        <div className="mt-3">
          <Bar value={tally.done} max={Math.max(1, tally.total)} />
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto -mx-gutter px-gutter pb-1">
        {day.exercises.map((item, at) => {
          const rowsAt = sets[at] ?? [];
          const finished = rowsAt.length > 0 && rowsAt.every((row) => row.done);
          return (
            <button
              key={`${item.nameAr}-${at}`}
              onClick={() => setIndex(at)}
              className={cx(
                "tap shrink-0 h-10 px-3 rounded-xl flex items-center gap-1.5 text-label-lg",
                at === index
                  ? "bg-primary-fixed text-on-primary-fixed"
                  : finished
                    ? "bg-primary-fixed/15 text-primary-fixed"
                    : "bg-surface-container text-on-surface-variant"
              )}
            >
              {finished && at !== index ? <Icon name="check" size={15} /> : <span className="tabular-nums">{n(at + 1, lang)}</span>}
              <span className="max-w-[7rem] truncate">{t(lang, item.nameAr, item.nameEn)}</span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl bg-surface-container overflow-hidden">
        <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3">
          <div className="min-w-0">
            <div className="text-title-md text-on-surface truncate">{t(lang, exercise.nameAr, exercise.nameEn)}</div>
            <div className="text-label-sm text-on-surface-variant truncate">
              {t(lang, `التمرين ${n(index + 1, lang)} من ${n(day.exercises.length, lang)}`, `Exercise ${index + 1} of ${day.exercises.length}`)}
              {lastSet ? ` · ${t(lang, "آخر مرة", "last")} ${dec(lastSet.weightKg, 1, lang)} × ${n(lastSet.reps, lang)}` : ""}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => setIndex(Math.max(0, index - 1))}
              className={cx(
                "tap w-10 h-10 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center",
                index === 0 && "opacity-40"
              )}
            >
              <Icon name="chevron_left" className="rtl:rotate-180" />
            </button>
            <button
              onClick={() => setIndex(Math.min(day.exercises.length - 1, index + 1))}
              className={cx(
                "tap w-10 h-10 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center",
                index === day.exercises.length - 1 && "opacity-40"
              )}
            >
              <Icon name="chevron_right" className="rtl:rotate-180" />
            </button>
          </div>
        </div>

        {rows.map((row, at) => (
          <div
            key={at}
            className={cx("flex items-center gap-2 px-3 py-2 border-t border-outline-variant/40", row.done && "bg-primary-fixed/10")}
          >
            <span
              className={cx(
                "w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-label-sm",
                row.done ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-high text-on-surface-variant"
              )}
            >
              {n(at + 1, lang)}
            </span>

            <div className="flex-1 grid grid-cols-2 gap-2">
              <label className="rounded-xl bg-surface-container-high px-3 py-1.5">
                <span className="block text-label-sm text-on-surface-variant">{t(lang, "كجم", "kg")}</span>
                <input
                  value={row.weightKg === null || row.weightKg === undefined ? "" : raw(row.weightKg, 1)}
                  onChange={(event) => update(at, { weightKg: parseNumber(event.target.value) || null })}
                  inputMode="decimal"
                  placeholder="—"
                  className="w-full bg-transparent border-0 p-0 text-title-md text-on-surface focus:outline-none tabular-nums"
                />
              </label>
              <label className="rounded-xl bg-surface-container-high px-3 py-1.5">
                <span className="block text-label-sm text-on-surface-variant">{t(lang, "تكرار", "reps")}</span>
                <input
                  value={String(row.reps)}
                  onChange={(event) => update(at, { reps: Math.round(parseNumber(event.target.value) || 0) })}
                  inputMode="numeric"
                  className="w-full bg-transparent border-0 p-0 text-title-md text-on-surface focus:outline-none tabular-nums"
                />
              </label>
            </div>

            <button
              onClick={() => toggle(at)}
              aria-label={t(lang, "تمّت", "Done")}
              className={cx(
                "tap w-11 h-11 rounded-xl shrink-0 flex items-center justify-center",
                row.done ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-high text-on-surface-variant"
              )}
            >
              <Icon name="check" size={20} />
            </button>
          </div>
        ))}

        <button
          onClick={() =>
            setSets((current) => ({
              ...current,
              [index]: [...(current[index] ?? []), { weightKg: null, reps: exercise.reps, done: false }]
            }))
          }
          className="tap w-full py-3 border-t border-outline-variant/40 text-primary-fixed text-label-lg flex items-center justify-center gap-1.5"
        >
          <Icon name="add" />
          {t(lang, "أضف جولة", "Add set")}
        </button>

        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-outline-variant/40 bg-surface-container-low">
          <span className="text-label-sm text-on-surface-variant shrink-0">{t(lang, "الراحة", "Rest")}</span>
          <div className="flex-1 flex gap-1.5">
            {REST_CHOICES.map((seconds) => (
              <button
                key={seconds}
                onClick={() => setRestOf(seconds)}
                className={cx(
                  "tap flex-1 h-9 rounded-lg text-label-sm tabular-nums",
                  seconds === restOf ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-high text-on-surface-variant"
                )}
              >
                {clock(seconds * 1000, lang)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {exerciseDone && index < day.exercises.length - 1 && (
        <Button className="w-full" onClick={() => setIndex(index + 1)}>
          {t(lang, `التالي · ${day.exercises[index + 1].nameAr}`, `Next · ${day.exercises[index + 1].nameEn}`)}
        </Button>
      )}

      <Button variant={tally.done === tally.total ? "primary" : "soft"} className="w-full" onClick={() => setSheet(true)}>
        {t(lang, "أنهِ الجلسة", "Finish session")}
      </Button>

      {restLeft > 0 && (
        <>
          <div style={{ height: 104 }} />
          <div className="fixed inset-x-0 bottom-28 z-40 px-gutter">
            <div className="max-w-3xl mx-auto rounded-2xl bg-primary-container text-on-primary-container p-3 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-on-primary-container/15 flex items-center justify-center shrink-0">
                  <Icon name="timer" size={20} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-label-sm opacity-80">{t(lang, "راحة", "Rest")}</div>
                  <div className="text-title-md tabular-nums">{clock(restLeft * 1000, lang)}</div>
                </div>
                <button
                  onClick={() => setRestLeft(restLeft + 15)}
                  className="tap px-3 h-10 rounded-xl bg-on-primary-container/15 text-label-lg shrink-0"
                >
                  +{n(15, lang)}
                  {t(lang, "ث", "s")}
                </button>
                <button
                  onClick={() => setRestLeft(0)}
                  className="tap px-3 h-10 rounded-xl bg-on-primary-container text-primary-container text-label-lg shrink-0"
                >
                  {t(lang, "تخطّي", "Skip")}
                </button>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-on-primary-container/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-on-primary-container"
                  style={{ width: `${(restLeft / (restOf || 90)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <Sheet open={sheet} onClose={() => setSheet(false)}>
        <Title>{t(lang, "تنهي الجلسة؟", "Finish the session?")}</Title>
        <Label>
          {t(
            lang,
            `${n(tally.done, lang)} جولة · ${group(tally.volume, lang)} كجم`,
            `${tally.done} sets · ${tally.volume} kg`
          )}
        </Label>
        <Button className="w-full mt-3" onClick={finish} disabled={log.isPending}>
          {t(lang, "أنهِ واحفظ", "Finish and save")}
        </Button>
        <Button variant="soft" className="w-full mt-2" onClick={() => setSheet(false)}>
          {t(lang, "كمّل", "Keep going")}
        </Button>
      </Sheet>
    </div>
  );
}
