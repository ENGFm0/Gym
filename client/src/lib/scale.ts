/**
 * Reading a smart scale over Bluetooth.
 *
 * Scales in the XG / Xiaomi family speak the Bluetooth SIG profiles: Weight Scale (0x181D,
 * measurement 0x2A9D) and Body Composition (0x181B, measurement 0x2A9C). Both pack a flags
 * word first, then the weight, then optional fields in a fixed order — which is what makes
 * a generic reader possible instead of one driver per brand.
 *
 * Web Bluetooth is Chrome, Edge and Android. iOS Safari has none, so the UI keeps the
 * manual field and says so rather than pretending.
 */

const WEIGHT_SCALE_SERVICE = 0x181d;
const WEIGHT_MEASUREMENT = 0x2a9d;
const BODY_COMPOSITION_SERVICE = 0x181b;
const BODY_COMPOSITION_MEASUREMENT = 0x2a9c;

export interface ScaleReading {
  kg: number;
  bodyFatPercent?: number;
  muscleKg?: number;
  waterPercent?: number;
  boneKg?: number;
  bmi?: number;
  takenAt: Date;
}

export const bluetoothSupported = () =>
  typeof navigator !== "undefined" && "bluetooth" in navigator;

/** Weight Measurement, 0x2A9D. Bit 0 of the flags picks the unit. */
export function parseWeightMeasurement(view: DataView): ScaleReading | null {
  if (view.byteLength < 3) return null;

  const flags = view.getUint8(0);
  const imperial = (flags & 0x01) !== 0;
  const raw = view.getUint16(1, true);

  // SI: 5 g per unit. Imperial: 0.01 lb per unit.
  const kg = imperial ? raw * 0.01 * 0.45359237 : raw * 0.005;
  if (!Number.isFinite(kg) || kg <= 0 || kg > 400) return null;

  let offset = 3;
  if (flags & 0x02) offset += 7; // time stamp
  if (flags & 0x04) offset += 1; // user id

  let bmi: number | undefined;
  if (flags & 0x08 && view.byteLength >= offset + 2) {
    bmi = view.getUint16(offset, true) * 0.1;
  }

  return { kg: Math.round(kg * 10) / 10, bmi, takenAt: new Date() };
}

/**
 * Body Composition Measurement, 0x2A9C: a 16-bit flags word, then body fat, then the
 * optional fields in the order the spec fixes. Each present bit shifts everything after it,
 * so the offset is walked rather than assumed.
 */
export function parseBodyComposition(view: DataView): ScaleReading | null {
  if (view.byteLength < 4) return null;

  const flags = view.getUint16(0, true);
  const imperial = (flags & 0x0001) !== 0;
  const massUnit = imperial ? 0.01 * 0.45359237 : 0.005;

  let offset = 2;
  const fatRaw = view.getUint16(offset, true);
  offset += 2;
  const bodyFatPercent = fatRaw === 0xffff ? undefined : Math.round(fatRaw * 0.1 * 10) / 10;

  if (flags & 0x0002) offset += 7; // time stamp
  if (flags & 0x0004) offset += 1; // user id

  const read = (present: number, scale: number) => {
    if (!(flags & present) || view.byteLength < offset + 2) return undefined;
    const value = view.getUint16(offset, true);
    offset += 2;
    return value === 0xffff ? undefined : Math.round(value * scale * 10) / 10;
  };

  const basalMetabolism = read(0x0008, 1);
  const musclePercent = read(0x0010, 0.1);
  const muscleKg = read(0x0020, massUnit);
  const fatFreeKg = read(0x0040, massUnit);
  const softLeanKg = read(0x0080, massUnit);
  const bodyWaterKg = read(0x0100, massUnit);
  const boneKg = read(0x0200, massUnit);
  const kg = read(0x0400, massUnit);
  const heightRaw = read(0x0800, 1);

  void basalMetabolism;
  void fatFreeKg;
  void softLeanKg;
  void heightRaw;

  if (kg === undefined || kg <= 0 || kg > 400) return null;

  return {
    kg,
    bodyFatPercent,
    muscleKg: muscleKg ?? (musclePercent ? Math.round(kg * musclePercent) / 100 : undefined),
    waterPercent: bodyWaterKg ? Math.round((bodyWaterKg / kg) * 1000) / 10 : undefined,
    boneKg,
    takenAt: new Date()
  };
}

/**
 * Asks the browser for a scale, then waits for the first stable reading.
 * The device picker is a user gesture the browser owns — there is no scanning behind the scenes.
 */
export async function readFromScale(
  onProgress?: (kg: number) => void,
  timeoutMs = 60_000
): Promise<ScaleReading> {
  if (!bluetoothSupported()) throw new Error("unsupported");

  const bluetooth = (navigator as Navigator & { bluetooth: any }).bluetooth;

  const device = await bluetooth.requestDevice({
    filters: [{ services: [WEIGHT_SCALE_SERVICE] }, { services: [BODY_COMPOSITION_SERVICE] }],
    optionalServices: [WEIGHT_SCALE_SERVICE, BODY_COMPOSITION_SERVICE]
  });

  const server = await device.gatt.connect();

  const characteristics: { characteristic: any; parse: (view: DataView) => ScaleReading | null }[] = [];

  for (const [service, measurement, parse] of [
    [BODY_COMPOSITION_SERVICE, BODY_COMPOSITION_MEASUREMENT, parseBodyComposition],
    [WEIGHT_SCALE_SERVICE, WEIGHT_MEASUREMENT, parseWeightMeasurement]
  ] as const) {
    try {
      const gattService = await server.getPrimaryService(service);
      const characteristic = await gattService.getCharacteristic(measurement);
      characteristics.push({ characteristic, parse });
    } catch {
      // A scale that only implements one of the two profiles is normal.
    }
  }

  if (characteristics.length === 0) {
    server.disconnect();
    throw new Error("no-service");
  }

  return new Promise<ScaleReading>((resolve, reject) => {
    let settled = false;

    const finish = (reading: ScaleReading | null, error?: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      characteristics.forEach(({ characteristic }) => {
        characteristic.removeEventListener("characteristicvaluechanged", handle);
        characteristic.stopNotifications?.().catch(() => {});
      });
      server.disconnect();
      if (reading) resolve(reading);
      else reject(error ?? new Error("timeout"));
    };

    function handle(event: Event) {
      const view = (event.target as unknown as { value: DataView }).value;
      const entry = characteristics.find(({ characteristic }) => characteristic === event.target);
      const reading = entry?.parse(view) ?? null;
      if (!reading) return;

      onProgress?.(reading.kg);
      // A scale streams while you settle; the reading with composition is the final one.
      if (reading.bodyFatPercent !== undefined || characteristics.length === 1) finish(reading);
    }

    const timer = window.setTimeout(() => finish(null), timeoutMs);

    Promise.all(
      characteristics.map(async ({ characteristic }) => {
        characteristic.addEventListener("characteristicvaluechanged", handle);
        await characteristic.startNotifications();
      })
    ).catch((error) => finish(null, error instanceof Error ? error : new Error("notify")));

    device.addEventListener?.("gattserverdisconnected", () => finish(null, new Error("disconnected")));
  });
}
