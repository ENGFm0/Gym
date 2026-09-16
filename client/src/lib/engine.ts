/**
 * The same maths the API runs, kept here only for the offline demo mode.
 * When VITE_API_BASE is set nothing in this file is used — the server is the one source.
 */
import type { Activity, Profile, Program } from "./types";

export const PAL = { light: 1.375, moderate: 1.55, high: 1.725 } as const;

export const DIET_SPLIT: Record<string, { fat: number; protein: number; carbs: number }> = {
  keto: { fat: 0.7, protein: 0.25, carbs: 0.05 },
  highprotein: { fat: 0.28, protein: 0.37, carbs: 0.35 },
  balanced: { fat: 0.3, protein: 0.3, carbs: 0.4 },
  mediterranean: { fat: 0.35, protein: 0.2, carbs: 0.45 },
  if: { fat: 0.3, protein: 0.3, carbs: 0.4 }
};

export function ageFrom(birth?: string | null): number | null {
  if (!birth) return null;
  const b = new Date(birth);
  if (Number.isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age >= 0 && age < 120 ? age : null;
}

export function planFor(profile: Profile) {
  const weight = profile.weightKg || 81.4;
  const height = profile.heightCm || 178;
  const age = profile.age ?? ageFrom(profile.birthDate) ?? 29;
  const bmr = 10 * weight + 6.25 * height - 5 * age + (profile.gender === "female" ? -161 : 5);
  const tdee = bmr * PAL[profile.activity];
  const pace = Math.min(1, Math.max(0.1, profile.pace || 0.5));

  const delta =
    profile.goal === "bulking" ? Math.round(pace * 1000)
    : profile.goal === "maintenance" ? 0
    : profile.goal === "recomp" ? -250
    : -Math.round(pace * 1000);

  const calories = Math.max(1200, Math.round((tdee + delta) / 10) * 10);
  const split = DIET_SPLIT[profile.dietId] ?? DIET_SPLIT.balanced;
  const metres = height / 100;
  const bmi = Math.round((weight / (metres * metres)) * 10) / 10;
  const band =
    bmi < 18.5 ? ["نحافة", "Underweight"]
    : bmi < 25 ? ["وزن طبيعي", "Healthy"]
    : bmi < 30 ? ["زيادة وزن", "Overweight"]
    : ["سمنة", "Obese"];

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    calories,
    macros: {
      protein: Math.round((calories * split.protein) / 4),
      carbs: Math.round((calories * split.carbs) / 4),
      fat: Math.round((calories * split.fat) / 9)
    },
    dietId: profile.dietId,
    bmi,
    bmiBandAr: band[0],
    bmiBandEn: band[1]
  };
}

export const CALORIES_PER_STEP = 0.04;

export function metBurn(met: number, minutes: number, weightKg: number) {
  if (minutes <= 0 || met <= 0) return 0;
  return Math.round(met * (weightKg || 80) * (minutes / 60));
}

/* ---- the week ---- */

export const WEEK_AR = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
export const WEEK_EN = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const WEEK_AR_SHORT = ["س", "ح", "ن", "ث", "ر", "خ", "ج"];
export const WEEK_EN_SHORT = ["Sa", "Su", "Mo", "Tu", "We", "Th", "Fr"];

/** Saturday is index 0 — the week starts on Saturday. */
export const weekdayIndex = (date: Date) => (date.getDay() + 1) % 7;

export function startOfWeek(now = new Date()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - weekdayIndex(d));
  return d;
}

export const WEEK_SHAPES: Record<number, number[]> = {
  1: [1],
  2: [1, 4],
  3: [1, 3, 5],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6]
};

export const DAY_TEMPLATES: Record<number, [string, string][]> = {
  1: [["جسم كامل", "Full body"]],
  2: [["علوي", "Upper body"], ["سفلي", "Lower body"]],
  3: [["دفع", "Push"], ["سحب", "Pull"], ["أرجل", "Legs"]],
  4: [["صدر وترايسبس", "Chest & triceps"], ["ظهر وبايسبس", "Back & biceps"], ["أرجل", "Legs"], ["أكتاف وبطن", "Shoulders & core"]],
  5: [["صدر", "Chest"], ["ظهر", "Back"], ["أرجل", "Legs"], ["أكتاف", "Shoulders"], ["ذراعين", "Arms"]],
  6: [["دفع أ", "Push A"], ["سحب أ", "Pull A"], ["أرجل أ", "Legs A"], ["دفع ب", "Push B"], ["سحب ب", "Pull B"], ["أرجل ب", "Legs B"]],
  7: [["دفع أ", "Push A"], ["سحب أ", "Pull A"], ["أرجل أ", "Legs A"], ["دفع ب", "Push B"], ["سحب ب", "Pull B"], ["أرجل ب", "Legs B"], ["كارديو وبطن", "Cardio & core"]]
};

export const suggestedDays = (activity: Profile["activity"]) =>
  activity === "high" ? 5 : activity === "moderate" ? 4 : 3;

/** Renames the splits for the number of days, keeping the exercises already entered. */
export function reflow(program: Program): Program {
  const trainingDays = [...new Set(program.trainingDays.filter((d) => d >= 0 && d < 7))].sort((a, b) => a - b);
  if (trainingDays.length === 0) trainingDays.push(1);

  const count = Math.min(7, Math.max(1, trainingDays.length));
  const template = DAY_TEMPLATES[count];
  const kept = program.days;

  const days = template.map((slot, index) => ({
    slot: index,
    weekday: trainingDays[index],
    weekdayAr: WEEK_AR[trainingDays[index]],
    weekdayEn: WEEK_EN[trainingDays[index]],
    nameAr: slot[0],
    nameEn: slot[1],
    exercises: kept[index]?.exercises ?? []
  }));

  return {
    daysPerWeek: count,
    trainingDays,
    days,
    restDays: [0, 1, 2, 3, 4, 5, 6].filter((d) => !trainingDays.includes(d))
  };
}

export function weeklyTarget(activities: Activity[]) {
  return activities.reduce((sum, a) => sum + (a.timesPerWeek || 0), 0);
}
