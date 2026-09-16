import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Field, Icon, Label, Segmented, Sheet, Title, cx } from "@/components/ui";
import { isConfigured, leave } from "@/lib/firebase";
import { RemindersCard } from "@/components/RemindersCard";
import { api } from "@/lib/api";
import { isOffline } from "@/lib/api";
import { dec, group, lengthLabel, massLabel, n, parseNumber, raw, showLength, showMass, toCm, toKg } from "@/lib/format";
import { useDay, useProfile, useSaveProfile } from "@/lib/queries";
import { t, useUi } from "@/state/ui";
import type { Profile } from "@/lib/types";

export function ProfileScreen() {
  const { lang, say } = useUi();
  const navigate = useNavigate();
  const profile = useProfile();
  const day = useDay();
  const save = useSaveProfile();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<{ name: string; height: string; weight: string; target: string; birth: string }>({
    name: "",
    height: "",
    weight: "",
    target: "",
    birth: ""
  });

  if (!profile.data || !day.data) return null;
  const me = profile.data;
  const plan = day.data.plan;
  const units = me.units;

  function startEditing() {
    setDraft({
      name: me.name ?? "",
      height: raw(showLength(me.heightCm, units), 0),
      weight: raw(showMass(me.weightKg, units), 1),
      target: me.targetWeightKg ? raw(showMass(me.targetWeightKg, units), 1) : "",
      birth: me.birthDate ?? ""
    });
    setEditing(true);
  }

  async function commit() {
    const height = parseNumber(draft.height);
    const weight = parseNumber(draft.weight);
    const target = parseNumber(draft.target);

    await save.mutateAsync({
      name: draft.name || null,
      birthDate: draft.birth || null,
      heightCm: Number.isFinite(height) && height > 0 ? Math.round(toCm(height, units)) : me.heightCm,
      weightKg: Number.isFinite(weight) && weight > 0 ? Math.round(toKg(weight, units) * 10) / 10 : me.weightKg,
      targetWeightKg: Number.isFinite(target) && target > 0 ? Math.round(toKg(target, units) * 10) / 10 : me.targetWeightKg
    });

    setEditing(false);
    say(t(lang, "انحفظت بياناتك", "Saved"));
  }

  const tiles: [string, string][] = [
    [t(lang, "الوزن", "Weight"), me.weightKg ? `${dec(showMass(me.weightKg, units), 1, lang)} ${massLabel(units, lang)}` : "—"],
    [t(lang, "الطول", "Height"), me.heightCm ? `${n(showLength(me.heightCm, units), lang)} ${lengthLabel(units, lang)}` : "—"],
    [t(lang, "العمر", "Age"), me.age ? n(me.age, lang) : "—"],
    [t(lang, "BMI", "BMI"), plan.bmi ? `${dec(plan.bmi, 1, lang)}` : "—"],
    [t(lang, "الحالة", "Band"), t(lang, plan.bmiBandAr, plan.bmiBandEn)],
    [t(lang, "المستهدف", "Target"), me.targetWeightKg ? `${dec(showMass(me.targetWeightKg, units), 1, lang)} ${massLabel(units, lang)}` : "—"]
  ];

  return (
    <div className="flex flex-col gap-4 pt-1 fade">
      <Card className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center text-headline-md">
          {(me.name ?? "؟").trim().charAt(0) || "؟"}
        </div>
        <div className="flex-1 min-w-0">
          <Title className="truncate">{me.name ?? t(lang, "حسابك", "Your account")}</Title>
          <Label>{me.email ?? t(lang, "ما سجّلت بريدك", "no email yet")}</Label>
        </div>
        <Button variant="soft" className="h-10 px-3" onClick={startEditing}>
          {t(lang, "تعديل", "Edit")}
        </Button>
      </Card>

      {editing && (
        <Card className="flex flex-col gap-2">
          <Field label={t(lang, "اسمك", "Your name")} value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} inputMode="text" />
          <Field label={t(lang, "تاريخ الميلاد", "Date of birth")} value={draft.birth} onChange={(v) => setDraft({ ...draft, birth: v })} type="date" inputMode="text" />
          <div className="grid grid-cols-2 gap-2">
            <Field label={t(lang, "الطول", "Height")} value={draft.height} onChange={(v) => setDraft({ ...draft, height: v })} unit={lengthLabel(units, lang)} />
            <Field label={t(lang, "الوزن", "Weight")} value={draft.weight} onChange={(v) => setDraft({ ...draft, weight: v })} unit={massLabel(units, lang)} />
          </div>
          <Field label={t(lang, "الوزن المستهدف", "Target weight")} value={draft.target} onChange={(v) => setDraft({ ...draft, target: v })} unit={massLabel(units, lang)} />
          <div className="flex gap-2 mt-1">
            <Button variant="soft" className="flex-1" onClick={() => setEditing(false)}>
              {t(lang, "إلغاء", "Cancel")}
            </Button>
            <Button className="flex-1" onClick={commit} disabled={save.isPending}>
              {t(lang, "احفظ", "Save")}
            </Button>
          </div>
        </Card>
      )}

      <div>
        <Label>{t(lang, "بياناتك", "Your data")}</Label>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {tiles.map(([label, value]) => (
            <div key={label} className="rounded-xl bg-surface-container p-3">
              <div className="text-label-sm text-on-surface-variant">{label}</div>
              <div className="text-title-md text-on-surface tabular-nums truncate">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <Card className="border border-primary-fixed/30 flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-label-lg text-on-surface">{t(lang, "خطتك المحسوبة", "Calculated plan")}</span>
          <span className="text-label-sm text-on-surface-variant">Mifflin-St Jeor</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {([
            [t(lang, "أيض أساسي", "BMR"), plan.bmr],
            [t(lang, "مصروفك", "TDEE"), plan.tdee],
            [t(lang, "هدفك", "Target"), plan.calories]
          ] as const).map(([label, value]) => (
            <div key={label} className="rounded-xl bg-surface-container-high p-3 text-center">
              <div className="text-title-md text-on-surface tabular-nums">{group(value, lang)}</div>
              <div className="text-label-sm text-on-surface-variant">{label}</div>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <Label>{t(lang, "وحدات القياس", "Units")}</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Segmented
            value={units.mass}
            onChange={(value) => save.mutate({ units: { ...units, mass: value as Profile["units"]["mass"] } })}
            options={[
              { value: "kg", label: t(lang, "كجم", "kg") },
              { value: "lb", label: t(lang, "رطل", "lb") }
            ]}
          />
          <Segmented
            value={units.length}
            onChange={(value) => save.mutate({ units: { ...units, length: value as Profile["units"]["length"] } })}
            options={[
              { value: "cm", label: t(lang, "سم", "cm") },
              { value: "in", label: t(lang, "إنش", "in") }
            ]}
          />
        </div>
      </div>

      <div>
        <Label>{t(lang, "هدفك", "Your goal")}</Label>
        <Segmented
          className="mt-2"
          value={me.goal}
          onChange={(value) => save.mutate({ goal: value })}
          options={[
            { value: "fatloss", label: t(lang, "تنشيف", "Cut") },
            { value: "maintenance", label: t(lang, "ثبات", "Maintain") },
            { value: "bulking", label: t(lang, "تضخيم", "Bulk") }
          ]}
        />
      </div>

      <div className="rounded-2xl bg-surface-container divide-y divide-outline-variant/40 overflow-hidden">
        <button onClick={() => navigate("/diet")} className="tap w-full flex items-center justify-between px-4 py-3.5 text-start">
          <span className="text-label-lg text-on-surface">{t(lang, "نظامي الغذائي", "My diet")}</span>
          <Icon name="chevron_right" className="text-on-surface-variant rtl:rotate-180" />
        </button>
        <button onClick={() => navigate("/progress")} className="tap w-full flex items-center justify-between px-4 py-3.5 text-start">
          <span className="text-label-lg text-on-surface">{t(lang, "تقدّمي", "My progress")}</span>
          <Icon name="chevron_right" className="text-on-surface-variant rtl:rotate-180" />
        </button>
        <button onClick={() => navigate("/coach")} className="tap w-full flex items-center justify-between px-4 py-3.5 text-start">
          <span>
            <span className="block text-label-lg text-on-surface">
              {me.isCoach ? t(lang, "متدربيني", "My trainees") : t(lang, "وضع المدرّب", "Coach mode")}
            </span>
            <span className="block text-label-sm text-on-surface-variant">
              {me.isCoach
                ? t(lang, "تابع تقدّمهم وأعطهم نظامهم", "Follow their progress and set their diet")
                : t(lang, "عندك متدربين؟ فعّله", "Have trainees? turn it on")}
            </span>
          </span>
          <Icon name="chevron_right" className="text-on-surface-variant rtl:rotate-180" />
        </button>
      </div>

      <RemindersCard />

      <div className="rounded-2xl bg-surface-container divide-y divide-outline-variant/40 overflow-hidden">
        <button
          onClick={async () => {
            setBusy(true);
            try {
              // The export is a file: it downloads rather than opening a screen.
              const blob = await api.exportData();
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `fitcore-${new Date().toISOString().slice(0, 10)}.json`;
              link.click();
              URL.revokeObjectURL(url);
              say(t(lang, "نزّلنا بياناتك", "Your data was downloaded"));
            } catch {
              say(t(lang, "ما قدرنا نصدّر بياناتك", "The export did not work"));
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
          className="tap w-full flex items-center justify-between px-4 py-3.5 text-start disabled:opacity-60"
        >
          <span>
            <span className="block text-label-lg text-on-surface">{t(lang, "نزّل بياناتي", "Download my data")}</span>
            <span className="block text-label-sm text-on-surface-variant">
              {t(lang, "كل شي سجّلته، بملف واحد", "Everything you logged, in one file")}
            </span>
          </span>
          <Icon name="download" className="text-on-surface-variant" />
        </button>

        <button
          onClick={() => setConfirming(true)}
          className="tap w-full flex items-center justify-between px-4 py-3.5 text-start"
        >
          <span>
            <span className="block text-label-lg text-error">{t(lang, "احذف حسابي", "Delete my account")}</span>
            <span className="block text-label-sm text-on-surface-variant">
              {t(lang, "يمسح كل شي نهائياً", "Removes everything, for good")}
            </span>
          </span>
          <Icon name="delete" className="text-on-surface-variant" />
        </button>
      </div>

      <Button
        variant="soft"
        className={cx("w-full", !isConfigured && "opacity-60")}
        onClick={async () => {
          if (isConfigured) await leave();
          else say(t(lang, "وضع التجربة — ما فيه حساب", "Demo mode — no account"));
        }}
      >
        <Icon name="logout" />
        {t(lang, "خروج", "Sign out")}
      </Button>

      <Sheet open={confirming} onClose={() => setConfirming(false)}>
        <Title>{t(lang, "تحذف حسابك؟", "Delete your account?")}</Title>
        <Label>
          {t(
            lang,
            "وزنك ومقاساتك وصورك وجلساتك كلها تنمسح ولا ترجع. نزّل بياناتك أول إذا تبي تحتفظ فيها.",
            "Your weight, measurements, photos and sessions all go, and do not come back. Download your data first if you want to keep it."
          )}
        </Label>
        <Button
          variant="soft"
          className="w-full mt-3"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await api.deleteAccount();
              if (isConfigured) await leave();
              say(t(lang, "انحذف حسابك", "Your account is gone"));
              window.location.href = "/";
            } catch {
              say(t(lang, "ما قدرنا نحذف الحساب", "The account could not be deleted"));
            } finally {
              setBusy(false);
              setConfirming(false);
            }
          }}
        >
          {t(lang, "احذفه نهائياً", "Delete it for good")}
        </Button>
        <Button className="w-full mt-2" onClick={() => setConfirming(false)}>
          {t(lang, "لا، رجعني", "No, take me back")}
        </Button>
      </Sheet>

      {isOffline && (
        <p className="text-label-sm text-on-surface-variant text-center">
          {t(
            lang,
            "وضع تجربة: البيانات محفوظة بجهازك فقط. اربط الـAPI عشان تنحفظ بحسابك.",
            "Demo mode: data stays on this device. Point the app at the API to keep it in your account."
          )}
        </p>
      )}
    </div>
  );
}
