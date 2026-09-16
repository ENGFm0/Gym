import { useNavigate } from "react-router-dom";
import { Card, Icon, Label, Segmented, cx } from "@/components/ui";
import { MEAL_LABELS } from "@/lib/catalog";
import { dec, group, n } from "@/lib/format";
import { useDay, useRemoveEntry } from "@/lib/queries";
import { t, useUi } from "@/state/ui";

/** The diary. The diet itself lives in its own section — adding food never leaves this screen. */
export function Meals() {
  const { lang } = useUi();
  const navigate = useNavigate();
  const day = useDay();
  const remove = useRemoveEntry();

  if (!day.data) return null;
  const { plan, totals } = day.data;

  const share = (value: number) => Math.min(100, (value / (plan.calories || 1)) * 100);

  return (
    <div className="flex flex-col gap-4 pt-1 fade">
      <div>
        <div className="text-headline-md text-on-surface">{t(lang, "الوجبات", "Meals")}</div>
        <Label>{t(lang, "سجل أكلك اليومي", "Your daily food log")}</Label>
      </div>

      <Segmented
        value="log"
        onChange={(value) => value === "diet" && navigate("/diet")}
        options={[
          { value: "log", label: t(lang, "يومياتي", "My diary") },
          { value: "diet", label: t(lang, "النظام", "My diet") }
        ]}
      />

      <Card>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {([
            [t(lang, "الهدف", "Target"), group(plan.calories, lang), "text-on-surface"],
            [t(lang, "أكل", "Eaten"), group(totals.calories, lang), "text-on-surface"],
            [t(lang, "متبقي", "Left"), group(plan.calories - totals.calories, lang), "text-primary-fixed"]
          ] as const).map(([label, value, tone]) => (
            <div key={label} className="flex flex-col">
              <span className="text-label-sm text-on-surface-variant">{label}</span>
              <span className={cx("text-title-md tabular-nums", tone)}>{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-3 h-2 rounded-full bg-surface-container-highest overflow-hidden flex">
          <div style={{ width: `${share(totals.protein * 4)}%`, background: "rgb(var(--c-primary-fixed))" }} />
          <div style={{ width: `${share(totals.carbs * 4)}%`, background: "rgb(var(--c-secondary-fixed-dim))" }} />
          <div style={{ width: `${share(totals.fat * 9)}%`, background: "rgb(var(--c-tertiary-fixed-dim))" }} />
        </div>

        <div className="flex justify-between mt-2 text-label-sm">
          <span className="text-primary-fixed">
            {t(lang, "بروتين ", "Protein ")}{n(totals.protein, lang)}/{n(plan.macros.protein, lang)}
          </span>
          <span className="text-secondary-fixed-dim">
            {t(lang, "كارب ", "Carbs ")}{n(totals.carbs, lang)}/{n(plan.macros.carbs, lang)}
          </span>
          <span className="text-tertiary-fixed-dim">
            {t(lang, "دهون ", "Fat ")}{n(totals.fat, lang)}/{n(plan.macros.fat, lang)}
          </span>
        </div>
      </Card>

      {day.data.meals.map((meal) => (
        <div key={meal.slot} className="rounded-2xl bg-surface-container overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-title-md text-on-surface">
              {t(lang, MEAL_LABELS[meal.slot][0], MEAL_LABELS[meal.slot][1])}
            </span>
            <span className="text-label-lg text-on-surface-variant tabular-nums">
              {group(meal.totals.calories, lang)}
            </span>
          </div>

          {meal.items.length === 0 ? (
            <div className="px-4 py-3 border-t border-outline-variant/40 text-label-sm text-on-surface-variant">
              {t(lang, "ما سجّلت شي", "nothing logged")}
            </div>
          ) : (
            meal.items.map((item) => {
              const factor = item.quantity / (item.baseAmount || 1);
              return (
                <div key={item.id} className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/40">
                  <div className="min-w-0">
                    <div className="text-label-lg text-on-surface truncate">{t(lang, item.nameAr, item.nameEn)}</div>
                    <div className="text-label-sm text-on-surface-variant">
                      {dec(item.quantity, 1, lang)} {item.unit} · {n(item.protein * factor, lang)}
                      {t(lang, " بروتين", " g protein")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-label-lg text-on-surface-variant tabular-nums">
                      {n(item.calories * factor, lang)}
                    </span>
                    <button
                      onClick={() => remove.mutate(item.id)}
                      aria-label={t(lang, "احذف", "Remove")}
                      className="tap w-9 h-9 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center"
                    >
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          <button
            onClick={() => navigate(`/meals/add?slot=${meal.slot}`)}
            className="tap w-full flex items-center gap-2 px-4 py-3.5 border-t border-outline-variant/40 text-primary-fixed"
          >
            <Icon name="add" />
            <span className="text-label-lg">
              {t(lang, `أضف لـ${MEAL_LABELS[meal.slot][0]}`, `Add to ${MEAL_LABELS[meal.slot][1]}`)}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}
