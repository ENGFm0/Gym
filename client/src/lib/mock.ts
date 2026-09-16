/**
 * Offline mode. Everything the API would do, done in the browser against localStorage,
 * so the app can be opened and tried before the server is deployed.
 */
import {
  CALORIES_PER_STEP, metBurn, planFor, reflow, startOfWeek, suggestedDays,
  WEEK_AR, WEEK_AR_SHORT, WEEK_EN, WEEK_EN_SHORT, WEEK_SHAPES, weekdayIndex, weeklyTarget
} from "./engine";
import { FOODS, ACTIVITY_LIBRARY, DIETS, EXERCISES } from "./catalog";
import type {
  Activity, ActivityCatalogItem, Day, Diet, Food, InBodyScan, Meal, MealEntry, MealSlot,
  Measurement, Photo, Profile, Program, Session, SessionExercise, Trainee, WeekSummary, Weight
} from "./types";

const KEY = "fitcore.demo.v1";
const SLOTS: MealSlot[] = ["breakfast", "lunch", "snack", "dinner"];

interface Store {
  profile: Profile;
  days: Record<string, { steps: number; water: number; meals: Record<MealSlot, MealEntry[]> }>;
  weights: Weight[];
  measures: Measurement[];
  photos: Photo[];
  activities: Activity[];
  sessions: Session[];
  program: Program | null;
  exLast: Record<string, { weightKg: number; reps: number; atUtc: string }>;
  customFoods: Food[];
  trainees: Trainee[];
}

const blankProfile = (): Profile => ({
  uid: "demo",
  name: null,
  email: null,
  phone: null,
  gender: "male",
  birthDate: null,
  age: null,
  heightCm: 0,
  weightKg: 0,
  targetWeightKg: null,
  activity: "light",
  goal: "fatloss",
  pace: 0.5,
  dietId: "balanced",
  units: { mass: "kg", length: "cm" },
  restSeconds: 90,
  isCoach: false
});

function load(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...(JSON.parse(raw) as Store) };
  } catch {
    /* private mode, cleared storage: start over rather than break */
  }
  return empty();
}

function empty(): Store {
  return {
    profile: blankProfile(),
    days: {},
    weights: [],
    measures: [],
    photos: [],
    activities: [],
    sessions: [],
    program: null,
    exLast: {},
    customFoods: [],
    trainees: []
  };
}

let store = load();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* over quota or blocked: the session still works, it just will not survive a reload */
  }
}

const id = () => Math.random().toString(36).slice(2, 10);
const todayKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function dayRow(date: string) {
  if (!store.days[date]) {
    store.days[date] = { steps: 0, water: 0, meals: { breakfast: [], lunch: [], snack: [], dinner: [] } };
  }
  return store.days[date];
}

const factor = (e: MealEntry) => (e.baseAmount <= 0 ? 0 : e.quantity / e.baseAmount);

function sum(entries: MealEntry[]) {
  return entries.reduce(
    (t, e) => {
      const k = factor(e);
      return {
        calories: t.calories + e.calories * k,
        protein: t.protein + e.protein * k,
        carbs: t.carbs + e.carbs * k,
        fat: t.fat + e.fat * k
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

const round = (t: { calories: number; protein: number; carbs: number; fat: number }) => ({
  calories: Math.round(t.calories),
  protein: Math.round(t.protein),
  carbs: Math.round(t.carbs),
  fat: Math.round(t.fat)
});

function buildDay(date: string): Day {
  const row = dayRow(date);
  const plan = planFor(store.profile);
  const totals = round(sum(SLOTS.flatMap((s) => row.meals[s])));

  const sessionBurn = store.sessions
    .filter((s) => s.atUtc.slice(0, 10) === date)
    .reduce((a, s) => a + s.calories, 0);
  const burned = Math.round(sessionBurn + row.steps * CALORIES_PER_STEP);

  const meals: Meal[] = SLOTS.map((slot) => ({
    slot,
    items: row.meals[slot],
    totals: round(sum(row.meals[slot]))
  }));

  return {
    date,
    meals,
    totals,
    plan,
    steps: row.steps,
    waterLitres: row.water,
    burnedCalories: burned,
    caloriesLeft: Math.round(plan.calories - totals.calories + burned)
  };
}

function ensureProgram(): Program {
  if (!store.program) {
    const days = suggestedDays(store.profile.activity);
    store.program = reflow({ daysPerWeek: days, trainingDays: [...WEEK_SHAPES[days]], days: [], restDays: [] });
    save();
  }
  return store.program;
}

function ensureActivities(): Activity[] {
  if (store.activities.length === 0) {
    const gym = ACTIVITY_LIBRARY.find((a) => a.id === "gym")!;
    store.activities = [{ ...gym, timesPerWeek: 4, doneThisWeek: 0, isCustom: false }];
    save();
  }
  return store.activities;
}

const sessionsThisWeek = () => {
  const from = startOfWeek().getTime();
  return store.sessions.filter((s) => new Date(s.atUtc).getTime() >= from);
};

export const mockApi = {
  async getProfile(): Promise<Profile> {
    return { ...store.profile, age: store.profile.age ?? null };
  },

  async updateProfile(patch: Partial<Profile>): Promise<Profile> {
    store.profile = { ...store.profile, ...patch };
    if (store.profile.birthDate) {
      const b = new Date(store.profile.birthDate);
      const now = new Date();
      let age = now.getFullYear() - b.getFullYear();
      const m = now.getMonth() - b.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
      store.profile.age = age;
    }
    save();
    return store.profile;
  },

  async getPlan() {
    return planFor(store.profile);
  },

  async getDiets(): Promise<Diet[]> {
    return DIETS;
  },

  async getDay(date = todayKey()): Promise<Day> {
    return buildDay(date);
  },

  async addEntry(date: string, body: {
    slot: MealSlot; foodId?: string; quantity: number;
    nameAr?: string; nameEn?: string; unit?: string;
    calories?: number; protein?: number; carbs?: number; fat?: number;
  }): Promise<Day> {
    const row = dayRow(date);
    const food = body.foodId
      ? [...FOODS, ...store.customFoods].find((f) => f.id === body.foodId)
      : undefined;

    const entry: MealEntry = food
      ? {
          id: id(), foodId: food.id, nameAr: food.nameAr, nameEn: food.nameEn,
          unit: food.unit, baseAmount: food.baseAmount,
          quantity: body.quantity > 0 ? body.quantity : food.baseAmount,
          calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat
        }
      : {
          id: id(), foodId: null, nameAr: body.nameAr ?? "صنف يدوي", nameEn: body.nameEn ?? "Custom item",
          unit: body.unit ?? "حصة", baseAmount: 1, quantity: body.quantity > 0 ? body.quantity : 1,
          calories: body.calories ?? 0, protein: body.protein ?? 0, carbs: body.carbs ?? 0, fat: body.fat ?? 0
        };

    row.meals[body.slot].push(entry);
    save();
    return buildDay(date);
  },

  async removeEntry(date: string, entryId: string): Promise<Day> {
    const row = dayRow(date);
    SLOTS.forEach((slot) => {
      row.meals[slot] = row.meals[slot].filter((e) => e.id !== entryId);
    });
    save();
    return buildDay(date);
  },

  async patchDay(date: string, patch: { steps?: number; waterLitres?: number }): Promise<Day> {
    const row = dayRow(date);
    if (patch.steps !== undefined) row.steps = Math.max(0, Math.round(patch.steps));
    if (patch.waterLitres !== undefined) row.water = Math.max(0, Math.round(patch.waterLitres * 100) / 100);
    save();
    return buildDay(date);
  },

  async searchFoods(query?: string): Promise<Food[]> {
    const all = [...store.customFoods, ...FOODS];
    if (!query?.trim()) return all.slice(0, 40);
    const q = query.trim().toLowerCase();
    return all.filter((f) => f.nameAr.includes(q) || f.nameEn.toLowerCase().includes(q)).slice(0, 40);
  },

  async addCustomFood(food: Omit<Food, "id" | "isCustom">): Promise<Food> {
    const created: Food = { ...food, id: "u" + id(), isCustom: true };
    store.customFoods.unshift(created);
    save();
    return created;
  },

  async getWeights(): Promise<Weight[]> {
    return [...store.weights].reverse();
  },

  /** A new reading, never a replacement — that is what keeps the previous value on screen. */
  async addWeight(kg: number, source?: string): Promise<Weight[]> {
    const previous = store.weights[store.weights.length - 1];
    store.weights.push({
      id: id(),
      kg: Math.round(kg * 10) / 10,
      atUtc: new Date().toISOString(),
      delta: previous ? Math.round((kg - previous.kg) * 10) / 10 : null,
      source: source ?? null
    });
    if (store.weights.length > 120) store.weights.shift();
    store.profile.weightKg = Math.round(kg * 10) / 10;
    save();
    return [...store.weights].reverse();
  },

  async deleteWeight(weightId: string): Promise<Weight[]> {
    store.weights = store.weights.filter((w) => w.id !== weightId);
    save();
    return [...store.weights].reverse();
  },

  async getMeasurements(): Promise<Measurement[]> {
    return [...store.measures].reverse();
  },

  async addMeasurement(parts: Record<string, number>): Promise<Measurement[]> {
    const previous = store.measures[store.measures.length - 1];
    const deltas: Record<string, number> = {};
    if (previous) {
      Object.entries(parts).forEach(([part, value]) => {
        if (previous.parts[part] !== undefined) deltas[part] = Math.round((value - previous.parts[part]) * 10) / 10;
      });
    }
    store.measures.push({ id: id(), atUtc: new Date().toISOString(), parts, deltas });
    save();
    return [...store.measures].reverse();
  },

  async deleteMeasurement(measureId: string): Promise<Measurement[]> {
    store.measures = store.measures.filter((m) => m.id !== measureId);
    save();
    return [...store.measures].reverse();
  },

  async getPhotos(): Promise<Photo[]> {
    return [...store.photos].reverse();
  },

  /** In demo mode the image stays in the browser as a data URL. */
  async addPhoto(dataUrl: string, weightKg?: number): Promise<Photo[]> {
    store.photos.push({ id: id(), url: dataUrl, atUtc: new Date().toISOString(), weightKg: weightKg ?? null });
    save();
    return [...store.photos].reverse();
  },

  async deletePhoto(photoId: string): Promise<Photo[]> {
    store.photos = store.photos.filter((p) => p.id !== photoId);
    save();
    return [...store.photos].reverse();
  },

  async getActivities(): Promise<Activity[]> {
    const week = sessionsThisWeek();
    return ensureActivities().map((a) => ({ ...a, doneThisWeek: week.filter((s) => s.activityId === a.id).length }));
  },

  async getActivityCatalog(): Promise<ActivityCatalogItem[]> {
    return ACTIVITY_LIBRARY;
  },

  async addActivity(body: { catalogId?: string; nameAr?: string; met?: number; timesPerWeek: number }): Promise<Activity[]> {
    const activities = ensureActivities();
    const fromCatalog = body.catalogId ? ACTIVITY_LIBRARY.find((a) => a.id === body.catalogId) : undefined;

    if (fromCatalog) {
      if (!activities.some((a) => a.id === fromCatalog.id)) {
        activities.push({ ...fromCatalog, timesPerWeek: body.timesPerWeek, doneThisWeek: 0, isCustom: false });
      }
    } else {
      const name = body.nameAr ?? "نشاط";
      activities.push({
        id: "c" + id(), nameAr: name, nameEn: name, icon: "exercise",
        met: body.met ?? 6, unit: "minutes", timesPerWeek: body.timesPerWeek,
        doneThisWeek: 0, isCustom: true
      });
    }

    save();
    return this.getActivities();
  },

  async updateActivity(activityId: string, timesPerWeek: number): Promise<Activity[]> {
    const activity = ensureActivities().find((a) => a.id === activityId);
    if (activity) activity.timesPerWeek = Math.max(1, Math.min(14, timesPerWeek));
    save();
    return this.getActivities();
  },

  async removeActivity(activityId: string): Promise<Activity[]> {
    store.activities = ensureActivities().filter((a) => a.id !== activityId);
    save();
    return this.getActivities();
  },

  async getProgram(): Promise<Program> {
    return ensureProgram();
  },

  async setTrainingDays(body: { daysPerWeek?: number; toggleWeekday?: number }): Promise<Program> {
    const program = ensureProgram();
    let trainingDays = [...program.trainingDays];
    let days = [...program.days];

    if (body.daysPerWeek !== undefined) {
      trainingDays = [...WEEK_SHAPES[Math.min(7, Math.max(1, body.daysPerWeek))]];
    } else if (body.toggleWeekday !== undefined) {
      const at = trainingDays.indexOf(body.toggleWeekday);
      if (at >= 0) {
        if (trainingDays.length === 1) return program;
        trainingDays.splice(at, 1);
        days.splice(at, 1);
      } else {
        trainingDays.push(body.toggleWeekday);
        trainingDays.sort((a, b) => a - b);
        const position = trainingDays.indexOf(body.toggleWeekday);
        days.splice(position, 0, {
          slot: position, weekday: body.toggleWeekday, weekdayAr: "", weekdayEn: "",
          nameAr: "", nameEn: "", exercises: []
        });
      }
    }

    store.program = reflow({ daysPerWeek: trainingDays.length, trainingDays, days, restDays: [] });
    save();
    return store.program;
  },

  async setDayExercises(slot: number, exercises: Program["days"][number]["exercises"]): Promise<Program> {
    const program = ensureProgram();
    if (program.days[slot]) program.days[slot].exercises = exercises;
    save();
    return program;
  },

  async getExerciseLibrary() {
    return EXERCISES;
  },

  async getSessions(): Promise<Session[]> {
    return [...store.sessions].sort((a, b) => (a.atUtc < b.atUtc ? 1 : -1));
  },

  async logSession(body: {
    activityId: string; minutes?: number; distanceKm?: number; exercises?: SessionExercise[];
  }): Promise<Session> {
    const activity = ensureActivities().find((a) => a.id === body.activityId)
      ?? ACTIVITY_LIBRARY.find((a) => a.id === body.activityId);
    const met = activity?.met ?? 5;

    let volume = 0;
    let sets = 0;
    (body.exercises ?? []).forEach((exercise) =>
      exercise.sets.forEach((set) => {
        if (!set.done) return;
        volume += (set.weightKg ?? 0) * set.reps;
        sets++;
      })
    );

    if (body.exercises?.length && sets === 0) throw new Error("no-sets");

    const minutes = Math.max(1, Math.round(body.minutes ?? (sets ? sets * 3 : 0)));
    const session: Session = {
      id: id(),
      activityId: body.activityId,
      nameAr: activity?.nameAr ?? body.activityId,
      nameEn: activity?.nameEn ?? body.activityId,
      atUtc: new Date().toISOString(),
      minutes,
      distanceKm: body.distanceKm ?? null,
      volumeKg: Math.round(volume),
      sets,
      calories: metBurn(met, minutes, store.profile.weightKg)
    };

    store.sessions.push(session);

    (body.exercises ?? []).forEach((exercise) => {
      const best = exercise.sets.filter((s) => s.done && (s.weightKg ?? 0) > 0)
        .sort((a, b) => (b.weightKg ?? 0) - (a.weightKg ?? 0))[0];
      if (best) {
        store.exLast[exercise.nameAr] = {
          weightKg: best.weightKg ?? 0, reps: best.reps, atUtc: session.atUtc
        };
      }
    });

    save();
    return session;
  },

  async deleteSession(sessionId: string): Promise<Session[]> {
    store.sessions = store.sessions.filter((s) => s.id !== sessionId);
    save();
    return this.getSessions();
  },

  async getLastSet(exercise: string): Promise<{ weightKg: number; reps: number; atUtc: string } | null> {
    return store.exLast[exercise] ?? null;
  },

  async getWeek(): Promise<WeekSummary> {
    const activities = await this.getActivities();
    const week = sessionsThisWeek();
    const program = ensureProgram();
    const target = weeklyTarget(activities);

    const bars = [0, 0, 0, 0, 0, 0, 0];
    week.forEach((s) => bars[weekdayIndex(new Date(s.atUtc))]++);

    const todayIndex = weekdayIndex(new Date());
    const today = program.days.find((d) => d.weekday === todayIndex) ?? null;

    return {
      sessionsDone: week.length,
      sessionsTarget: target,
      adherencePercent: target ? Math.min(100, Math.round((week.length / target) * 100)) : 0,
      volumeKg: week.reduce((a, s) => a + s.volumeKg, 0),
      caloriesBurned: week.reduce((a, s) => a + s.calories, 0),
      minutes: week.reduce((a, s) => a + s.minutes, 0),
      days: bars.map((sessions, index) => ({
        weekday: index, labelAr: WEEK_AR_SHORT[index], labelEn: WEEK_EN_SHORT[index], sessions
      })),
      activities: activities.map((a) => ({
        id: a.id, nameAr: a.nameAr, nameEn: a.nameEn, icon: a.icon,
        done: a.doneThisWeek, target: a.timesPerWeek
      })),
      today,
      isRestDay: !today
    };
  },

  /* ---- coach ---- */

  async becomeCoach(): Promise<Profile> {
    store.profile.isCoach = true;
    if (store.trainees.length === 0) {
      // A demo roster, so the coach screens have something to show.
      store.trainees = [
        { uid: "t1", name: "سعود", status: "active", startedAtUtc: new Date(Date.now() - 40 * 864e5).toISOString(),
          weightKg: 88.4, weightDelta: -0.9, sessionsThisWeek: 3, adherencePercent: 75, assignedDietId: "highprotein" },
        { uid: "t2", name: "نورة", status: "active", startedAtUtc: new Date(Date.now() - 12 * 864e5).toISOString(),
          weightKg: 63.1, weightDelta: -0.4, sessionsThisWeek: 2, adherencePercent: 66, assignedDietId: "balanced" },
        { uid: "t3", name: "خالد", status: "invited", startedAtUtc: new Date().toISOString(),
          weightKg: null, weightDelta: null, sessionsThisWeek: 0, adherencePercent: 0, assignedDietId: null }
      ];
    }
    save();
    return store.profile;
  },

  async getTrainees(): Promise<Trainee[]> {
    return store.trainees;
  },

  async inviteTrainee(email: string, name?: string): Promise<Trainee[]> {
    store.trainees.push({
      uid: "t" + id(), name: name || email, status: "invited",
      startedAtUtc: new Date().toISOString(), weightKg: null, weightDelta: null,
      sessionsThisWeek: 0, adherencePercent: 0, assignedDietId: null
    });
    save();
    return store.trainees;
  },

  async assignDiet(traineeUid: string, dietId: string): Promise<Trainee[]> {
    const trainee = store.trainees.find((t) => t.uid === traineeUid);
    if (trainee) trainee.assignedDietId = dietId;
    save();
    return store.trainees;
  },

  async removeTrainee(traineeUid: string): Promise<Trainee[]> {
    store.trainees = store.trainees.filter((t) => t.uid !== traineeUid);
    save();
    return store.trainees;
  },

  /* ---- body composition scan ---- */

  /**
   * Offline there is no model to read the sheet, so the scan reports that plainly
   * rather than inventing numbers the member might save.
   */
  async scanInBody(_dataUrl: string): Promise<InBodyScan> {
    return {
      weightKg: null, bodyFatPercent: null, skeletalMuscleKg: null, bodyFatMassKg: null,
      bmi: null, basalMetabolicRate: null, visceralFatLevel: null, bodyWaterLitres: null,
      measuredOn: null, deviceName: null, confidence: 0, note: "offline"
    };
  },

  async saveScan(scan: { weightKg?: number | null; bodyFatPercent?: number | null; skeletalMuscleKg?: number | null }) {
    if (scan.weightKg) await this.addWeight(scan.weightKg, "inbody");
  },

  /** Used by the sign-out button in demo mode. */
  async reset() {
    store = empty();
    save();
  }
};

export const weekdayNames = { ar: WEEK_AR, en: WEEK_EN };
export type MockApi = typeof mockApi;
