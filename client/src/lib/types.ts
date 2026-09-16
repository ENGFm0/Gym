/** Mirrors the DTOs in FitCore.Application.Contracts. */

export type Lang = "ar" | "en";
export type Theme = "dark" | "light";

export interface Units { mass: "kg" | "lb"; length: "cm" | "in" }

export interface Profile {
  uid: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  gender: "male" | "female";
  birthDate?: string | null;
  age?: number | null;
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number | null;
  activity: "light" | "moderate" | "high";
  goal: "fatloss" | "maintenance" | "bulking" | "recomp";
  pace: number;
  dietId: string;
  units: Units;
  restSeconds: number;
  isCoach: boolean;
}

export interface Macros { protein: number; carbs: number; fat: number }

export interface Plan {
  bmr: number;
  tdee: number;
  calories: number;
  macros: Macros;
  dietId: string;
  bmi: number;
  bmiBandAr: string;
  bmiBandEn: string;
}

export type MealSlot = "breakfast" | "lunch" | "snack" | "dinner";

export interface Totals { calories: number; protein: number; carbs: number; fat: number }

export interface MealEntry {
  id: string;
  foodId?: string | null;
  nameAr: string;
  nameEn: string;
  unit: string;
  baseAmount: number;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal { slot: MealSlot; items: MealEntry[]; totals: Totals }

export interface Day {
  date: string;
  meals: Meal[];
  totals: Totals;
  plan: Plan;
  steps: number;
  waterLitres: number;
  burnedCalories: number;
  caloriesLeft: number;
}

export interface Food {
  id: string;
  nameAr: string;
  nameEn: string;
  unit: string;
  baseAmount: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  barcode?: string | null;
  isCustom: boolean;
}

export interface Weight { id: string; kg: number; atUtc: string; delta?: number | null; source?: string | null }

export interface Measurement {
  id: string;
  atUtc: string;
  parts: Record<string, number>;
  deltas: Record<string, number>;
}

export interface Photo { id: string; url: string; atUtc: string; weightKg?: number | null }

export interface Activity {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  met: number;
  unit: "session" | "minutes";
  timesPerWeek: number;
  doneThisWeek: number;
  isCustom: boolean;
}

export interface Exercise { nameAr: string; nameEn: string; sets: number; reps: number }

export interface ProgramDay {
  slot: number;
  weekday: number;
  weekdayAr: string;
  weekdayEn: string;
  nameAr: string;
  nameEn: string;
  exercises: Exercise[];
}

export interface Program {
  daysPerWeek: number;
  trainingDays: number[];
  days: ProgramDay[];
  restDays: number[];
}

export interface SetLog { weightKg?: number | null; reps: number; done: boolean }
export interface SessionExercise { nameAr: string; nameEn: string; sets: SetLog[] }

export interface Session {
  id: string;
  activityId: string;
  nameAr: string;
  nameEn: string;
  atUtc: string;
  minutes: number;
  distanceKm?: number | null;
  volumeKg: number;
  sets: number;
  calories: number;
}

export interface WeekDayBar { weekday: number; labelAr: string; labelEn: string; sessions: number }
export interface ActivityProgress { id: string; nameAr: string; nameEn: string; icon: string; done: number; target: number }

export interface WeekSummary {
  sessionsDone: number;
  sessionsTarget: number;
  adherencePercent: number;
  volumeKg: number;
  caloriesBurned: number;
  minutes: number;
  days: WeekDayBar[];
  activities: ActivityProgress[];
  today?: ProgramDay | null;
  isRestDay: boolean;
}

export interface Diet {
  id: string;
  nameAr: string;
  nameEn: string;
  split: { fat: number; protein: number; carbs: number };
  eat: string[];
  avoid: string[];
}

export interface ActivityCatalogItem {
  id: string;
  nameAr: string;
  nameEn: string;
  met: number;
  icon: string;
  unit: "session" | "minutes";
}

/* ---- coach ---- */

export interface Trainee {
  uid: string;
  name: string;
  status: "invited" | "active" | "paused";
  startedAtUtc: string;
  weightKg?: number | null;
  weightDelta?: number | null;
  sessionsThisWeek: number;
  adherencePercent: number;
  assignedDietId?: string | null;
}

/* ---- body composition scan ---- */

export interface InBodyScan {
  weightKg?: number | null;
  bodyFatPercent?: number | null;
  skeletalMuscleKg?: number | null;
  bodyFatMassKg?: number | null;
  bmi?: number | null;
  basalMetabolicRate?: number | null;
  visceralFatLevel?: number | null;
  bodyWaterLitres?: number | null;
  measuredOn?: string | null;
  deviceName?: string | null;
  confidence: number;
  note?: string | null;
}
