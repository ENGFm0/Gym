import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card, Field, Icon, Label, Segmented, Sheet, Title } from "@/components/ui";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { api } from "@/lib/api";
import { MEAL_LABELS } from "@/lib/catalog";
import { dec, n, parseNumber } from "@/lib/format";
import { useAddEntry, useFoodSearch } from "@/lib/queries";
import { t, useUi } from "@/state/ui";
import type { Food, MealSlot } from "@/lib/types";

const SLOTS: MealSlot[] = ["breakfast", "lunch", "snack", "dinner"];

export function AddFood() {
  const { lang, say } = useUi();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [slot, setSlot] = useState<MealSlot>((params.get("slot") as MealSlot) ?? "lunch");
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState("");
  const [manual, setManual] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [custom, setCustom] = useState({ name: "", kcal: "", protein: "", carbs: "", fat: "" });

  const foods = useFoodSearch(query);
  const add = useAddEntry();

  const preview = useMemo(() => {
    if (!picked) return null;
    const amount = parseNumber(quantity);
    const factor = (Number.isFinite(amount) ? amount : picked.baseAmount) / (picked.baseAmount || 1);
    return {
      calories: picked.calories * factor,
      protein: picked.protein * factor,
      carbs: picked.carbs * factor,
      fat: picked.fat * factor
    };
  }, [picked, quantity]);

  async function confirm() {
    if (!picked) return;
    const amount = parseNumber(quantity);
    await add.mutateAsync({
      slot,
      foodId: picked.id,
      quantity: Number.isFinite(amount) && amount > 0 ? amount : picked.baseAmount
    });
    setPicked(null);
    say(t(lang, `أُضيف لـ${MEAL_LABELS[slot][0]}`, `Added to ${MEAL_LABELS[slot][1]}`));
    navigate("/meals");
  }

  async function saveCustom() {
    const kcal = parseNumber(custom.kcal);
    if (!Number.isFinite(kcal) || kcal <= 0) {
      say(t(lang, "اكتب السعرات", "Enter the calories"));
      return;
    }

    // A scanned packet becomes a saved item, so nobody types it twice.
    if (scannedCode) {
      await api.addCustomFood({
        nameAr: custom.name || t(lang, "صنف يدوي", "Custom item"),
        nameEn: custom.name || "Custom item",
        unit: t(lang, "حصة", "serving"),
        baseAmount: 1,
        calories: kcal,
        protein: parseNumber(custom.protein) || 0,
        carbs: parseNumber(custom.carbs) || 0,
        fat: parseNumber(custom.fat) || 0,
        barcode: scannedCode
      });
      setScannedCode(null);
    }

    await add.mutateAsync({
      slot,
      quantity: 1,
      nameAr: custom.name || t(lang, "صنف يدوي", "Custom item"),
      nameEn: custom.name || "Custom item",
      unit: t(lang, "حصة", "serving"),
      calories: kcal,
      protein: parseNumber(custom.protein) || 0,
      carbs: parseNumber(custom.carbs) || 0,
      fat: parseNumber(custom.fat) || 0
    });

    setManual(false);
    say(t(lang, "أُضيف", "Added"));
    navigate("/meals");
  }

  return (
    <div className="flex flex-col gap-4 pt-1 fade">
      <div>
        <div className="text-headline-md text-on-surface">{t(lang, "أضف أكل", "Add food")}</div>
        <Label>{t(lang, "ابحث، أو اكتب الصنف بنفسك", "Search, or type the item yourself")}</Label>
      </div>

      <Segmented
        value={slot}
        onChange={setSlot}
        options={SLOTS.map((value) => ({ value, label: t(lang, MEAL_LABELS[value][0], MEAL_LABELS[value][1]) }))}
      />

      <div className="flex gap-2">
        <div className="flex-1 rounded-xl bg-surface-container-high px-4 h-12 flex items-center gap-2">
          <Icon name="search" className="text-on-surface-variant" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t(lang, "دجاج، أرز، تمر…", "chicken, rice, dates…")}
            className="flex-1 bg-transparent border-0 text-body-lg text-on-surface focus:outline-none"
          />
        </div>
        <button
          onClick={() => setScanning(true)}
          aria-label={t(lang, "امسح الباركود", "Scan a barcode")}
          className="tap w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0"
        >
          <Icon name="barcode_scanner" size={20} />
        </button>
      </div>

      <div className="rounded-2xl bg-surface-container divide-y divide-outline-variant/40 overflow-hidden">
        {(foods.data ?? []).map((food) => (
          <button
            key={food.id}
            onClick={() => {
              setPicked(food);
              setQuantity(String(food.baseAmount));
            }}
            className="tap w-full flex items-center justify-between px-4 py-3 text-start"
          >
            <span className="min-w-0">
              <span className="block text-label-lg text-on-surface truncate">{t(lang, food.nameAr, food.nameEn)}</span>
              <span className="block text-label-sm text-on-surface-variant">
                {n(food.calories, lang)} {t(lang, "سعرة لكل ", "kcal per ")}
                {dec(food.baseAmount, 0, lang)} {food.unit}
              </span>
            </span>
            <Icon name="add_circle" className="text-primary-fixed shrink-0" />
          </button>
        ))}
        {foods.data?.length === 0 && (
          <div className="px-4 py-4 text-label-sm text-on-surface-variant">
            {t(lang, "ما لقينا شي بهالاسم", "Nothing matched")}
          </div>
        )}
      </div>

      <Button variant="soft" className="w-full" onClick={() => setManual(true)}>
        <Icon name="edit" />
        {t(lang, "صنف من عندك", "Custom item")}
      </Button>

      <BarcodeScanner
        open={scanning}
        onClose={() => setScanning(false)}
        onCode={async (code) => {
          setScanning(false);
          const hit = await api.findByBarcode(code);
          if (hit) {
            setPicked(hit);
            setQuantity(String(hit.baseAmount));
            return;
          }
          // Unknown packet: take it by hand once, and keep the code so the next scan finds it.
          say(t(lang, "ما لقيناه — سجّله مرة ونحفظه لك", "Not found — add it once and we keep it"));
          setScannedCode(code);
          setCustom({ ...custom, name: "" });
          setManual(true);
        }}
      />

      <Sheet open={Boolean(picked)} onClose={() => setPicked(null)}>
        {picked && (
          <>
            <Title>{t(lang, picked.nameAr, picked.nameEn)}</Title>
            <Label>{t(lang, "كم الكمية؟", "How much?")}</Label>
            <div className="mt-3">
              <Field
                label={t(lang, "الكمية", "Quantity")}
                value={quantity}
                onChange={setQuantity}
                unit={picked.unit}
              />
            </div>
            {preview && (
              <Card className="mt-3 grid grid-cols-4 gap-2 text-center">
                {([
                  [t(lang, "سعرة", "kcal"), preview.calories],
                  [t(lang, "بروتين", "protein"), preview.protein],
                  [t(lang, "كارب", "carbs"), preview.carbs],
                  [t(lang, "دهون", "fat"), preview.fat]
                ] as const).map(([label, value]) => (
                  <div key={label}>
                    <div className="text-title-md text-on-surface tabular-nums">{n(value, lang)}</div>
                    <div className="text-label-sm text-on-surface-variant">{label}</div>
                  </div>
                ))}
              </Card>
            )}
            <Button className="w-full mt-3" onClick={confirm} disabled={add.isPending}>
              {t(lang, "أضفه", "Add it")}
            </Button>
          </>
        )}
      </Sheet>

      <Sheet open={manual} onClose={() => setManual(false)}>
        <Title>{scannedCode ? t(lang, "صنف جديد من الباركود", "New item from the barcode") : t(lang, "صنف يدوي", "Custom item")}</Title>
        {scannedCode && (
          <Label>
            {t(lang, "نحفظه بالباركود عشان المرة الجاية يطلع لك مباشرة", "We keep it against the barcode for next time")}
          </Label>
        )}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="col-span-2">
            <Field
              label={t(lang, "الاسم", "Name")}
              value={custom.name}
              onChange={(value) => setCustom({ ...custom, name: value })}
              inputMode="text"
            />
          </div>
          <Field
            label={t(lang, "السعرات", "Calories")}
            value={custom.kcal}
            onChange={(value) => setCustom({ ...custom, kcal: value })}
          />
          <Field
            label={t(lang, "بروتين", "Protein")}
            value={custom.protein}
            onChange={(value) => setCustom({ ...custom, protein: value })}
          />
          <Field
            label={t(lang, "كارب", "Carbs")}
            value={custom.carbs}
            onChange={(value) => setCustom({ ...custom, carbs: value })}
          />
          <Field
            label={t(lang, "دهون", "Fat")}
            value={custom.fat}
            onChange={(value) => setCustom({ ...custom, fat: value })}
          />
        </div>
        <Button className="w-full mt-3" onClick={saveCustom}>
          {t(lang, "أضف", "Add")}
        </Button>
      </Sheet>
    </div>
  );
}
