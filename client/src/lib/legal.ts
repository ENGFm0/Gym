/**
 * The privacy notice and the terms, written against what the code actually does:
 * what is stored, who else sees it, and how to take it back.
 *
 * Three things must be filled in before publishing — they are marked [ ] below and repeated
 * in docs/legal/README.md: the operating entity, a contact address, and the jurisdiction.
 */

export interface LegalSection {
  titleAr: string;
  titleEn: string;
  bodyAr: string[];
  bodyEn: string[];
}

export interface LegalDocument {
  id: "privacy" | "terms";
  titleAr: string;
  titleEn: string;
  updated: string;
  sections: LegalSection[];
}

export const OPERATOR = "[اسم الجهة المشغّلة]";
export const CONTACT = "[البريد للتواصل]";
export const JURISDICTION_AR = "[المملكة العربية السعودية]";
export const JURISDICTION_EN = "[Saudi Arabia]";

const UPDATED = "2026-09-16";

export const PRIVACY: LegalDocument = {
  id: "privacy",
  titleAr: "سياسة الخصوصية",
  titleEn: "Privacy",
  updated: UPDATED,
  sections: [
    {
      titleAr: "الخلاصة",
      titleEn: "The short version",
      bodyAr: [
        `قِوام تطبيق لتتبّع أكلك وتمارينك، ويشغّله ${OPERATOR}.`,
        "بياناتك لك: ما نبيعها ولا نستخدمها للإعلانات، وما يشوفها أحد غيرك إلا مدرّب أنت اخترت تقبل دعوته.",
        "تقدر تنزّل نسخة من كل شي سجّلته، وتقدر تحذف حسابك كامل من داخل التطبيق."
      ],
      bodyEn: [
        `FitCore tracks your food and your training. It is operated by ${OPERATOR}.`,
        "Your data is yours: it is not sold and not used for advertising, and nobody else sees it except a coach whose invite you accepted.",
        "You can download everything you logged, and you can delete your whole account from inside the app."
      ]
    },
    {
      titleAr: "وش نجمع",
      titleEn: "What we hold",
      bodyAr: [
        "حسابك: بريدك الإلكتروني واسمك (وجوالك إذا كتبته).",
        "بياناتك الجسدية: تاريخ الميلاد، الجنس، الطول، الوزن والوزن المستهدف، مستوى نشاطك وهدفك، ومقاساتك، وصور التقدّم إذا أضفتها.",
        "يومياتك: الأصناف اللي سجّلتها وكمياتها، الماء، والخطوات.",
        "تمارينك: برنامجك، أنشطتك وأهدافها الأسبوعية، وجلساتك وأوزانها ومدّتها.",
        "إعداداتك: لغتك، وحدات القياس، أوقات التذكير، ورمز جهازك للتنبيهات.",
        "سجلات تشغيلية: رقم الطلب ومعرّف حسابك عند حدوث خطأ أو بطء، ورسالة الخطأ إذا انهارت الشاشة عندك."
      ],
      bodyEn: [
        "Your account: your email and name, and your phone if you enter one.",
        "Your body data: date of birth, sex, height, weight and target, activity level and goal, measurements, and progress photos if you add them.",
        "Your diary: the items you logged and their amounts, water, and steps.",
        "Your training: your program, your activities and their weekly targets, and your sessions with their loads and durations.",
        "Your settings: language, units, reminder times, and a device token for notifications.",
        "Operational logs: a request id and your account id when something fails or is slow, and the error message if a screen crashes."
      ]
    },
    {
      titleAr: "ليش نجمعها",
      titleEn: "Why",
      bodyAr: [
        "عشان نحسب لك سعراتك وماكروزك ونعرض تقدّمك — هذي وظيفة التطبيق نفسه، وبدونها ما فيه شي يُعرض.",
        "الخطوات والوزن والجلسات تدخل في الأرقام اللي تشوفها يومياً؛ ما نستخدمها لشي ثاني.",
        "السجلات التشغيلية عشان نلقى الأعطال ونصلحها، وتُحذف مع الوقت."
      ],
      bodyEn: [
        "To compute your calories and macros and show your progress — that is the app itself; without this data there is nothing to show.",
        "Steps, weight and sessions feed the numbers you see each day, and are not used for anything else.",
        "Operational logs exist to find and fix failures, and age out over time."
      ]
    },
    {
      titleAr: "مين يشوف بياناتك",
      titleEn: "Who else sees it",
      bodyAr: [
        "المدرّب: لا يشوف شي قبل ما تقبل دعوته. إذا قبلت، يشوف وزنك ومقاساتك وصور تقدّمك وجلساتك وما سجّلته من أكل، ويقدر يحدد لك نظامك وبرنامجك. تقدر تفكّ الارتباط في أي لحظة من صفحة النظام الغذائي، وينقطع وصوله فوراً.",
        "قوقل / فايربيز: يستضيف حسابك وبياناتك وصورك (Firebase Auth وFirestore وCloud Storage) ويوصّل التنبيهات. يعالجها نيابة عنا فقط.",
        "Anthropic: إذا صوّرت تقرير InBody، تُرسل الصورة لقراءتها وترجع الأرقام لك؛ ما نحتفظ بالصورة عندنا. ما يُرسل شي غير الصورة اللي اخترت تصوّرها.",
        "Open Food Facts: إذا فعّلها المشغّل، يُرسل رقم الباركود فقط — بدون أي شي عنك — لما تمسح منتج ما هو عندنا.",
        "ما فيه معلنين ولا وسطاء بيانات ولا تتبّع لأغراض تسويقية."
      ],
      bodyEn: [
        "A coach: sees nothing before you accept their invite. Once you do, they see your weight, measurements, progress photos, sessions and the food you logged, and can set your diet and program. You can unlink at any moment from the diet screen, and their access stops immediately.",
        "Google / Firebase: hosts your account, your data and your photos (Firebase Auth, Firestore, Cloud Storage) and delivers notifications, as a processor acting for us.",
        "Anthropic: if you photograph an InBody report, the image is sent to be read and the numbers come back to you; we do not keep the image. Nothing but that photo is sent.",
        "Open Food Facts: if the operator enables it, only the barcode number — nothing about you — is sent when you scan a product we do not have.",
        "There are no advertisers, no data brokers and no marketing trackers."
      ]
    },
    {
      titleAr: "الصور والخطوات والبلوتوث",
      titleEn: "Photos, steps and Bluetooth",
      bodyAr: [
        "صور التقدّم تُرفع مباشرة من جهازك للتخزين برابط مؤقت، وتُعرض لك برابط مؤقت كذلك — ما تكون متاحة لأحد برابط عام.",
        "الخطوات: من حسّاس الحركة في المتصفح، أو من تطبيق الصحة بجوالك إذا سمحت لتطبيق الجوال. القراءة تبقى في حسابك.",
        "الميزان: يُقرأ عبر بلوتوث من جهازك مباشرة — الرقم يوصلنا، والاتصال بالميزان ما يمر علينا."
      ],
      bodyEn: [
        "Progress photos upload straight from your device with a short-lived link, and are shown to you with one too — they are never on a public URL.",
        "Steps come from the browser's motion sensor, or from your phone's health app if you grant the mobile app access. The reading stays in your account.",
        "The scale is read over Bluetooth by your own device — the number reaches us, the connection to the scale does not pass through us."
      ]
    },
    {
      titleAr: "حقوقك",
      titleEn: "Your rights",
      bodyAr: [
        "تنزيل بياناتك: «حسابي ← نزّل بياناتي» يعطيك ملفاً فيه كل شي سجّلته.",
        "التصحيح: كل بياناتك قابلة للتعديل من داخل التطبيق.",
        "الحذف: «حسابي ← احذف حسابي» يمسح بياناتك وتسجيل دخولك نهائياً. ما فيه تراجع.",
        "الاعتراض والسحب: تقدر توقف التنبيهات، وتفكّ مدرّبك، وتمنع الوصول للصحة والكاميرا والبلوتوث من إعدادات جهازك.",
        `لأي طلب أو سؤال: ${CONTACT}.`
      ],
      bodyEn: [
        "Download: Profile → Download my data gives you a file with everything you logged.",
        "Correction: every field is editable inside the app.",
        "Deletion: Profile → Delete my account removes your data and your sign-in for good. There is no undo.",
        "Objection and withdrawal: you can turn notifications off, unlink your coach, and revoke health, camera and Bluetooth access in your device settings.",
        `For anything else: ${CONTACT}.`
      ]
    },
    {
      titleAr: "مدة الحفظ",
      titleEn: "How long",
      bodyAr: [
        "بياناتك تبقى ما دام حسابك قائم، لأنها هي تاريخك — منحنى وزنك ما له معنى بدون قراءاته القديمة.",
        "إذا حذفت حسابك تُمسح بياناتك وتسجيل دخولك. السجلات التشغيلية تُحذف تلقائياً خلال مدة قصيرة."
      ],
      bodyEn: [
        "Your data stays while your account does, because it is your history — a weight curve means nothing without its earlier readings.",
        "If you delete your account, your data and your sign-in go with it. Operational logs age out on their own shortly after."
      ]
    },
    {
      titleAr: "أين تُخزَّن",
      titleEn: "Where it lives",
      bodyAr: [
        "على بنية قوقل السحابية في المنطقة اللي اختارها المشغّل عند التهيئة.",
        "قراءة تقرير InBody تُعالَج لدى Anthropic خارج هذي المنطقة، ولحظة واحدة فقط: الصورة تُرسل وتُقرأ وترجع النتيجة."
      ],
      bodyEn: [
        "On Google Cloud, in the region the operator chose at setup.",
        "Reading an InBody report is processed by Anthropic outside that region, and only for that moment: the photo goes, it is read, the result comes back."
      ]
    },
    {
      titleAr: "الأطفال",
      titleEn: "Children",
      bodyAr: ["التطبيق مو موجّه لمن هم دون ١٦ سنة، وما نجمع بياناتهم عن قصد."],
      bodyEn: ["The app is not meant for anyone under 16, and we do not knowingly collect their data."]
    },
    {
      titleAr: "التغييرات",
      titleEn: "Changes",
      bodyAr: [
        `آخر تحديث لهذي السياسة: ${UPDATED}.`,
        "أي تغيير جوهري يظهر لك داخل التطبيق قبل ما يسري."
      ],
      bodyEn: [
        `This notice was last updated on ${UPDATED}.`,
        "Any material change is shown to you inside the app before it takes effect."
      ]
    }
  ]
};

export const TERMS: LegalDocument = {
  id: "terms",
  titleAr: "شروط الاستخدام",
  titleEn: "Terms",
  updated: UPDATED,
  sections: [
    {
      titleAr: "الاتفاق",
      titleEn: "The agreement",
      bodyAr: [
        `باستخدامك قِوام أنت توافق على هذي الشروط مع ${OPERATOR}.`,
        "إذا ما توافق عليها، لا تستخدم التطبيق."
      ],
      bodyEn: [
        `By using FitCore you agree to these terms with ${OPERATOR}.`,
        "If you do not agree to them, do not use the app."
      ]
    },
    {
      titleAr: "التطبيق ليس استشارة طبية",
      titleEn: "This is not medical advice",
      bodyAr: [
        "السعرات والماكروز محسوبة بمعادلات عامة (Mifflin-St Jeor لمعدل الأيض، وقيم MET للحرق)، وهي تقديرات لشخص متوسط — مو تشخيصاً ولا وصفة.",
        "قراءة تقرير InBody من صورة قد تخطئ؛ لهذا نعرض لك الأرقام لتأكدها قبل ما تُحفظ. وقراءة الميزان من الميزان نفسه، ودقّتها منه.",
        "إذا عندك حالة صحية أو حامل أو تاخذ علاجاً، راجع مختصاً قبل ما تغيّر أكلك أو تمرينك. التطبيق أداة تتبّع، والقرار لك ولمن تستشيره."
      ],
      bodyEn: [
        "Calories and macros come from general formulas (Mifflin-St Jeor for metabolic rate, MET values for burn). They are estimates for an average person — not a diagnosis and not a prescription.",
        "Reading an InBody sheet from a photo can misread; that is why the numbers are shown for you to confirm before anything is saved. A scale reading is the scale's own, and only as accurate as it is.",
        "If you have a health condition, are pregnant, or take medication, speak to a professional before changing how you eat or train. This is a tracking tool; the decision is yours and your clinician's."
      ]
    },
    {
      titleAr: "حسابك",
      titleEn: "Your account",
      bodyAr: [
        "أنت مسؤول عن صحة بياناتك وعن حماية كلمة مرورك.",
        "حساب واحد لشخص واحد؛ لا تشارك دخولك مع غيرك.",
        "ممنوع تحاول تصل لبيانات غيرك أو تعطّل الخدمة أو تسحبها آلياً."
      ],
      bodyEn: [
        "You are responsible for the accuracy of what you enter and for keeping your password safe.",
        "One account per person; do not share your sign-in.",
        "Do not try to reach anyone else's data, disrupt the service, or scrape it."
      ]
    },
    {
      titleAr: "المدرّب والمتدرب",
      titleEn: "Coaches and trainees",
      bodyAr: [
        "العلاقة بينك وبين مدرّبك بينكما أنتما؛ نحن نوفّر الأداة فقط ولسنا طرفاً فيها ولا في أي اتفاق أو مبلغ بينكما.",
        "المدرّب ما يشوف شي إلا بعد قبولك، والوصول ينقطع فور فكّ الارتباط.",
        "إذا كنت مدرّباً فأنت مسؤول عن الخطط اللي تعطيها، وعن التعامل مع بيانات متدربينك بما يحترم خصوصيتهم."
      ],
      bodyEn: [
        "The relationship between you and your coach is yours; we provide the tool and are not a party to it, nor to any agreement or payment between you.",
        "A coach sees nothing until you accept, and their access stops the moment you unlink.",
        "If you are a coach, the plans you give are your responsibility, as is handling your trainees' data with the privacy it deserves."
      ]
    },
    {
      titleAr: "الخدمة والتوافر",
      titleEn: "Availability",
      bodyAr: [
        "نجتهد أن تكون الخدمة متاحة، لكنها قد تنقطع للصيانة أو لأسباب خارجة عن إرادتنا.",
        "قد نضيف أو نغيّر أو نوقف مزايا؛ وإذا أوقفنا الخدمة نعطيك مهلة معقولة لتنزيل بياناتك."
      ],
      bodyEn: [
        "We aim to keep the service up, but it may be interrupted for maintenance or by things outside our control.",
        "Features may be added, changed or removed; if we stop the service we will give you reasonable notice to download your data."
      ]
    },
    {
      titleAr: "الحدود",
      titleEn: "Limits",
      bodyAr: [
        "التطبيق يُقدَّم «كما هو». لا نضمن أن التقديرات تناسب حالتك تحديداً.",
        "لا نتحمل ضرراً غير مباشر أو تبعياً ناتجاً عن الاستخدام، في حدود ما يسمح به النظام."
      ],
      bodyEn: [
        "The app is provided as is. We do not warrant that its estimates fit your particular case.",
        "We are not liable for indirect or consequential loss arising from use, to the extent the law allows."
      ]
    },
    {
      titleAr: "الإنهاء",
      titleEn: "Ending it",
      bodyAr: [
        "تقدر تحذف حسابك متى شئت من داخل التطبيق.",
        "ونقدر نوقف حساباً يخالف هذي الشروط، مع إتاحة تنزيل بياناته ما لم يمنع ذلك سبب نظامي."
      ],
      bodyEn: [
        "You can delete your account whenever you like, from inside the app.",
        "We may suspend an account that breaks these terms, while still allowing its data to be downloaded unless the law prevents it."
      ]
    },
    {
      titleAr: "النظام والاختصاص",
      titleEn: "Law",
      bodyAr: [
        `تخضع هذي الشروط لأنظمة ${JURISDICTION_AR}، وأي نزاع ينظر أمام محاكمها المختصة.`,
        `آخر تحديث: ${UPDATED}. للتواصل: ${CONTACT}.`
      ],
      bodyEn: [
        `These terms are governed by the laws of ${JURISDICTION_EN}, and disputes go to its competent courts.`,
        `Last updated ${UPDATED}. Contact: ${CONTACT}.`
      ]
    }
  ]
};

export const DOCUMENTS: Record<string, LegalDocument> = {
  privacy: PRIVACY,
  terms: TERMS
};
