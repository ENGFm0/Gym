import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Bar, Button, Card, Field, Icon, Label, Segmented, Title } from "@/components/ui";
import { useDiets, useProfile, useSaveProfile } from "@/lib/queries";
import { parseNumber, toCm, toKg } from "@/lib/format";
import { t, useUi } from "@/state/ui";
import type { Profile } from "@/lib/types";

const STEPS = 4;

/** Signup goes straight into the numbers: without height and weight there is no plan. */
export function Onboarding() {
  const { lang, say } = useUi();
  const navigate = useNavigate();
  const profile = useProfile();
  const save = useSaveProfile();
  const diets = useDiets();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Profile["gender"]>("male");
  const [birth, setBirth] = useState("");
  const [mass, setMass] = useState<"kg" | "lb">("kg");
  const [length, setLength] = useState<"cm" | "in">("cm");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [target, setTarget] = useState("");
  const [activity, setActivity] = useState<Profile["activity"]>("light");
  const [goal, setGoal] = useState<Profile["goal"]>("fatloss");
  const [dietId, setDietId] = useState("balanced");

  const units = { mass, length };

  async function finish() {
    const h = parseNumber(height);
    const w = parseNumber(weight);
    if (!Number.isFinite(h) || !Number.isFinite(w) || h <= 0 || w <= 0) {
      say(t(lang, "اكتب طولك ووزنك", "Enter your height and weight"));
      setStep(1);
      return;
    }

    await save.mutateAsync({
      name: name || profile.data?.name || null,
      gender,
      birthDate: birth || null,
      heightCm: Math.round(toCm(h, units)),
      weightKg: Math.round(toKg(w, units) * 10) / 10,
      targetWeightKg: Number.isFinite(parseNumber(target))
        ? Math.round(toKg(parseNumber(target), units) * 10) / 10
        : null,
      activity,
      goal,
      dietId,
      units
    });

    say(t(lang, "جاهز — هذي خطتك", "All set — here is your plan"));
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-md mx-auto px-gutter py-8 flex flex-col gap-5">
        <div className="flex flex-col items-center gap-3">
          <Logo height={32} />
          <Bar value={step + 1} max={STEPS} />
        </div>

        {step === 0 && (
          <Card className="flex flex-col gap-3">
            <Title>{t(lang, "نعرفك أول", "First, who are you")}</Title>
            <Field label={t(lang, "اسمك", "Your name")} value={name} onChange={setName} inputMode="text" />
            <div>
              <Label>{t(lang, "الجنس", "Sex")}</Label>
              <Segmented
                className="mt-1"
                value={gender}
                onChange={setGender}
                options={[
                  { value: "male", label: t(lang, "ذكر", "Male") },
                  { value: "female", label: t(lang, "أنثى", "Female") }
                ]}
              />
            </div>
            <Field
              label={t(lang, "تاريخ الميلاد — نحسب عمرك منه", "Date of birth — your age comes from it")}
              value={birth}
              onChange={setBirth}
              type="date"
              inputMode="text"
            />
          </Card>
        )}

        {step === 1 && (
          <Card className="flex flex-col gap-3">
            <Title>{t(lang, "قياساتك", "Your numbers")}</Title>
            <div className="grid grid-cols-2 gap-2">
              <Segmented
                value={mass}
                onChange={setMass}
                options={[
                  { value: "kg", label: t(lang, "كجم", "kg") },
                  { value: "lb", label: t(lang, "رطل", "lb") }
                ]}
              />
              <Segmented
                value={length}
                onChange={setLength}
                options={[
                  { value: "cm", label: t(lang, "سم", "cm") },
                  { value: "in", label: t(lang, "إنش", "in") }
                ]}
              />
            </div>
            <Field label={t(lang, "الطول", "Height")} value={height} onChange={setHeight} unit={length} />
            <Field label={t(lang, "الوزن الحالي", "Current weight")} value={weight} onChange={setWeight} unit={mass} />
            <Field label={t(lang, "الوزن المستهدف", "Target weight")} value={target} onChange={setTarget} unit={mass} />
          </Card>
        )}

        {step === 2 && (
          <Card className="flex flex-col gap-4">
            <div>
              <Title>{t(lang, "نشاطك اليومي", "How active you are")}</Title>
              <Label>{t(lang, "منه نبني أيام تمرينك", "It also seeds your training week")}</Label>
              <div className="mt-2 flex flex-col gap-2">
                {([
                  ["light", "خامل أو مكتبي", "Desk / light", "٣ أيام", "3 days"],
                  ["moderate", "متوسط", "Moderate", "٤ أيام", "4 days"],
                  ["high", "عالي", "High", "٥ أيام", "5 days"]
                ] as const).map(([value, ar, en, arDays, enDays]) => (
                  <button
                    key={value}
                    onClick={() => setActivity(value)}
                    className={`tap w-full rounded-xl px-4 py-3 flex items-center justify-between text-start ${
                      activity === value ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-high text-on-surface"
                    }`}
                  >
                    <span className="text-label-lg">{t(lang, ar, en)}</span>
                    <span className="text-label-sm opacity-80">{t(lang, arDays, enDays)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Title>{t(lang, "هدفك", "Your goal")}</Title>
              <Segmented
                className="mt-2"
                value={goal}
                onChange={setGoal}
                options={[
                  { value: "fatloss", label: t(lang, "تنشيف", "Cut") },
                  { value: "maintenance", label: t(lang, "ثبات", "Maintain") },
                  { value: "bulking", label: t(lang, "تضخيم", "Bulk") }
                ]}
              />
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="flex flex-col gap-3">
            <Title>{t(lang, "نظامك الغذائي", "Your diet")}</Title>
            <div className="rounded-2xl bg-surface-container-high divide-y divide-outline-variant/40 overflow-hidden">
              {(diets.data ?? []).map((diet) => (
                <button
                  key={diet.id}
                  onClick={() => setDietId(diet.id)}
                  className="tap w-full px-4 py-3 flex items-center justify-between text-start"
                >
                  <span className="text-label-lg text-on-surface">{t(lang, diet.nameAr, diet.nameEn)}</span>
                  {dietId === diet.id ? (
                    <span className="px-2.5 py-1 rounded-lg bg-primary-fixed text-on-primary-fixed text-label-sm">
                      {t(lang, "مختار", "Picked")}
                    </span>
                  ) : (
                    <Icon name="chevron_right" className="text-on-surface-variant rtl:rotate-180" />
                  )}
                </button>
              ))}
            </div>
          </Card>
        )}

        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="soft" className="flex-1" onClick={() => setStep(step - 1)}>
              {t(lang, "رجوع", "Back")}
            </Button>
          )}
          <Button
            className="flex-1"
            disabled={save.isPending}
            onClick={() => (step === STEPS - 1 ? finish() : setStep(step + 1))}
          >
            {step === STEPS - 1 ? t(lang, "احسب خطتي", "Build my plan") : t(lang, "التالي", "Next")}
          </Button>
        </div>

        {profile.data?.weightKg ? (
          <button
            onClick={() => navigate("/")}
            className="tap text-label-lg text-on-surface-variant"
          >
            {t(lang, "تخطّي — بياناتي محفوظة", "Skip — my data is already saved")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
