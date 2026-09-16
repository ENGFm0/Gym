import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "./Logo";
import { Icon, cx } from "./ui";
import { t, useUi } from "@/state/ui";
import { isOffline } from "@/lib/api";

const TABS = [
  { to: "/", icon: "home", ar: "الرئيسية", en: "Home" },
  { to: "/meals", icon: "menu_book", ar: "الوجبات", en: "Meals" },
  { to: "/training", icon: "fitness_center", ar: "التمارين", en: "Training" },
  { to: "/progress", icon: "monitoring", ar: "التقدّم", en: "Progress" }
];

export function Shell() {
  const { lang, theme, toggleLang, toggleTheme, toast } = useUi();
  const navigate = useNavigate();
  const location = useLocation();
  const atRoot = location.pathname === "/";

  return (
    <div className="min-h-screen bg-surface">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface-container-lowest/95 backdrop-blur-xl border-b border-outline-variant/40">
        <div className="max-w-3xl mx-auto px-gutter h-16 flex items-center gap-2">
          {!atRoot && (
            <button
              onClick={() => navigate(-1)}
              aria-label={t(lang, "رجوع", "Back")}
              className="tap w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface"
            >
              <Icon name="chevron_right" className="rtl:rotate-0 rotate-180" />
            </button>
          )}

          <div className="flex-1 flex items-center">
            <Logo />
          </div>

          <button
            onClick={toggleLang}
            className="tap h-10 px-3 rounded-xl bg-surface-container text-on-surface text-label-lg flex items-center gap-1.5"
          >
            <Icon name="language" size={16} />
            {lang === "ar" ? "EN" : "ع"}
          </button>

          <button
            onClick={toggleTheme}
            aria-label={t(lang, "الوضع", "Theme")}
            className="tap w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface"
          >
            <Icon name={theme === "dark" ? "light_mode" : "dark_mode"} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-gutter pt-20 pb-32 min-h-screen">
        <Outlet />
      </main>

      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-xl bg-primary-container text-on-primary-container text-label-lg shadow-lg">
          {toast}
        </div>
      )}

      <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/40">
        <div className="max-w-3xl mx-auto px-2 h-20 flex items-center justify-around">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === "/"}
              className={({ isActive }) =>
                cx(
                  "tap flex flex-col items-center gap-1 w-20 py-2 rounded-xl",
                  isActive ? "text-primary-fixed" : "text-on-surface-variant"
                )
              }
            >
              <Icon name={tab.icon} size={22} />
              <span className="text-label-sm">{t(lang, tab.ar, tab.en)}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {isOffline && (
        <div className="fixed top-16 inset-x-0 z-40 pointer-events-none flex justify-center">
          <span className="mt-1 px-2 py-0.5 rounded-lg bg-tertiary-container text-on-tertiary-container text-label-sm">
            {t(lang, "وضع تجربة — البيانات محفوظة بجهازك", "Demo mode — data stays on this device")}
          </span>
        </div>
      )}
    </div>
  );
}
