import { useEffect, useState } from "react";
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import type { User } from "firebase/auth";
import { Shell } from "./components/Shell";
import { isConfigured, watchUser } from "./lib/firebase";
import { listenForNotificationTaps } from "./lib/push";
import { useProfile } from "./lib/queries";
import { SignIn } from "./screens/SignIn";
import { Onboarding } from "./screens/Onboarding";
import { Home } from "./screens/Home";
import { Meals } from "./screens/Meals";
import { AddFood } from "./screens/AddFood";
import { DietScreen } from "./screens/Diet";
import { Training } from "./screens/Training";
import { Session } from "./screens/Session";
import { Progress } from "./screens/Progress";
import { ProfileScreen } from "./screens/Profile";
import { Coach } from "./screens/Coach";
import { Trainee } from "./screens/Trainee";

/** Static hosting without a rewrite rule cannot serve deep links; there the hash router is the honest choice. */
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter;

/** A tapped notification names the screen it belongs to. */
function NotificationRouting() {
  const navigate = useNavigate();
  useEffect(() => listenForNotificationTaps((route) => navigate(route)), [navigate]);
  return null;
}

function Splash() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-outline-variant border-t-primary-fixed animate-spin" />
    </div>
  );
}

/** Nobody reaches the app before their body data is in — the plan depends on it. */
function Gate({ children }: { children: React.ReactNode }) {
  const profile = useProfile();
  if (profile.isLoading) return <Splash />;
  if (profile.data && (!profile.data.heightCm || !profile.data.weightKg)) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!isConfigured);

  useEffect(() => {
    if (!isConfigured) return;
    return watchUser((next) => {
      setUser(next);
      setReady(true);
    });
  }, []);

  if (!ready) return <Splash />;

  const signedIn = !isConfigured || Boolean(user);

  return (
    <Router>
      <NotificationRouting />
      <Routes>
        <Route path="/signin" element={signedIn ? <Navigate to="/" replace /> : <SignIn />} />
        <Route path="/welcome" element={signedIn ? <Onboarding /> : <Navigate to="/signin" replace />} />

        <Route
          element={
            signedIn ? (
              <Gate>
                <Shell />
              </Gate>
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/meals/add" element={<AddFood />} />
          <Route path="/diet" element={<DietScreen />} />
          <Route path="/training" element={<Training />} />
          <Route path="/training/session/:slot" element={<Session />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/coach/:uid" element={<Trainee />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
