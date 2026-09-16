import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@/components/ui";
import { DOCUMENTS } from "@/lib/legal";
import { t, useUi } from "@/state/ui";

/**
 * Reachable signed in or out — someone deciding whether to create an account
 * needs to read this before they have anything to read it with.
 */
export function Legal() {
  const { lang, toggleLang } = useUi();
  const navigate = useNavigate();
  const { doc = "privacy" } = useParams();
  const document = DOCUMENTS[doc] ?? DOCUMENTS.privacy;
  const other = document.id === "privacy" ? DOCUMENTS.terms : DOCUMENTS.privacy;

  return (
    <div className="min-h-screen bg-surface">
      <div className="sticky top-0 z-10 bg-surface/95 backdrop-blur-xl px-gutter border-b border-outline-variant/40">
        <div className="h-14 flex items-center justify-between gap-2">
          <button
            onClick={() => navigate(-1)}
            className="tap w-10 h-10 -ms-2 rounded-xl flex items-center justify-center text-on-surface"
            aria-label={t(lang, "رجوع", "Back")}
          >
            <Icon name="arrow_back" size={22} className="rtl:rotate-180" />
          </button>
          <button
            onClick={toggleLang}
            className="tap h-10 px-3 rounded-xl bg-surface-container text-on-surface text-label-lg flex items-center gap-1.5"
          >
            <Icon name="language" size={16} />
            {lang === "ar" ? "EN" : "ع"}
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-gutter pb-16 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-headline-md text-on-surface">{t(lang, document.titleAr, document.titleEn)}</h1>
          <p className="text-label-sm text-on-surface-variant">
            {t(lang, `آخر تحديث ${document.updated}`, `Last updated ${document.updated}`)}
          </p>
        </div>

        {document.sections.map((section) => (
          <section key={section.titleEn} className="flex flex-col gap-2">
            <h2 className="text-title-md text-on-surface">{t(lang, section.titleAr, section.titleEn)}</h2>
            {t(lang, section.bodyAr, section.bodyEn).map((line, index) => (
              <p key={index} className="text-body-md text-on-surface-variant leading-relaxed">
                {line}
              </p>
            ))}
          </section>
        ))}

        <button
          onClick={() => navigate(`/legal/${other.id}`, { replace: true })}
          className="tap h-12 px-4 rounded-xl bg-surface-container text-on-surface text-label-lg flex items-center justify-between"
        >
          {t(lang, other.titleAr, other.titleEn)}
          <Icon name="chevron_right" className="text-on-surface-variant rtl:rotate-180" />
        </button>
      </div>
    </div>
  );
}
