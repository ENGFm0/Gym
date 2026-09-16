import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, todayKey } from "./api";
import type { MealSlot, Profile, Program, Reminders, SessionExercise } from "./types";

export const keys = {
  profile: ["profile"] as const,
  plan: ["plan"] as const,
  diets: ["diets"] as const,
  day: (date: string) => ["day", date] as const,
  foods: (q: string) => ["foods", q] as const,
  weights: ["weights"] as const,
  measurements: ["measurements"] as const,
  photos: ["photos"] as const,
  activities: ["activities"] as const,
  activityCatalog: ["activityCatalog"] as const,
  program: ["program"] as const,
  exerciseLibrary: ["exerciseLibrary"] as const,
  sessions: ["sessions"] as const,
  week: ["week"] as const,
  trainees: ["trainees"] as const,
  invites: ["invites"] as const,
  reminders: ["reminders"] as const,
  trainee: (uid: string) => ["trainee", uid] as const,
  traineeDay: (uid: string, date: string) => ["trainee", uid, "day", date] as const
};

export const useProfile = () => useQuery({ queryKey: keys.profile, queryFn: () => api.getProfile() });
export const useDiets = () => useQuery({ queryKey: keys.diets, queryFn: () => api.getDiets(), staleTime: Infinity });
export const useDay = (date = todayKey()) => useQuery({ queryKey: keys.day(date), queryFn: () => api.getDay(date) });
export const useWeights = () => useQuery({ queryKey: keys.weights, queryFn: () => api.getWeights() });
export const useMeasurements = () => useQuery({ queryKey: keys.measurements, queryFn: () => api.getMeasurements() });
export const usePhotos = () => useQuery({ queryKey: keys.photos, queryFn: () => api.getPhotos() });
export const useActivities = () => useQuery({ queryKey: keys.activities, queryFn: () => api.getActivities() });
export const useProgram = () => useQuery({ queryKey: keys.program, queryFn: () => api.getProgram() });
export const useSessions = () => useQuery({ queryKey: keys.sessions, queryFn: () => api.getSessions() });
export const useWeek = () => useQuery({ queryKey: keys.week, queryFn: () => api.getWeek() });

export const useActivityCatalog = () =>
  useQuery({ queryKey: keys.activityCatalog, queryFn: () => api.getActivityCatalog(), staleTime: Infinity });

export const useExerciseLibrary = () =>
  useQuery({ queryKey: keys.exerciseLibrary, queryFn: () => api.getExerciseLibrary(), staleTime: Infinity });

export const useFoodSearch = (query: string) =>
  useQuery({ queryKey: keys.foods(query), queryFn: () => api.searchFoods(query) });

/** Anything that changes a number the dashboard shows has to refresh it too. */
function useRefresh() {
  const client = useQueryClient();
  return (...groups: readonly (readonly unknown[])[]) =>
    Promise.all(groups.map((key) => client.invalidateQueries({ queryKey: [...key] })));
}

export function useSaveProfile() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (patch: Partial<Profile>) => api.updateProfile(patch),
    onSuccess: () => refresh(keys.profile, keys.plan, keys.day(todayKey()), keys.week, keys.program)
  });
}

export function useAddEntry(date = todayKey()) {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (entry: {
      slot: MealSlot; foodId?: string; quantity: number;
      nameAr?: string; nameEn?: string; unit?: string;
      calories?: number; protein?: number; carbs?: number; fat?: number;
    }) => api.addEntry(date, entry),
    onSuccess: () => refresh(keys.day(date))
  });
}

export function useRemoveEntry(date = todayKey()) {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (entryId: string) => api.removeEntry(date, entryId),
    onSuccess: () => refresh(keys.day(date))
  });
}

export function usePatchDay(date = todayKey()) {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (patch: { steps?: number; waterLitres?: number }) => api.patchDay(date, patch),
    onSuccess: () => refresh(keys.day(date))
  });
}

export function useAddWeight() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (input: { kg: number; source?: string }) => api.addWeight(input.kg, input.source),
    onSuccess: () => refresh(keys.weights, keys.profile, keys.plan, keys.day(todayKey()))
  });
}

export function useDeleteWeight() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (id: string) => api.deleteWeight(id), onSuccess: () => refresh(keys.weights) });
}

export function useAddMeasurement() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (parts: Record<string, number>) => api.addMeasurement(parts),
    onSuccess: () => refresh(keys.measurements)
  });
}

export function useDeleteMeasurement() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: string) => api.deleteMeasurement(id),
    onSuccess: () => refresh(keys.measurements)
  });
}

export function useAddPhoto() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (input: { dataUrl: string; weightKg?: number }) => api.addPhoto(input.dataUrl, input.weightKg),
    onSuccess: () => refresh(keys.photos)
  });
}

export function useDeletePhoto() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (id: string) => api.deletePhoto(id), onSuccess: () => refresh(keys.photos) });
}

export function useAddActivity() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (input: { catalogId?: string; nameAr?: string; met?: number; timesPerWeek: number }) =>
      api.addActivity(input),
    onSuccess: () => refresh(keys.activities, keys.week)
  });
}

export function useUpdateActivity() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (input: { id: string; timesPerWeek: number }) => api.updateActivity(input.id, input.timesPerWeek),
    onSuccess: () => refresh(keys.activities, keys.week)
  });
}

export function useRemoveActivity() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: string) => api.removeActivity(id),
    onSuccess: () => refresh(keys.activities, keys.week)
  });
}

export function useSetTrainingDays() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (input: { daysPerWeek?: number; toggleWeekday?: number }) => api.setTrainingDays(input),
    onSuccess: () => refresh(keys.program, keys.week)
  });
}

export function useSetDayExercises() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (input: { slot: number; exercises: { nameAr: string; nameEn: string; sets: number; reps: number }[] }) =>
      api.setDayExercises(input.slot, input.exercises),
    onSuccess: () => refresh(keys.program, keys.week)
  });
}

export function useLogSession() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (input: { activityId: string; minutes?: number; distanceKm?: number; exercises?: SessionExercise[] }) =>
      api.logSession(input),
    onSuccess: () => refresh(keys.sessions, keys.week, keys.activities, keys.day(todayKey()))
  });
}

export const useTrainees = (enabled: boolean) =>
  useQuery({ queryKey: keys.trainees, queryFn: () => api.getTrainees(), enabled });

export function useBecomeCoach() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: () => api.becomeCoach(),
    onSuccess: () => refresh(keys.profile, keys.trainees)
  });
}

export function useInviteTrainee() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (input: { email: string; name?: string }) => api.inviteTrainee(input.email, input.name),
    onSuccess: () => refresh(keys.trainees)
  });
}

export function useAssignPlan() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (input: {
      uid: string;
      plan: { dietId?: string | null; calorieOverride?: number | null; note?: string | null };
    }) => api.assignPlan(input.uid, input.plan),
    onSuccess: () => refresh(keys.trainees)
  });
}

export const useInvites = () => useQuery({ queryKey: keys.invites, queryFn: () => api.getInvites() });

export const useTraineeWeek = (uid: string) =>
  useQuery({ queryKey: [...keys.trainee(uid), "week"], queryFn: () => api.getTraineeWeek(uid) });

export const useTraineeWeights = (uid: string) =>
  useQuery({ queryKey: [...keys.trainee(uid), "weights"], queryFn: () => api.getTraineeWeights(uid) });

export const useTraineePhotos = (uid: string) =>
  useQuery({ queryKey: [...keys.trainee(uid), "photos"], queryFn: () => api.getTraineePhotos(uid) });

export const useTraineeDay = (uid: string, date: string) =>
  useQuery({ queryKey: keys.traineeDay(uid, date), queryFn: () => api.getTraineeDay(uid, date) });

export function useRevokeInvite() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (inviteId: string) => api.revokeInvite(inviteId), onSuccess: () => refresh(keys.trainees) });
}

export const useReminders = () => useQuery({ queryKey: keys.reminders, queryFn: () => api.getReminders() });

export function useSaveReminders() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (reminders: Reminders) => api.setReminders(reminders),
    onSuccess: () => refresh(keys.reminders)
  });
}

export const useTraineeProgram = (uid: string) =>
  useQuery({ queryKey: [...keys.trainee(uid), "program"], queryFn: () => api.getTraineeProgram(uid) });

export function useSetTraineeProgram(uid: string) {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (program: { trainingDays?: number[]; days?: Program["days"] }) => api.setTraineeProgram(uid, program),
    onSuccess: () => refresh(keys.trainee(uid))
  });
}

export function useAcceptInvite() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (inviteId: string) => api.acceptInvite(inviteId),
    onSuccess: () => refresh(keys.invites, keys.profile, keys.plan, keys.day(todayKey()))
  });
}

export function useDeclineInvite() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (inviteId: string) => api.declineInvite(inviteId), onSuccess: () => refresh(keys.invites) });
}

export function useLeaveCoach() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: () => api.leaveCoach(),
    onSuccess: () => refresh(keys.profile, keys.plan, keys.day(todayKey()))
  });
}

export function useRemoveTrainee() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: (uid: string) => api.removeTrainee(uid), onSuccess: () => refresh(keys.trainees) });
}

export function useScanInBody() {
  return useMutation({ mutationFn: (dataUrl: string) => api.scanInBody(dataUrl) });
}

export function useSaveScan() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (scan: { weightKg?: number | null; bodyFatPercent?: number | null; skeletalMuscleKg?: number | null }) =>
      api.saveScan(scan),
    onSuccess: () => refresh(keys.weights, keys.profile, keys.plan)
  });
}

export function useDeleteSession() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (id: string) => api.deleteSession(id),
    onSuccess: () => refresh(keys.sessions, keys.week, keys.activities)
  });
}
