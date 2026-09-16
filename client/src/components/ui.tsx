import type { ReactNode } from "react";

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

export function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  return (
    <span className={cx("material-symbols-outlined", className)} style={{ fontSize: size }} aria-hidden>
      {name}
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-2xl bg-surface-container p-4", className)}>{children}</div>;
}

export function Label({ children }: { children: ReactNode }) {
  return <div className="text-label-sm text-on-surface-variant">{children}</div>;
}

export function Title({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("text-title-md text-on-surface", className)}>{children}</div>;
}

export function Button({
  children, onClick, variant = "primary", className, type = "button", disabled
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "soft" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const skin =
    variant === "primary" ? "bg-primary-fixed text-on-primary-fixed"
    : variant === "soft" ? "bg-surface-container-high text-on-surface"
    : "text-primary-fixed";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "tap h-12 px-4 rounded-xl text-label-lg flex items-center justify-center gap-2 disabled:opacity-50",
        skin,
        className
      )}
    >
      {children}
    </button>
  );
}

export function Segmented<T extends string | number>({
  options, value, onChange, className
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cx("rounded-xl bg-surface-container-low p-1 flex gap-1", className)}>
      {options.map((option) => (
        <button
          key={String(option.value)}
          onClick={() => onChange(option.value)}
          className={cx(
            "tap flex-1 h-10 rounded-lg text-label-lg",
            option.value === value ? "bg-primary-fixed text-on-primary-fixed" : "text-on-surface-variant"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Bar({ value, max, tone = "primary-fixed" }: { value: number; max: number; tone?: string }) {
  const width = Math.max(0, Math.min(100, (value / (max || 1)) * 100));
  return (
    <div className="h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${width}%`, background: `rgb(var(--c-${tone}))` }} />
    </div>
  );
}

export function Ring({ progress, center, caption }: { progress: number; center: ReactNode; caption: ReactNode }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * Math.max(0, Math.min(1, progress || 0));

  return (
    <div className="relative w-32 h-32 shrink-0">
      <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="rgb(var(--c-surface-container-highest))" strokeWidth="10" />
        {filled > 1 && (
          <circle
            cx="60" cy="60" r={radius} fill="none"
            stroke="rgb(var(--c-primary-fixed))" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${filled.toFixed(1)} ${circumference.toFixed(1)}`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-metric text-on-surface tabular-nums leading-none">{center}</div>
        <div className="text-label-sm text-on-surface-variant mt-1">{caption}</div>
      </div>
    </div>
  );
}

/** A bottom sheet: the app's one place for a focused decision. */
export function Sheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl mx-auto rounded-t-3xl bg-surface-container-low p-4 pb-8 fade">
        <div className="w-10 h-1 rounded-full bg-outline-variant mx-auto mb-4" />
        {children}
      </div>
    </div>
  );
}

export function Field({
  label, value, onChange, unit, inputMode = "decimal", type = "text", placeholder, id
}: {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  unit?: ReactNode;
  inputMode?: "decimal" | "numeric" | "text" | "email" | "tel";
  type?: string;
  placeholder?: string;
  id?: string;
}) {
  return (
    <label className="rounded-xl bg-surface-container-high p-3 flex flex-col gap-1">
      <span className="text-label-sm text-on-surface-variant">{label}</span>
      <span className="flex items-baseline gap-2">
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent border-0 p-0 text-title-md text-on-surface focus:outline-none tabular-nums"
        />
        {unit && <span className="text-label-sm text-on-surface-variant shrink-0">{unit}</span>}
      </span>
    </label>
  );
}

export function Stepper({ value, onChange, min = 1, max = 14 }: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-center gap-6">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="tap w-11 h-11 rounded-xl bg-surface-container text-on-surface text-title-md"
      >
        −
      </button>
      <span className="text-metric text-on-surface tabular-nums w-14 text-center">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="tap w-11 h-11 rounded-xl bg-primary-fixed text-on-primary-fixed text-title-md"
      >
        +
      </button>
    </div>
  );
}

export function Empty({ title, hint }: { title: ReactNode; hint?: ReactNode }) {
  return (
    <Card>
      <div className="text-center py-2">
        <div className="text-label-lg text-on-surface">{title}</div>
        {hint && <div className="text-label-sm text-on-surface-variant mt-1">{hint}</div>}
      </div>
    </Card>
  );
}
