import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Bar, Button, Card, Empty, Field, Icon, Label, Segmented, Title, cx } from "@/components/ui";
import { MEAL_LABELS } from "@/lib/catalog";
import { dec, group, n, parseNumber, shortDate } from "@/lib/format";
import {
  useAssignPlan, useDiets, useTraineeDay, useTraineePhotos, useTraineeWeek, useTraineeWeights, useTrainees
} from "@/lib/queries";
import { todayKey } from "@/lib/api";
import { t, useUi } from "@/state/ui";

type Tab = "week" | "food" | "weight" | "photos";

/**
 * One trainee, everything the link allows: their week, what they actually ate against the
 * plan, their weigh-ins and their photos. The API checks the link on every one of these.
 */
export function Trainee() {
  const { lang } = useUi();
  const navigate = useNavigate();
  const { uid = "" } = useParams();
  const trainees = useTrainees(true);
  const [tab, setTab] = useState<Tab>("week");

  const trainee = trainees.data?.find((row) => row.uid === uid);

  return (
    <div className="flex flex-col gap-4 pt-1 fade">
      <div className="flex items-center gap-3">
        <span className="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-title-md shrink-0">
          {(trainee?.name ?? "؟").trim().charAt(0)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-headline-md text-on-surface truncate">{trainee?.name ?? t(lang, "متدرب", "Trainee")}</div>
          <Label>
            {trainee ? t(lang, `معك من ${shortDate(trainee.startedAtUtc, lang)}`, `with you since ${shortDate(trainee.startedAtUtc, lang)}`) : ""}
          </Label>
        </div>
        <Button variant="soft" className="h-10 px-3 shrink-0" onClick={() => navigate("/coach")}>
          {t(lang, "القائمة", "All")}
        </Button>
      </div>

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "week", label: t(lang, "أسبوعه", "Week") },
          { value: "food", label: t(lang, "أكله", "Food") },
          { value: "weight", label: t(lang, "وزنه", "Weight") },
          { value: "photos", label: t(lang, "صوره", "Photos") }
        ]}
      />

      {tab === "week" && <WeekTab uid={uid} />}
      {tab === "food" && <FoodTab uid={uid} />}
      {tab === "weight" && <WeightTab uid={uid} />}
      {tab === "photos" && <PhotoTab uid={uid} />}
    </div>
  );
}

function WeekTab({ uid }: { uid: string }) {
  const { lang, say } = useUi();
  const week = useTraineeWeek(uid);
  const diets = useDiets();
  const assign = useAssignPlan();
  const [calories, setCalories] = useState("");
  const [note, setNote] = useState("");

  if (!week.data) return null;
  const summary = week.data;

  return (
    <>
      <Card>
        <div className="grid grid-cols-2 gap-3">
          {([
            [t(lang, "جلسات", "Sessions"), `${n(summary.sessionsDone, lang)} / ${n(summary.sessionsTarget, lang)}`, "text-on-surface"],
            [t(lang, "الالتزام", "Adherence"), `${n(summary.adherencePercent, lang)}${t(lang, "٪", "%")}`,
              summary.adherencePercent >= 80 ? "text-primary-fixed" : "text-tertiary-fixed-dim"],
            [t(lang, "الحمل", "Volume"), `${group(summary.volumeKg, lang)}${t(lang, " كجم", " kg")}`, "text-on-surface"],
            [t(lang, "المحروق", "Burned"), `${group(summary.caloriesBurned, lang)}${t(lang, " سعرة", " kcal")}`, "text-primary-fixed"]
          ] as const).map(([label, value, tone]) => (
            <div key={label} className="rounded-xl bg-surface-container-high p-3">
              <div className="text-label-sm text-on-surface-variant">{label}</div>
              <div className={cx("text-title-md tabular-nums", tone)}>{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-end justify-between gap-1.5" style={{ height: 48 }}>
          {summary.days.map((day) => (
            <div key={day.weekday} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={cx("w-2.5 rounded-full", day.sessions ? "bg-primary-fixed" : "bg-surface-container-highest")}
                style={{ height: day.sessions ? Math.min(28, 10 + day.sessions * 8) : 5 }}
              />
              <span className="text-label-sm text-on-surface-variant">{t(lang, day.labelAr, day.labelEn)}</span>
            </div>
          ))}
        </div>
      </Card>

      {summary.activities.length > 0 && (
        <div className="rounded-2xl bg-surface-container divide-y divide-outline-variant/40 overflow-hidden">
          {summary.activities.map((activity) => (
            <div key={activity.id} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-label-lg text-on-surface">{t(lang, activity.nameAr, activity.nameEn)}</span>
                <span className="text-label-sm text-on-surface-variant tabular-nums">
                  {n(activity.done, lang)}
                  {t(lang, " من ", " of ")}
                  {n(activity.target, lang)}
                </span>
              </div>
              <div className="mt-1.5">
                <Bar value={activity.done} max={Math.max(1, activity.target)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Card>
        <Title>{t(lang, "خطته", "Their plan")}</Title>
        <Label>{t(lang, "تظهر له فوراً، ويقدر يفكّها", "It shows up for them at once, and they can drop it")}</Label>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <Field label={t(lang, "سعرات مخصصة", "Calories")} value={calories} onChange={setCalories} inputMode="numeric" />
          <Field label={t(lang, "ملاحظة", "Note")} value={note} onChange={setNote} inputMode="text" />
        </div>

        <div className="rounded-2xl bg-surface-container-high divide-y divide-outline-variant/40 mt-3 overflow-hidden">
          {(diets.data ?? []).map((diet) => (
            <button
              key={diet.id}
              onClick={async () => {
                const override = parseNumber(calories);
                await assign.mutateAsync({
                  uid,
                  plan: {
                    dietId: diet.id,
                    calorieOverride: Number.isFinite(override) && override > 0 ? Math.round(override) : null,
                    note: note || null
                  }
                });
                say(t(lang, "انحدّدت خطته", "Plan assigned"));
              }}
              className="tap w-full flex items-center justify-between px-4 py-3 text-start"
            >
              <span className="text-label-lg text-on-surface">{t(lang, diet.nameAr, diet.nameEn)}</span>
              <Icon name="chevron_right" className="text-on-surface-variant rtl:rotate-180" />
            </button>
          ))}
        </div>
      </Card>
    </>
  );
}

/** Plan against actual: the reason a coach asks what someone ate. */
function FoodTab({ uid }: { uid: string }) {
  const { lang } = useUi();
  const [offset, setOffset] = useState(0);

  const date = (() => {
    const d = new Date();
    d.setDate(d.getDate() - offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const day = useTraineeDay(uid, date);
  if (!day.data) return null;

  const { plan, totals } = day.data;
  const gap = Math.round(totals.calories - plan.calories);

  return (
    <>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOffset(offset + 1)}
          className="tap w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface"
        >
          <Icon name="chevron_right" className="rtl:rotate-0 rotate-180" />
        </button>
        <span className="text-label-lg text-on-surface">
          {offset === 0 ? t(lang, "اليوم", "Today") : date === todayKey() ? t(lang, "اليوم", "Today") : date}
        </span>
        <button
          onClick={() => setOffset(Math.max(0, offset - 1))}
          disabled={offset === 0}
          className="tap w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface disabled:opacity-40"
        >
          <Icon name="chevron_left" className="rtl:rotate-0 rotate-180" />
        </button>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-2">
          {([
            [t(lang, "خطته", "Plan"), group(plan.calories, lang), "text-on-surface"],
            [t(lang, "أكله", "Ate"), group(totals.calories, lang), "text-on-surface"],
            [
              gap > 0 ? t(lang, "زيادة", "Over") : t(lang, "أقل", "Under"),
              group(Math.abs(gap), lang),
              Math.abs(gap) <= 150 ? "text-primary-fixed" : "text-tertiary-fixed-dim"
            ]
          ] as const).map(([label, value, tone]) => (
            <div key={label} className="flex flex-col">
              <span className="text-label-sm text-on-surface-variant">{label}</span>
              <span className={cx("text-title-md tabular-nums", tone)}>{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {([
            [t(lang, "بروتين", "Protein"), totals.protein, plan.macros.protein],
            [t(lang, "كارب", "Carbs"), totals.carbs, plan.macros.carbs],
            [t(lang, "دهون", "Fat"), totals.fat, plan.macros.fat]
          ] as const).map(([label, value, target]) => (
            <div key={label}>
              <div className="text-label-sm text-on-surface-variant">{label}</div>
              <div className="text-label-lg text-on-surface tabular-nums">
                {n(value, lang)} / {n(target, lang)}
              </div>
              <Bar value={value} max={Math.max(1, target)} />
            </div>
          ))}
        </div>
      </Card>

      {day.data.meals.map((meal) => (
        <div key={meal.slot} className="rounded-2xl bg-surface-container overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-title-md text-on-surface">{t(lang, MEAL_LABELS[meal.slot][0], MEAL_LABELS[meal.slot][1])}</span>
            <span className="text-label-lg text-on-surface-variant tabular-nums">{group(meal.totals.calories, lang)}</span>
          </div>
          {meal.items.length === 0 ? (
            <div className="px-4 py-3 border-t border-outline-variant/40 text-label-sm text-on-surface-variant">
              {t(lang, "ما سجّل شي", "nothing logged")}
            </div>
          ) : (
            meal.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-2.5 border-t border-outline-variant/40">
                <span className="text-label-lg text-on-surface truncate">{t(lang, item.nameAr, item.nameEn)}</span>
                <span className="text-label-sm text-on-surface-variant tabular-nums shrink-0">
                  {dec(item.quantity, 1, lang)} {item.unit}
                </span>
              </div>
            ))
          )}
        </div>
      ))}
    </>
  );
}

function WeightTab({ uid }: { uid: string }) {
  const { lang } = useUi();
  const weights = useTraineeWeights(uid);
  const rows = weights.data ?? [];

  if (rows.length === 0) {
    return <Empty title={t(lang, "ما سجّل وزن", "No weigh-ins yet")} />;
  }

  return (
    <Card>
      <div className="flex items-baseline gap-2">
        <span className="text-metric text-on-surface tabular-nums">{dec(rows[0].kg, 1, lang)}</span>
        <span className="text-label-lg text-on-surface-variant">{t(lang, "كجم", "kg")}</span>
      </div>
      <div className="mt-3 divide-y divide-outline-variant/40">
        {rows.slice(0, 10).map((row) => (
          <div key={row.id} className="flex items-center justify-between py-2.5">
            <span className="text-label-lg text-on-surface-variant">{shortDate(row.atUtc, lang)}</span>
            <div className="flex items-center gap-3">
              <span className="text-label-lg text-on-surface tabular-nums">
                {dec(row.kg, 1, lang)} {t(lang, "كجم", "kg")}
              </span>
              {row.delta != null && (
                <span className={cx("w-14 text-start text-label-sm tabular-nums", row.delta <= 0 ? "text-primary-fixed" : "text-on-surface-variant")}>
                  {dec(Math.abs(row.delta), 1, lang)}
                  {row.delta <= 0 ? "−" : "+"}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function PhotoTab({ uid }: { uid: string }) {
  const { lang } = useUi();
  const photos = useTraineePhotos(uid);
  const rows = photos.data ?? [];

  if (rows.length === 0) {
    return (
      <Empty
        title={t(lang, "ما عنده صور", "No photos yet")}
        hint={t(lang, "الصور تظهر هنا لما يضيفها من صفحة تقدّمه.", "They show up here once the trainee adds them.")}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {rows.map((photo) => (
        <div key={photo.id} className="relative rounded-xl overflow-hidden bg-surface-container-high aspect-[3/4]">
          <img src={photo.url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-label-sm text-white">
            {shortDate(photo.atUtc, lang)}
            {photo.weightKg ? ` · ${dec(photo.weightKg, 1, lang)} ${t(lang, "كجم", "kg")}` : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
