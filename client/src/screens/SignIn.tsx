import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button, Field, Icon } from "@/components/ui";
import { signIn, signUp } from "@/lib/firebase";
import { t, useUi } from "@/state/ui";

export function SignIn() {
  const { lang, toggleLang, say } = useUi();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!email || password.length < 6) {
      say(t(lang, "اكتب بريدك وكلمة مرور ٦ أحرف على الأقل", "Enter your email and a password of at least 6 characters"));
      return;
    }

    setBusy(true);
    try {
      if (mode === "in") await signIn(email, password);
      else await signUp(email, password, name);
    } catch (error) {
      say(error instanceof Error ? error.message : t(lang, "ما ضبطت، جرّب مرة ثانية", "That did not work"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="p-gutter flex justify-end">
        <button
          onClick={toggleLang}
          className="tap h-10 px-3 rounded-xl bg-surface-container text-on-surface text-label-lg flex items-center gap-1.5"
        >
          <Icon name="language" size={16} />
          {lang === "ar" ? "EN" : "ع"}
        </button>
      </div>

      <div className="flex-1 max-w-md w-full mx-auto px-gutter flex flex-col justify-center gap-6 pb-16">
        <div className="flex flex-col items-center gap-3">
          <Logo height={40} />
          <p className="text-label-lg text-on-surface-variant text-center">
            {t(lang, "دايتك وتمارينك في مكان واحد", "Your diet and your training, in one place")}
          </p>
        </div>

        <div className="rounded-xl bg-surface-container-low p-1 flex gap-1">
          {(["in", "up"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`tap flex-1 h-10 rounded-lg text-label-lg ${
                mode === value ? "bg-primary-fixed text-on-primary-fixed" : "text-on-surface-variant"
              }`}
            >
              {value === "in" ? t(lang, "تسجيل الدخول", "Sign in") : t(lang, "حساب جديد", "Create account")}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {mode === "up" && (
            <Field label={t(lang, "اسمك", "Your name")} value={name} onChange={setName} inputMode="text" />
          )}
          <Field label={t(lang, "البريد", "Email")} value={email} onChange={setEmail} inputMode="email" type="email" />
          <Field
            label={t(lang, "كلمة المرور", "Password")}
            value={password}
            onChange={setPassword}
            inputMode="text"
            type="password"
          />
        </div>

        <Button onClick={submit} disabled={busy} className="w-full">
          {mode === "in" ? t(lang, "ادخل", "Sign in") : t(lang, "أنشئ حسابك", "Create account")}
        </Button>

        <p className="text-label-sm text-on-surface-variant text-center">
          {t(
            lang,
            "بياناتك لك وحدك — ما تُشارك إلا مع مدرّبك إذا ربطته بحسابك.",
            "Your data is yours; it reaches a coach only if you link one."
          )}
        </p>
      </div>
    </div>
  );
}
