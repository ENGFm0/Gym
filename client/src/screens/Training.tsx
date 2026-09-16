import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Button, Card, Empty, Field, Icon, Label, Ring, Segmented, Sheet, Stepper, Title, cx } from "@/components/ui";
import { WEEK_AR, WEEK_AR_SHORT, WEEK_EN, WEEK_EN_SHORT } from "@/lib/engine";
import { group, n, parseNumber, shortDate } from "@/lib/format";
import {
  useActivities, useActivityCatalog, useAddActivity, useDeleteSession, useExerciseLibrary,
  useLogSession, useProgram, useRemoveActivity, useSessions, useSetDayExercises,
  useSetTrainingDays, useUpdateActivity, useWeek
} from "@/lib/queries";
import { t, useUi } from "@/state/ui";
import type { Activity } from "@/lib/types";

type Tab = "week" | "acts" | "prog" | "log";

export function Training() {
  const { lang } = useUi();
  const [tab, setTab] = useState<Tab>("week");

  return (
    <div className="flex flex-col gap-4 pt-1 fade">
      <div>
        <div className="text-headline-md text-on-surface">{t(lang, "التمارين", "Training")}</div>
        <Label>{t(lang, "أسبوعك، أنشطتك، برنامجك", "Your week, your activities, your program")}</Label>
      </div>

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "week", label: t(lang, "أسبوعي", "Week") },
          { value: "acts", label: t(lang, "أنشطتي", "Activities") },
          { value: "prog", label: t(lang, "برنامجي", "Program") },
          { value: "log", label: t(lang, "السجل", "History") }
        ]}
      />

      {tab === "week" && <WeekTab onProgram={() => setTab("prog")} />}
      {tab === "acts" && <ActivitiesTab />}
      {tab === "prog" && <ProgramTab />}
      {tab === "log" && <HistoryTab />}
    </div>
  );
}

/* ------------------------------ week ------------------------------ */

function WeekTab({ onProgram }: { onProgram: () => void }) {
  const { lang } = useUi();
  const navigate = useNavigate();
  const week = useWeek();
  if (!week.data) return null;

  const summary = week.data;
  const peak = Math.max(1, ...summary.days.map((d) => d.sessions));
  const todayIndex = (new Date().getDay() + 1) % 7;

  return (
    <>
      <Card>
        <div className="flex items-center justify-between gap-4">
          <Ring
            progress={summary.sessionsTarget ? summary.sessionsDone / summary.sessionsTarget : 0}
            center={n(summary.sessionsDone, lang)}
            caption={t(lang, `من ${n(summary.sessionsTarget, lang)} جلسات`, `of ${summary.sessionsTarget} sessions`)}
          />
          <div className="flex-1 flex flex-col gap-3">
            {([
              [t(lang, "الالتزام", "Adherence"), `${n(summary.adherencePercent, lang)}${t(lang, "٪", "%")}`, summary.adherencePercent >= 80 ? "text-primary-fixed" : "text-on-surface"],
              [t(lang, "الحمل", "Volume"), `${group(summary.volumeKg, lang)}${t(lang, " كجم", " kg")}`, "text-on-surface"],
              [t(lang, "المحروق", "Burned"), `${group(summary.caloriesBurned, lang)}${t(lang, " سعرة", " kcal")}`, "text-primary-fixed"]
            ] as const).map(([label, value, tone], index) => (
              <div key={label}>
                {index > 0 && <div className="h-px bg-outline-variant/50 mb-3" />}
                <div className="flex items-center justify-between">
                  <span className="text-label-sm text-on-surface-variant">{label}</span>
                  <span className={cx("text-title-md tabular-nums", tone)}>{value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-end justify-between gap-1.5" style={{ height: 56 }}>
          {summary.days.map((day) => (
            <div key={day.weekday} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={cx("w-2.5 rounded-full", day.sessions ? "bg-primary-fixed" : "bg-surface-container-highest")}
                style={{ height: day.sessions ? Math.max(12, Math.round((day.sessions / peak) * 32)) : 5 }}
              />
              <span className={cx("text-label-sm", day.weekday === todayIndex ? "text-on-surface" : "text-on-surface-variant")}>
                {t(lang, day.labelAr, day.labelEn)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className={summary.isRestDay ? "" : "border border-primary-fixed/40"}>
        <div className="flex items-center gap-3">
          <span
            className={cx(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              summary.isRestDay ? "bg-surface-container-high text-on-surface-variant" : "bg-primary-fixed/15 text-primary-fixed"
            )}
          >
            <Icon name={summary.isRestDay ? "bedtime" : "fitness_center"} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-label-lg text-on-surface truncate">
              {summary.isRestDay
                ? t(lang, "اليوم راحة", "Today is a rest day")
                : t(lang, `اليوم · ${summary.today?.nameAr}`, `Today · ${summary.today?.nameEn}`)}
            </div>
            <div className="text-label-sm text-on-surface-variant truncate">
              {summary.isRestDay
                ? t(lang, "امشِ، مدّد، ونم زين.", "Walk, stretch, sleep well.")
                : summary.today?.exercises.length
                  ? t(lang, `${n(summary.today.exercises.length, lang)} تمارين`, `${summary.today.exercises.length} exercises`)
                  : t(lang, "ما أضفت تمارين", "nothing planned yet")}
            </div>
          </div>
          {!summary.isRestDay && summary.today?.exercises.length ? (
            <Button className="shrink-0 h-10 px-3" onClick={() => navigate(`/training/session/${summary.today!.slot}`)}>
              {t(lang, "ابدأ", "Start")}
            </Button>
          ) : (
            <Button variant="soft" className="shrink-0 h-10 px-3" onClick={onProgram}>
              {t(lang, "الجدول", "Plan")}
            </Button>
          )}
        </div>
      </Card>
    </>
  );
}

/* --------------------------- activities --------------------------- */

function ActivitiesTab() {
  const { lang, say } = useUi();
  const activities = useActivities();
  const catalog = useActivityCatalog();
  const addActivity = useAddActivity();
  const updateActivity = useUpdateActivity();
  const removeActivity = useRemoveActivity();
  const logSession = useLogSession();

  const [picking, setPicking] = useState(false);
  const [adding, setAdding] = useState<{ catalogId?: string; nameAr?: string; met?: number } | null>(null);
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [open, setOpen] = useState<Activity | null>(null);
  const [logging, setLogging] = useState<Activity | null>(null);
  const [minutes, setMinutes] = useState("45");
  const [distance, setDistance] = useState("");
  const [customName, setCustomName] = useState("");
  const [customMet, setCustomMet] = useState(6);

  const mine = activities.data ?? [];
  const available = (catalog.data ?? []).filter((item) => !mine.some((a) => a.id === item.id));

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-title-md text-on-surface">{t(lang, "أنشطتي", "My activities")}</span>
        <button onClick={() => setPicking(true)} className="tap flex items-center gap-1 text-label-lg text-primary-fixed">
          <Icon name="add" />
          {t(lang, "أضف", "Add")}
        </button>
      </div>
      <Label>{t(lang, "كل شي تسويه، ولكل واحد هدف أسبوعي", "Everything you do, with a weekly target each")}</Label>

      {mine.length === 0 ? (
        <Empty
          title={t(lang, "ما عندك أنشطة", "Nothing tracked yet")}
          hint={t(lang, "حديد، سباحة، ركض — أضف اللي تسويه فعلاً.", "Iron, swimming, running — add what you actually do.")}
        />
      ) : (
        <div className="rounded-2xl bg-surface-container divide-y divide-outline-variant/40 overflow-hidden">
          {mine.map((activity) => {
            const hit = activity.timesPerWeek > 0 && activity.doneThisWeek >= activity.timesPerWeek;
            return (
              <button
                key={activity.id}
                onClick={() => setOpen(activity)}
                className="tap w-full text-start px-4 py-3 flex items-center gap-3"
              >
                <span
                  className={cx(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    hit ? "bg-primary-fixed text-on-primary-fixed" : "bg-primary-fixed/15 text-primary-fixed"
                  )}
                >
                  <Icon name={activity.icon} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-label-lg text-on-surface truncate">
                      {t(lang, activity.nameAr, activity.nameEn)}
                    </span>
                    <span className={cx("text-label-sm tabular-nums shrink-0", hit ? "text-primary-fixed" : "text-on-surface-variant")}>
                      {n(activity.doneThisWeek, lang)}
                      {t(lang, " من ", " of ")}
                      {n(activity.timesPerWeek, lang)}
                    </span>
                  </span>
                  <span className="block mt-1.5">
                    <Bar value={activity.doneThisWeek} max={Math.max(1, activity.timesPerWeek)} />
                  </span>
                </span>
                <Icon name="chevron_right" className="text-on-surface-variant rtl:rotate-180 shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {/* pick from the library, or define your own */}
      <Sheet open={picking} onClose={() => setPicking(false)}>
        <Title>{t(lang, "أضف نشاط", "Add an activity")}</Title>
        <Label>{t(lang, "مو حديد بس — اختر اللي تسويه فعلاً.", "Not just iron — pick whatever you actually do.")}</Label>
        <div className="grid grid-cols-2 gap-2 mt-3 max-h-64 overflow-y-auto">
          {available.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setAdding({ catalogId: item.id });
                setTimesPerWeek(3);
                setPicking(false);
              }}
              className="tap rounded-xl bg-surface-container-high p-3 flex items-center gap-2 text-start"
            >
              <Icon name={item.icon} className="text-primary-fixed shrink-0" />
              <span className="text-label-lg text-on-surface truncate">{t(lang, item.nameAr, item.nameEn)}</span>
            </button>
          ))}
        </div>
        <Button
          variant="soft"
          className="w-full mt-3"
          onClick={() => {
            setPicking(false);
            setAdding({ nameAr: "", met: 6 });
            setCustomName("");
            setCustomMet(6);
            setTimesPerWeek(3);
          }}
        >
          {t(lang, "نشاط من عندك", "Something else")}
        </Button>
      </Sheet>

      {/* the weekly target is set before the activity lands */}
      <Sheet open={Boolean(adding)} onClose={() => setAdding(null)}>
        {adding && (
          <>
            <Title>
              {adding.catalogId
                ? t(
                    lang,
                    catalog.data?.find((c) => c.id === adding.catalogId)?.nameAr ?? "",
                    catalog.data?.find((c) => c.id === adding.catalogId)?.nameEn ?? ""
                  )
                : t(lang, "نشاطك أنت", "Your own activity")}
            </Title>
            <Label>{t(lang, "حدّد هدفك الأسبوعي", "Set your weekly target")}</Label>

            {!adding.catalogId && (
              <div className="mt-3 flex flex-col gap-2">
                <Field label={t(lang, "اسم النشاط", "Name")} value={customName} onChange={setCustomName} inputMode="text" />
                <Segmented
                  value={customMet}
                  onChange={setCustomMet}
                  options={[
                    { value: 3.5, label: t(lang, "خفيف", "Light") },
                    { value: 6, label: t(lang, "متوسط", "Moderate") },
                    { value: 9, label: t(lang, "شديد", "Hard") }
                  ]}
                />
              </div>
            )}

            <Card className="mt-3">
              <Label>{t(lang, "كم مرة بالأسبوع", "Times per week")}</Label>
              <div className="mt-1">
                <Stepper value={timesPerWeek} onChange={setTimesPerWeek} />
              </div>
            </Card>

            <Button
              className="w-full mt-3"
              onClick={async () => {
                if (!adding.catalogId && !customName.trim()) {
                  say(t(lang, "اكتب اسم النشاط", "Name your activity"));
                  return;
                }
                await addActivity.mutateAsync({
                  catalogId: adding.catalogId,
                  nameAr: adding.catalogId ? undefined : customName.trim(),
                  met: adding.catalogId ? undefined : customMet,
                  timesPerWeek
                });
                setAdding(null);
                say(t(lang, "أُضيف النشاط", "Activity added"));
              }}
            >
              {t(lang, "أضف النشاط", "Add activity")}
            </Button>
          </>
        )}
      </Sheet>

      {/* one sheet per activity: target, log, remove */}
      <Sheet open={Boolean(open)} onClose={() => setOpen(null)}>
        {open && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-11 h-11 rounded-xl bg-primary-fixed/15 text-primary-fixed flex items-center justify-center shrink-0">
                <Icon name={open.icon} size={20} />
              </span>
              <div className="min-w-0">
                <Title>{t(lang, open.nameAr, open.nameEn)}</Title>
                <Label>
                  {t(
                    lang,
                    `سويت ${n(open.doneThisWeek, lang)} من ${n(open.timesPerWeek, lang)} هذا الأسبوع`,
                    `done ${open.doneThisWeek} of ${open.timesPerWeek} this week`
                  )}
                </Label>
              </div>
            </div>

            <Card>
              <Label>{t(lang, "كم مرة بالأسبوع", "Times per week")}</Label>
              <div className="mt-1">
                <Stepper
                  value={open.timesPerWeek}
                  onChange={async (value) => {
                    setOpen({ ...open, timesPerWeek: value });
                    await updateActivity.mutateAsync({ id: open.id, timesPerWeek: value });
                  }}
                />
              </div>
              <div className="mt-3">
                <Bar value={open.doneThisWeek} max={Math.max(1, open.timesPerWeek)} />
              </div>
            </Card>

            <Button
              className="w-full mt-3"
              onClick={() => {
                const activity = open;
                setOpen(null);
                setLogging(activity);
                setMinutes("45");
                setDistance("");
              }}
            >
              {t(lang, "سجّل جلسة", "Log a session")}
            </Button>

            <Button
              variant="soft"
              className="w-full mt-2"
              onClick={async () => {
                await removeActivity.mutateAsync(open.id);
                setOpen(null);
                say(t(lang, "انحذف", "Removed"));
              }}
            >
              {t(lang, "احذف النشاط", "Remove activity")}
            </Button>
          </>
        )}
      </Sheet>

      {/* a cardio session: minutes in, calories out */}
      <Sheet open={Boolean(logging)} onClose={() => setLogging(null)}>
        {logging && (
          <>
            <Title>{t(lang, logging.nameAr, logging.nameEn)}</Title>
            <Label>{t(lang, "كم استمريت؟", "How long did you go for?")}</Label>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <Field label={t(lang, "الدقائق", "Minutes")} value={minutes} onChange={setMinutes} inputMode="numeric" />
              <Field
                label={t(lang, "المسافة (اختياري)", "Distance (optional)")}
                value={distance}
                onChange={setDistance}
                unit={t(lang, "كم", "km")}
              />
            </div>
            <Button
              className="w-full mt-3"
              onClick={async () => {
                const value = parseNumber(minutes);
                if (!Number.isFinite(value) || value <= 0) {
                  say(t(lang, "اكتب الدقائق", "Enter the minutes"));
                  return;
                }
                const session = await logSession.mutateAsync({
                  activityId: logging.id,
                  minutes: Math.round(value),
                  distanceKm: Number.isFinite(parseNumber(distance)) ? parseNumber(distance) : undefined
                });
                setLogging(null);
                say(t(lang, `انسجلت · ${group(session.calories, lang)} سعرة`, `Logged · ${session.calories} kcal`));
              }}
            >
              {t(lang, "احفظ الجلسة", "Save session")}
            </Button>
          </>
        )}
      </Sheet>
    </>
  );
}

/* ----------------------------- program ---------------------------- */

function ProgramTab() {
  const { lang, say } = useUi();
  const navigate = useNavigate();
  const program = useProgram();
  const setDays = useSetTrainingDays();
  const setExercises = useSetDayExercises();
  const library = useExerciseLibrary();

  const [openSlot, setOpenSlot] = useState(0);
  const [addTo, setAddTo] = useState<number | null>(null);
  const [sets, setSets] = useState("4");
  const [reps, setReps] = useState("10");

  if (!program.data) return null;
  const plan = program.data;

  return (
    <>
      <Card>
        <div className="flex items-center justify-between">
          <span className="text-title-md text-on-surface">{t(lang, "جدول أسبوعك", "Your week")}</span>
          <span className="text-label-sm text-on-surface-variant">
            {t(
              lang,
              `${n(plan.daysPerWeek, lang)} أيام تمرين و${n(plan.restDays.length, lang)} راحة`,
              `${plan.daysPerWeek} training, ${plan.restDays.length} rest`
            )}
          </span>
        </div>

        <div className="mt-3">
          <Label>{t(lang, "كم يوم بالأسبوع", "How many days a week")}</Label>
          <div className="flex gap-1.5 mt-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((count) => (
              <button
                key={count}
                onClick={() => setDays.mutate({ daysPerWeek: count })}
                className={cx(
                  "tap flex-1 h-10 rounded-xl text-label-lg tabular-nums",
                  count === plan.daysPerWeek ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-high text-on-surface-variant"
                )}
              >
                {n(count, lang)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3">
          <Label>{t(lang, "متى تتمرّن", "Which days you train")}</Label>
          <div className="flex gap-1.5 mt-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map((weekday) => (
              <button
                key={weekday}
                onClick={() => setDays.mutate({ toggleWeekday: weekday })}
                className={cx(
                  "tap flex-1 h-12 rounded-xl text-label-lg",
                  plan.trainingDays.includes(weekday)
                    ? "bg-primary-fixed text-on-primary-fixed"
                    : "bg-surface-container-high text-on-surface-variant"
                )}
              >
                {t(lang, WEEK_AR_SHORT[weekday], WEEK_EN_SHORT[weekday])}
              </button>
            ))}
          </div>
          <p className="mt-2 text-label-sm text-on-surface-variant">
            {t(
              lang,
              "اضغط أي يوم يصير تمرين أو راحة — والتقسيمة ترتّب نفسها.",
              "Tap a day to flip it between training and rest — the splits rearrange themselves."
            )}
          </p>
        </div>
      </Card>

      <div className="rounded-2xl bg-surface-container divide-y divide-outline-variant/40 overflow-hidden">
        {[0, 1, 2, 3, 4, 5, 6].map((weekday) => {
          const day = plan.days.find((d) => d.weekday === weekday);
          const name = t(lang, WEEK_AR[weekday], WEEK_EN[weekday]);

          if (!day) {
            return (
              <button
                key={weekday}
                onClick={() => setDays.mutate({ toggleWeekday: weekday })}
                className="tap w-full flex items-center gap-3 px-4 py-3 text-start"
              >
                <span className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
                  <Icon name="bedtime" size={16} />
                </span>
                <span className="flex-1 text-label-lg text-on-surface-variant">{name}</span>
                <span className="text-label-sm text-on-surface-variant shrink-0">{t(lang, "راحة", "Rest")}</span>
              </button>
            );
          }

          const isOpen = day.slot === openSlot;
          return (
            <div key={weekday}>
              <button
                onClick={() => setOpenSlot(isOpen ? -1 : day.slot)}
                className="tap w-full px-4 py-3 flex items-center gap-3 text-start"
              >
                <span
                  className={cx(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-label-sm shrink-0",
                    day.exercises.length ? "bg-primary-fixed/15 text-primary-fixed" : "bg-surface-container-high text-on-surface-variant"
                  )}
                >
                  {n(day.slot + 1, lang)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-label-lg text-on-surface truncate">
                    {name} · {t(lang, day.nameAr, day.nameEn)}
                  </span>
                  <span className="block text-label-sm text-on-surface-variant truncate">
                    {day.exercises.length
                      ? `${n(day.exercises.length, lang)}${t(lang, " تمارين · ", " exercises · ")}${day.exercises
                          .slice(0, 2)
                          .map((e) => t(lang, e.nameAr, e.nameEn))
                          .join(" · ")}`
                      : t(lang, "ما أضفت تمارين", "nothing planned yet")}
                  </span>
                </span>
                <Icon name="expand_more" className={cx("text-on-surface-variant shrink-0", isOpen && "rotate-180")} />
              </button>

              {isOpen && (
                <>
                  {day.exercises.map((exercise, index) => (
                    <div
                      key={`${exercise.nameAr}-${index}`}
                      className="flex items-center justify-between ps-4 pe-3 py-2.5 border-t border-outline-variant/40 bg-surface-container-low"
                    >
                      <div className="min-w-0">
                        <div className="text-label-lg text-on-surface truncate">{t(lang, exercise.nameAr, exercise.nameEn)}</div>
                        <div className="text-label-sm text-on-surface-variant tabular-nums">
                          {n(exercise.sets, lang)}
                          {t(lang, " جولات × ", " sets × ")}
                          {n(exercise.reps, lang)}
                          {t(lang, " تكرار", " reps")}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setExercises.mutate({
                            slot: day.slot,
                            exercises: day.exercises.filter((_, at) => at !== index)
                          })
                        }
                        className="tap w-9 h-9 rounded-lg text-on-surface-variant flex items-center justify-center shrink-0"
                      >
                        <Icon name="close" size={16} />
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2 p-3 border-t border-outline-variant/40 bg-surface-container-low">
                    <Button variant="soft" className="flex-1 h-11" onClick={() => setAddTo(day.slot)}>
                      <Icon name="add" />
                      {t(lang, "أضف تمرين", "Add exercise")}
                    </Button>
                    {day.exercises.length > 0 && (
                      <Button className="flex-1 h-11" onClick={() => navigate(`/training/session/${day.slot}`)}>
                        <Icon name="play_arrow" />
                        {t(lang, "ابدأ", "Start")}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <Sheet open={addTo !== null} onClose={() => setAddTo(null)}>
        <Title>{t(lang, "أضف تمرين", "Add exercise")}</Title>
        <div className="grid grid-cols-2 gap-2 my-3">
          <Field label={t(lang, "الجولات", "Sets")} value={sets} onChange={setSets} inputMode="numeric" />
          <Field label={t(lang, "التكرارات", "Reps")} value={reps} onChange={setReps} inputMode="numeric" />
        </div>
        <div className="rounded-2xl bg-surface-container-high divide-y divide-outline-variant/40 max-h-72 overflow-y-auto">
          {(library.data ?? []).map((exercise) => (
            <button
              key={exercise.nameAr}
              onClick={async () => {
                const day = plan.days.find((d) => d.slot === addTo);
                if (!day) return;
                await setExercises.mutateAsync({
                  slot: day.slot,
                  exercises: [
                    ...day.exercises,
                    {
                      nameAr: exercise.nameAr,
                      nameEn: exercise.nameEn,
                      sets: Math.max(1, Math.round(parseNumber(sets) || 4)),
                      reps: Math.max(1, Math.round(parseNumber(reps) || 10))
                    }
                  ]
                });
                setAddTo(null);
                say(t(lang, "أُضيف", "Added"));
              }}
              className="tap w-full text-start px-4 py-3 text-label-lg text-on-surface"
            >
              {t(lang, exercise.nameAr, exercise.nameEn)}
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );
}

/* ----------------------------- history ---------------------------- */

function HistoryTab() {
  const { lang } = useUi();
  const sessions = useSessions();
  const remove = useDeleteSession();
  const all = sessions.data ?? [];

  if (all.length === 0) {
    return (
      <Empty
        title={t(lang, "ما فيه جلسات", "No sessions yet")}
        hint={t(lang, "أول جلسة تسجّلها تظهر هنا.", "Your first logged session lands here.")}
      />
    );
  }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between gap-2">
          {([
            [t(lang, "جلسات", "Sessions"), n(all.length, lang), "text-on-surface"],
            [t(lang, "دقائق", "Minutes"), group(all.reduce((sum, s) => sum + s.minutes, 0), lang), "text-on-surface"],
            [t(lang, "المحروق", "Burned"), group(all.reduce((sum, s) => sum + s.calories, 0), lang), "text-primary-fixed"]
          ] as const).map(([label, value, tone]) => (
            <div key={label} className="flex flex-col">
              <span className="text-label-sm text-on-surface-variant">{label}</span>
              <span className={cx("text-title-md tabular-nums", tone)}>{value}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="rounded-2xl bg-surface-container divide-y divide-outline-variant/40 overflow-hidden">
        {all.slice(0, 30).map((session) => (
          <div key={session.id} className="flex items-center gap-3 px-4 py-3">
            <span className="w-9 h-9 rounded-xl bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">
              <Icon name="exercise" size={17} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-label-lg text-on-surface truncate">{t(lang, session.nameAr, session.nameEn)}</div>
              <div className="text-label-sm text-on-surface-variant truncate">
                {[
                  shortDate(session.atUtc, lang),
                  session.minutes ? `${n(session.minutes, lang)}${t(lang, " دقيقة", " min")}` : null,
                  session.volumeKg ? `${group(session.volumeKg, lang)}${t(lang, " كجم", " kg")}` : null
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
            <span className="text-label-lg text-primary-fixed tabular-nums shrink-0">{group(session.calories, lang)}</span>
            <button
              onClick={() => remove.mutate(session.id)}
              className="tap w-8 h-8 rounded-lg text-on-surface-variant flex items-center justify-center shrink-0"
            >
              <Icon name="close" size={15} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
