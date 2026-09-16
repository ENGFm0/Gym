/**
 * Firebase Auth is the identity; the API validates the ID token it issues.
 * With no Firebase config present the app runs in demo mode against localStorage.
 */
import { initializeApp, type FirebaseApp } from "firebase/app";
import {
  createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  signOut, updateProfile, type Auth, type User
} from "firebase/auth";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isConfigured = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

if (isConfigured) {
  app = initializeApp(config as Record<string, string>);
  auth = getAuth(app);
}

export const firebaseAuth = () => auth;

export async function idToken(): Promise<string | null> {
  const user = auth?.currentUser;
  return user ? user.getIdToken() : null;
}

export function watchUser(handler: (user: User | null) => void) {
  if (!auth) {
    handler(null);
    return () => {};
  }
  return onAuthStateChanged(auth, handler);
}

export async function signIn(email: string, password: string) {
  if (!auth) throw new Error("demo");
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signUp(email: string, password: string, name: string) {
  if (!auth) throw new Error("demo");
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(credential.user, { displayName: name });
}

export async function leave() {
  if (auth) await signOut(auth);
}
