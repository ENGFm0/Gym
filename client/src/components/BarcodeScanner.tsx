import { useEffect, useRef, useState } from "react";
import { Button, Icon, Label, Sheet, Title } from "./ui";
import { t, useUi } from "@/state/ui";

/** Chrome and Android expose this; Safari does not yet, hence the manual fallback below. */
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (options?: { formats: string[] }) => BarcodeDetectorLike;

const FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"];

export const barcodeSupported = () => "BarcodeDetector" in window;

/**
 * Points the camera at a package and reads its barcode. Nothing leaves the device here —
 * the code alone is what the app looks up.
 */
export function BarcodeScanner({
  open,
  onClose,
  onCode
}: {
  open: boolean;
  onClose: () => void;
  onCode: (code: string) => void;
}) {
  const { lang } = useUi();
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");

  useEffect(() => {
    if (!open) return;

    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false
        });
        if (stopped) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        if (video.current) {
          video.current.srcObject = stream;
          await video.current.play();
        }
      } catch {
        setError(t(lang, "ما قدرنا نفتح الكاميرا", "The camera could not be opened"));
        return;
      }

      const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
      if (!Detector) {
        setError(t(lang, "متصفحك ما يقرأ الباركود — اكتب الرقم", "This browser cannot read barcodes — type the number"));
        return;
      }

      const detector = new Detector({ formats: FORMATS });

      const tick = async () => {
        if (stopped || !video.current || video.current.readyState < 2) {
          raf = requestAnimationFrame(tick);
          return;
        }
        try {
          const codes = await detector.detect(video.current);
          if (codes.length > 0) {
            navigator.vibrate?.(60);
            onCode(codes[0].rawValue);
            return;
          }
        } catch {
          // A frame that cannot be decoded is normal; keep looking.
        }
        raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);
    }

    start();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [open, lang, onCode]);

  return (
    <Sheet open={open} onClose={onClose}>
      <Title>{t(lang, "امسح الباركود", "Scan the barcode")}</Title>
      <Label>{t(lang, "وجّه الكاميرا على باركود العبوة", "Point the camera at the package barcode")}</Label>

      <div className="relative mt-3 rounded-2xl overflow-hidden bg-surface-container-highest aspect-[4/3]">
        <video ref={video} playsInline muted className="w-full h-full object-cover" />
        <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-24 rounded-xl border-2 border-primary-fixed/80" />
        {error && (
          <div className="absolute inset-0 bg-surface/90 flex items-center justify-center p-4 text-center">
            <span className="text-label-lg text-on-surface">{error}</span>
          </div>
        )}
      </div>

      <div className="flex items-end gap-2 mt-3">
        <label className="flex-1 rounded-xl bg-surface-container-high p-3 flex flex-col gap-1">
          <span className="text-label-sm text-on-surface-variant">{t(lang, "أو اكتب الرقم", "Or type the number")}</span>
          <input
            value={manual}
            onChange={(event) => setManual(event.target.value)}
            inputMode="numeric"
            placeholder="6281000..."
            className="w-full bg-transparent border-0 p-0 text-title-md text-on-surface focus:outline-none tabular-nums"
          />
        </label>
        <Button onClick={() => manual.trim() && onCode(manual.trim())}>
          <Icon name="search" />
          {t(lang, "ابحث", "Find")}
        </Button>
      </div>
    </Sheet>
  );
}
