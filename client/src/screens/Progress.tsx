import { useRef, useState } from "react";
import { Button, Card, Field, Icon, Label, Segmented, Title, cx } from "@/components/ui";
import { BODY_PARTS } from "@/lib/catalog";
import { dec, lengthLabel, massLabel, parseNumber, raw, shortDate, showLength, showMass, toCm, toKg } from "@/lib/format";
import {
  useAddMeasurement, useAddPhoto, useAddWeight, useDeleteMeasurement, useDeletePhoto,
  useDeleteWeight, useMeasurements, usePhotos, useProfile, useWeights
} from "@/lib/queries";
import { t, useUi } from "@/state/ui";

type Tab = "weight" | "size" | "photos";

export function Progress() {
  const { lang } = useUi();
  const [tab, setTab] = useState<Tab>("weight");

  return (
    <div className="flex flex-col gap-4 pt-1 fade">
      <div>
        <div className="text-headline-md text-on-surface">{t(lang, "التقدّم", "Progress")}</div>
        <Label>
          {t(lang, "وزنك ومقاساتك وصورك — تحدّثها بنفسك", "Weight, measurements and photos — all yours to update")}
        </Label>
      </div>

      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "weight", label: t(lang, "الوزن", "Weight") },
          { value: "size", label: t(lang, "المقاسات", "Measurements") },
          { value: "photos", label: t(lang, "الصور", "Photos") }
        ]}
      />

      {tab === "weight" && <WeightTab />}
      {tab === "size" && <SizeTab />}
      {tab === "photos" && <PhotoTab />}
    </div>
  );
}

/* ------------------------------ weight ----------------------------- */

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const width = 300;
  const height = 60;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values.map((value, index) => [
    (index * (width - 8)) / (values.length - 1) + 4,
    height - 6 - ((value - min) / span) * (height - 14)
  ]);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }} aria-hidden>
      <polyline
        points={points.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke="rgb(var(--c-primary-fixed))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r="3.5" fill="rgb(var(--c-primary-fixed))" />
    </svg>
  );
}

function WeightTab() {
  const { lang, say } = useUi();
  const profile = useProfile();
  const weights = useWeights();
  const add = useAddWeight();
  const remove = useDeleteWeight();
  const [draft, setDraft] = useState("");

  const units = profile.data?.units ?? { mass: "kg" as const, length: "cm" as const };
  const rows = weights.data ?? [];
  const current = rows[0];
  const previous = rows[1];

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <Label>{t(lang, "وزنك الحالي", "Current weight")}</Label>
          <div className="flex items-baseline gap-2">
            <span className="text-metric text-on-surface tabular-nums">
              {current ? dec(showMass(current.kg, units), 1, lang) : "—"}
            </span>
            <span className="text-label-lg text-on-surface-variant">{massLabel(units, lang)}</span>
          </div>
          {previous && (
            <div className="text-label-sm text-on-surface-variant mt-1">
              {t(lang, "السابق: ", "Previous: ")}
              {dec(showMass(previous.kg, units), 1, lang)} {massLabel(units, lang)} · {shortDate(previous.atUtc, lang)}
            </div>
          )}
        </div>

        {current?.delta != null && (
          <div
            className={cx(
              "px-3 py-1.5 rounded-lg text-label-lg tabular-nums",
              current.delta <= 0 ? "bg-primary-fixed/15 text-primary-fixed" : "bg-tertiary-container text-on-tertiary-container"
            )}
          >
            {dec(Math.abs(showMass(current.delta, units)), 1, lang)}
            {current.delta <= 0 ? "−" : "+"} {massLabel(units, lang)}
          </div>
        )}
      </div>

      <div className="flex items-end gap-2 mt-4">
        <div className="flex-1">
          <Field
            label={t(lang, "القراءة الجديدة", "New reading")}
            value={draft}
            onChange={setDraft}
            unit={massLabel(units, lang)}
            placeholder={current ? raw(showMass(current.kg, units), 1) : ""}
          />
        </div>
        <Button
          onClick={async () => {
            const value = parseNumber(draft);
            if (!Number.isFinite(value) || value <= 0) {
              say(t(lang, "اكتب وزناً صحيحاً", "Enter a weight"));
              return;
            }
            await add.mutateAsync({ kg: Math.round(toKg(value, units) * 10) / 10 });
            setDraft("");
            say(t(lang, "تحدّث وزنك — والقديم محفوظ", "Weight updated — the previous one is kept"));
          }}
        >
          {t(lang, "حدّث", "Update")}
        </Button>
      </div>

      {rows.length > 1 && (
        <div className="mt-4">
          <Sparkline values={[...rows].reverse().map((row) => row.kg)} />
        </div>
      )}

      {rows.length === 0 ? (
        <div className="mt-3 text-label-sm text-on-surface-variant">
          {t(lang, "ما سجّلت وزن بعد — أول قراءة تبدأ المنحنى.", "No readings yet — your first one starts the chart.")}
        </div>
      ) : (
        <div className="mt-3 divide-y divide-outline-variant/40">
          {rows.slice(0, 8).map((row) => (
            <div key={row.id} className="flex items-center justify-between py-2.5">
              <span className="text-label-lg text-on-surface-variant">{shortDate(row.atUtc, lang)}</span>
              <div className="flex items-center gap-3">
                <span className="text-label-lg text-on-surface tabular-nums">
                  {dec(showMass(row.kg, units), 1, lang)} {massLabel(units, lang)}
                </span>
                <span className={cx("w-14 text-start text-label-sm tabular-nums", (row.delta ?? 0) <= 0 ? "text-primary-fixed" : "text-on-surface-variant")}>
                  {row.delta != null ? `${dec(Math.abs(showMass(row.delta, units)), 1, lang)}${row.delta <= 0 ? "−" : "+"}` : ""}
                </span>
                <button
                  onClick={() => remove.mutate(row.id)}
                  className="tap w-8 h-8 rounded-lg text-on-surface-variant flex items-center justify-center"
                >
                  <Icon name="close" size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* --------------------------- measurements -------------------------- */

function SizeTab() {
  const { lang, say } = useUi();
  const profile = useProfile();
  const measurements = useMeasurements();
  const add = useAddMeasurement();
  const remove = useDeleteMeasurement();
  const [draft, setDraft] = useState<Record<string, string>>({});

  const units = profile.data?.units ?? { mass: "kg" as const, length: "cm" as const };
  const rows = measurements.data ?? [];
  const latest = rows[0];

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <Title>{t(lang, "مقاسات اليوم", "Today's measurements")}</Title>
        <Label>{lengthLabel(units, lang)}</Label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {BODY_PARTS.map(([key, ar, en]) => {
          const stored = latest?.parts[key];
          const delta = latest?.deltas[key];
          return (
            <div key={key} className="rounded-xl bg-surface-container-high p-3">
              <div className="flex items-center justify-between">
                <span className="text-label-sm text-on-surface-variant">{t(lang, ar, en)}</span>
                {delta ? (
                  <span className={cx("text-label-sm tabular-nums", delta < 0 ? "text-primary-fixed" : "text-on-surface-variant")}>
                    {dec(Math.abs(showLength(delta, units)), 1, lang)}
                    {delta < 0 ? "−" : "+"}
                  </span>
                ) : null}
              </div>
              <input
                value={draft[key] ?? (stored != null ? raw(showLength(stored, units), 1) : "")}
                onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                inputMode="decimal"
                placeholder="—"
                className="w-full bg-transparent border-0 p-0 mt-1 text-title-md text-on-surface focus:outline-none tabular-nums"
              />
            </div>
          );
        })}
      </div>

      <Button
        className="w-full mt-3"
        onClick={async () => {
          const parts: Record<string, number> = {};
          BODY_PARTS.forEach(([key]) => {
            const typed = draft[key] ?? (latest?.parts[key] != null ? raw(showLength(latest.parts[key], units), 1) : "");
            const value = parseNumber(typed);
            if (Number.isFinite(value) && value > 0) parts[key] = Math.round(toCm(value, units) * 10) / 10;
          });

          if (Object.keys(parts).length === 0) {
            say(t(lang, "ما فيه أرقام", "Nothing to save"));
            return;
          }

          await add.mutateAsync(parts);
          setDraft({});
          say(t(lang, "انحفظت مقاساتك — والقديمة باقية", "Measurements saved — the old ones stay"));
        }}
      >
        {t(lang, "احفظ المقاسات", "Save measurements")}
      </Button>

      {rows.length > 0 && (
        <div className="mt-4 pt-3 border-t border-outline-variant/40">
          <Label>{t(lang, "السجل — كل قراءة محفوظة", "History — every reading is kept")}</Label>
          <div className="mt-1 divide-y divide-outline-variant/40">
            {rows.slice(0, 8).map((row) => (
              <div key={row.id} className="py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-label-lg text-on-surface">{shortDate(row.atUtc, lang)}</span>
                  <button
                    onClick={() => remove.mutate(row.id)}
                    className="tap w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center"
                  >
                    <Icon name="close" size={15} />
                  </button>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  {BODY_PARTS.filter(([key]) => row.parts[key] != null).map(([key, ar, en]) => {
                    const delta = row.deltas[key];
                    return (
                      <span key={key} className="text-label-sm text-on-surface-variant">
                        {t(lang, ar, en)}{" "}
                        <span className="text-on-surface tabular-nums">{dec(showLength(row.parts[key], units), 1, lang)}</span>
                        {delta ? (
                          <span className={cx("tabular-nums", delta < 0 ? "text-primary-fixed" : "text-tertiary-fixed-dim")}>
                            {" "}
                            {dec(Math.abs(showLength(delta, units)), 1, lang)}
                            {delta < 0 ? "−" : "+"}
                          </span>
                        ) : null}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------ photos ----------------------------- */

function PhotoTab() {
  const { lang, say } = useUi();
  const photos = usePhotos();
  const add = useAddPhoto();
  const remove = useDeletePhoto();
  const input = useRef<HTMLInputElement>(null);
  const rows = photos.data ?? [];

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <Title>{t(lang, "صور التقدّم", "Progress photos")}</Title>
        <Label>{rows.length}</Label>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async () => {
            await add.mutateAsync({ dataUrl: String(reader.result) });
            say(t(lang, "انضافت الصورة", "Photo added"));
          };
          reader.readAsDataURL(file);
          event.target.value = "";
        }}
      />

      <Button className="w-full" onClick={() => input.current?.click()}>
        <Icon name="photo_camera" size={20} />
        {t(lang, "أضف صورة", "Add a photo")}
      </Button>

      {rows.length === 0 ? (
        <div className="mt-3 text-label-sm text-on-surface-variant">
          {t(
            lang,
            "نفس الوضعية ونفس الإضاءة مرة بالأسبوع — هنا يبان التغيير.",
            "Same pose, same light, once a week — that is where the change shows."
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {rows.map((photo) => (
            <div key={photo.id} className="relative rounded-xl overflow-hidden bg-surface-container-high aspect-[3/4]">
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-label-sm text-white">
                {shortDate(photo.atUtc, lang)}
              </div>
              <button
                onClick={() => remove.mutate(photo.id)}
                className="tap absolute top-1 end-1 w-7 h-7 rounded-lg bg-black/55 text-white flex items-center justify-center"
              >
                <Icon name="close" size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
