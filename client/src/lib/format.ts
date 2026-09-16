import type { Lang, Units } from "./types";

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

const toArabic = (value: string) =>
  value.replace(/[0-9]/g, (d) => AR_DIGITS[Number(d)]).replace(".", "٫").replace(/,/g, "٬");

/** Whole numbers in the reader's own digits. */
export function n(value: number, lang: Lang) {
  const text = String(Math.round(value || 0));
  return lang === "en" ? text : toArabic(text);
}

/** Thousands grouped, still in the reader's digits. */
export function group(value: number, lang: Lang) {
  const text = Math.round(value || 0).toLocaleString("en-US");
  return lang === "en" ? text : toArabic(text);
}

export function dec(value: number, places = 1, lang: Lang = "ar") {
  const factor = 10 ** places;
  const text = String(Math.round((value || 0) * factor) / factor);
  return lang === "en" ? text : toArabic(text);
}

/** Latin digits, for anything the reader is about to type over. */
export const raw = (value: number, places = 1) => {
  const factor = 10 ** places;
  return String(Math.round((value || 0) * factor) / factor);
};

export function clock(ms: number, lang: Lang) {
  const total = Math.max(0, Math.round(ms / 1000));
  const text = `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
  return lang === "en" ? text : toArabic(text);
}

/** Accepts Arabic-Indic digits too, since the keyboard may be Arabic. */
export function parseNumber(value: string): number {
  const latin = value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[٫٬]/g, ".")
    .replace(/[^0-9.]/g, "");
  return Number.parseFloat(latin);
}

export const KG_PER_LB = 0.45359237;
export const CM_PER_INCH = 2.54;

export const showMass = (kg: number, units: Units) => (units.mass === "lb" ? kg / KG_PER_LB : kg);
export const toKg = (value: number, units: Units) => (units.mass === "lb" ? value * KG_PER_LB : value);
export const showLength = (cm: number, units: Units) => (units.length === "in" ? cm / CM_PER_INCH : cm);
export const toCm = (value: number, units: Units) => (units.length === "in" ? value * CM_PER_INCH : value);

export const massLabel = (units: Units, lang: Lang) =>
  units.mass === "lb" ? (lang === "en" ? "lb" : "رطل") : lang === "en" ? "kg" : "كجم";

export const lengthLabel = (units: Units, lang: Lang) =>
  units.length === "in" ? (lang === "en" ? "in" : "إنش") : lang === "en" ? "cm" : "سم";

export function shortDate(iso: string, lang: Lang) {
  const d = new Date(iso);
  const text = `${d.getDate()}/${d.getMonth() + 1}`;
  return lang === "en" ? text : toArabic(text);
}
