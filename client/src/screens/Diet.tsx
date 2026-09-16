import { Card, Icon, Label, cx } from "@/components/ui";
import { group, n } from "@/lib/format";
import { useDiets, useProfile, useSaveProfile } from "@/lib/queries";
import { t, useUi } from "@/state/ui";

/** The diet section: what the system is, what to eat, what to avoid, and how to switch. */
export function DietScreen() {
  const { lang, say } = useUi();
  const profile = useProfile();
  const diets = useDiets();
  const save = useSaveProfile();

  if (!profile.data || !diets.data) return null;

  const current = diets.data.find((d) => d.id === profile.data!.dietId) ?? diets.data[2] ?? diets.data[0];

  return (
    <div className="flex flex-col gap-4 pt-1 fade">
      <div>
        <div className="text-headline-md text-on-surface">{t(lang, "نظامي الغذائي", "My diet")}</div>
        <Label>{t(lang, "كل شي عن نظامك", "Everything about the system you follow")}</Label>
      </div>

      <Card className="border border-primary-fixed/40">
        <div className="flex items-center justify-between">
          <span className="text-title-md text-on-surface">{t(lang, current.nameAr, current.nameEn)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {([
            [t(lang, "دهون", "Fat"), current.split.fat, "text-tertiary-fixed-dim"],
            [t(lang, "بروتين", "Protein"), current.split.protein, "text-primary-fixed"],
            [t(lang, "كارب", "Carbs"), current.split.carbs, "text-secondary-fixed-dim"]
          ] as const).map(([label, share, tone]) => (
            <div key={label} className="rounded-xl bg-surface-container-high p-3 text-center">
              <div className={cx("text-title-md tabular-nums", tone)}>
                {n(share * 100, lang)}
                {t(lang, "٪", "%")}
              </div>
              <div className="text-label-sm text-on-surface-variant">{label}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-2">
          <Icon name="check_circle" className="text-primary-fixed" />
          <span className="text-title-md text-on-surface">{t(lang, "كُل بحرية", "Eat freely")}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {current.eat.map((item) => (
            <span key={item} className="px-3 py-1.5 rounded-lg bg-primary-fixed/15 text-primary-fixed text-label-sm">
              {item}
            </span>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-2">
          <Icon name="cancel" className="text-on-surface-variant" />
          <span className="text-title-md text-on-surface">{t(lang, "تجنّبه", "Avoid")}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {current.avoid.map((item) => (
            <span key={item} className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant text-label-sm">
              {item}
            </span>
          ))}
        </div>
      </Card>

      <div>
        <Label>{t(lang, "بدّل النظام", "Switch system")}</Label>
        <div className="rounded-2xl bg-surface-container divide-y divide-outline-variant/40 mt-2 overflow-hidden">
          {diets.data.map((diet) => (
            <button
              key={diet.id}
              onClick={async () => {
                await save.mutateAsync({ dietId: diet.id });
                say(t(lang, "تحدّث نظامك", "Diet updated"));
              }}
              className="tap w-full flex items-center justify-between px-4 py-3.5 text-start"
            >
              <span>
                <span className="block text-label-lg text-on-surface">{t(lang, diet.nameAr, diet.nameEn)}</span>
                <span className="block text-label-sm text-on-surface-variant tabular-nums">
                  {group(diet.split.fat * 100, lang)}٪ / {group(diet.split.protein * 100, lang)}٪ /{" "}
                  {group(diet.split.carbs * 100, lang)}٪
                </span>
              </span>
              {diet.id === current.id ? (
                <span className="px-2.5 py-1 rounded-lg bg-primary-fixed text-on-primary-fixed text-label-sm">
                  {t(lang, "نشط", "Active")}
                </span>
              ) : (
                <Icon name="chevron_right" className="text-on-surface-variant rtl:rotate-180" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
