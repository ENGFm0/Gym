/**
 * One client for the screens. It talks to the ASP.NET API when VITE_API_BASE is set,
 * and to the in-browser demo store when it is not.
 */
import { mockApi, type MockApi } from "./mock";
import { idToken } from "./firebase";
import type {
  Activity, ActivityCatalogItem, Day, Diet, Food, InBodyScan, Invite, MealSlot, Measurement,
  Photo, Plan, Profile, Program, Session, SessionExercise, Trainee, WeekSummary, Weight
} from "./types";

/** Everything a coach is allowed to see about one trainee, in one call each. */

/**
 * Demo mode is the absence of a configured API, not an empty string: behind Firebase Hosting
 * the API is same-origin, so `VITE_API_BASE=/` is a real backend with an empty base.
 */
const configured = import.meta.env.VITE_API_BASE;
const base = (configured ?? "").replace(/\/$/, "");
export const isOffline = configured === undefined || import.meta.env.VITE_DEMO === "1";

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await idToken();
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(detail || `${response.status} ${response.statusText}`);
  }

  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

const body = (value: unknown) => JSON.stringify(value);
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const httpApi: MockApi = {
  getProfile: () => call<Profile>("/api/me/profile"),
  updateProfile: (patch) => call<Profile>("/api/me/profile", { method: "PUT", body: body(patch) }),
  getPlan: () => call<Plan>("/api/me/plan"),
  getDiets: () => call<Diet[]>("/api/me/diets"),

  getDay: (date = today()) => call<Day>(`/api/diary/${date}`),
  addEntry: (date, entry) => call<Day>(`/api/diary/${date}/entries`, { method: "POST", body: body(entry) }),
  removeEntry: (date, entryId) => call<Day>(`/api/diary/${date}/entries/${entryId}`, { method: "DELETE" }),
  patchDay: (date, patch) => call<Day>(`/api/diary/${date}`, { method: "PATCH", body: body(patch) }),

  searchFoods: (query) => call<Food[]>(`/api/foods?q=${encodeURIComponent(query ?? "")}`),
  findByBarcode: async (code) => {
    try {
      return await call<Food>(`/api/foods/barcode/${encodeURIComponent(code)}`);
    } catch {
      return null; // not in our catalog and not in the open database either
    }
  },
  addCustomFood: (food) => call<Food>("/api/foods/custom", { method: "POST", body: body(food) }),

  getWeights: () => call<Weight[]>("/api/progress/weights"),
  addWeight: (kg, source) => call<Weight[]>("/api/progress/weights", { method: "POST", body: body({ kg, source }) }),
  deleteWeight: async (id) => {
    await call<void>(`/api/progress/weights/${id}`, { method: "DELETE" });
    return call<Weight[]>("/api/progress/weights");
  },

  getMeasurements: () => call<Measurement[]>("/api/progress/measurements"),
  addMeasurement: (parts) => call<Measurement[]>("/api/progress/measurements", { method: "POST", body: body({ parts }) }),
  deleteMeasurement: async (id) => {
    await call<void>(`/api/progress/measurements/${id}`, { method: "DELETE" });
    return call<Measurement[]>("/api/progress/measurements");
  },

  getPhotos: () => call<Photo[]>("/api/progress/photos"),
  /** The browser uploads to the signed URL, then the API is told where the file landed. */
  addPhoto: async (dataUrl, weightKg) => {
    const blob = await (await fetch(dataUrl)).blob();
    const ticket = await call<{ uploadUrl: string; storagePath: string }>(
      `/api/progress/photos/ticket?contentType=${encodeURIComponent(blob.type || "image/jpeg")}`,
      { method: "POST" }
    );
    await fetch(ticket.uploadUrl, { method: "PUT", body: blob, headers: { "Content-Type": blob.type } });
    return call<Photo[]>("/api/progress/photos", {
      method: "POST",
      body: body({ storagePath: ticket.storagePath, weightKg })
    });
  },
  deletePhoto: async (id) => {
    await call<void>(`/api/progress/photos/${id}`, { method: "DELETE" });
    return call<Photo[]>("/api/progress/photos");
  },

  getActivities: () => call<Activity[]>("/api/training/activities"),
  getActivityCatalog: () => call<ActivityCatalogItem[]>("/api/training/activities/catalog"),
  addActivity: async (request) => {
    await call<Activity>("/api/training/activities", { method: "POST", body: body(request) });
    return call<Activity[]>("/api/training/activities");
  },
  updateActivity: async (id, timesPerWeek) => {
    await call<Activity>(`/api/training/activities/${id}`, { method: "PATCH", body: body({ timesPerWeek }) });
    return call<Activity[]>("/api/training/activities");
  },
  removeActivity: async (id) => {
    await call<void>(`/api/training/activities/${id}`, { method: "DELETE" });
    return call<Activity[]>("/api/training/activities");
  },

  getProgram: () => call<Program>("/api/training/program"),
  setTrainingDays: (request) => call<Program>("/api/training/program/days", { method: "PUT", body: body(request) }),
  setDayExercises: (slot, exercises) =>
    call<Program>(`/api/training/program/days/${slot}/exercises`, { method: "PUT", body: body({ exercises }) }),
  getExerciseLibrary: () => call<{ nameAr: string; nameEn: string }[]>("/api/training/exercises"),

  getSessions: () => call<Session[]>("/api/training/sessions"),
  logSession: (request: { activityId: string; minutes?: number; distanceKm?: number; exercises?: SessionExercise[] }) =>
    call<Session>("/api/training/sessions", { method: "POST", body: body(request) }),
  deleteSession: async (id) => {
    await call<void>(`/api/training/sessions/${id}`, { method: "DELETE" });
    return call<Session[]>("/api/training/sessions");
  },
  getLastSet: async (exercise) => {
    try {
      return await call<{ weightKg: number; reps: number; atUtc: string }>(
        `/api/training/exercises/${encodeURIComponent(exercise)}/last`
      );
    } catch {
      return null; // nothing logged for this exercise yet
    }
  },

  getWeek: () => call<WeekSummary>("/api/training/week"),

  /* ---- coach ---- */

  becomeCoach: () => call<Profile>("/api/me/become-coach", { method: "POST" }),
  getTrainees: () => call<Trainee[]>("/api/coach/trainees"),
  getTraineeWeek: (uid) => call<WeekSummary>(`/api/coach/trainees/${uid}/week`),
  getTraineeWeights: (uid) => call<Weight[]>(`/api/coach/trainees/${uid}/weights`),
  getTraineePhotos: (uid) => call<Photo[]>(`/api/coach/trainees/${uid}/photos`),
  getTraineeDay: (uid, date) => call<Day>(`/api/coach/trainees/${uid}/diary/${date}`),
  inviteTrainee: async (email, name) => {
    await call<unknown>("/api/coach/trainees", { method: "POST", body: body({ email, name }) });
    return call<Trainee[]>("/api/coach/trainees");
  },
  assignPlan: async (traineeUid, plan) => {
    await call<void>(`/api/coach/trainees/${traineeUid}/plan`, { method: "PUT", body: body(plan) });
    return call<Trainee[]>("/api/coach/trainees");
  },
  revokeInvite: async (inviteId) => {
    await call<void>(`/api/coach/invites/${inviteId}`, { method: "DELETE" });
    return call<Trainee[]>("/api/coach/trainees");
  },

  /* ---- being coached ---- */

  getInvites: () => call<Invite[]>("/api/me/invites"),
  acceptInvite: (inviteId) => call<Profile>(`/api/me/invites/${inviteId}/accept`, { method: "POST" }),
  declineInvite: async (inviteId) => {
    await call<void>(`/api/me/invites/${inviteId}/decline`, { method: "POST" });
  },
  leaveCoach: () => call<Profile>("/api/me/leave-coach", { method: "POST" }),

  registerDevice: async (device) => {
    await call<void>("/api/me/devices", { method: "POST", body: body(device) });
  },
  removeTrainee: async (traineeUid) => {
    await call<void>(`/api/coach/trainees/${traineeUid}`, { method: "DELETE" });
    return call<Trainee[]>("/api/coach/trainees");
  },

  /* ---- body composition scan ---- */

  /** The photo goes up as multipart; the API reads it and hands back typed numbers. */
  scanInBody: async (dataUrl) => {
    const blob = await (await fetch(dataUrl)).blob();
    const form = new FormData();
    form.append("image", blob, "inbody.jpg");

    const token = await idToken();
    const response = await fetch(`${base}/api/scan/inbody`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form
    });

    if (!response.ok) throw new Error(await response.text().catch(() => "scan failed"));
    return (await response.json()) as InBodyScan;
  },

  saveScan: async (scan) => {
    await call<void>("/api/scan/inbody/save", { method: "POST", body: body(scan) });
  },

  reset: async () => {}
};

export const api: MockApi = isOffline ? mockApi : httpApi;
export const todayKey = today;
export type { MealSlot };
