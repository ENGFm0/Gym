#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Stitch the 24 exported Stitch screens into one browsable site."""
import pathlib, re, json

SRC = pathlib.Path("/home/user/Gym/stitch/stitch_qiwam_arabic_fitness_tracker")
HERE = pathlib.Path(__file__).resolve().parent
LOGO = pathlib.Path("/home/user/Gym/web/brand/fitcore-logo.svg")

# ---------------------------------------------------------------- screens
# id, source folder, Arabic title, English title, group, bottom-nav tab
SCREENS = [
    ("signup",   "fitcore_2", "إنشاء حساب",        "Sign up",         "auth", None),
    ("signin",   "fitcore_1", "تسجيل الدخول",       "Sign in",         "auth", None),
    ("goal",     "_14",       "هدفك",               "Your goal",       "onboarding", None),
    ("body",     "_16",       "قياساتك ونشاطك",      "Body & activity", "onboarding", None),
    ("diet",     "_15",       "نظامك الغذائي",       "Your diet",       "onboarding", None),
    ("prefs",    "_17",       "تفضيلاتك",            "Preferences",     "onboarding", None),
    ("plan",     "_18",       "خطتك جاهزة",          "Your plan",       "onboarding", None),
    ("home",     "_2",        "الرئيسية",            "Home",            "app", "home"),
    ("meals",    "_8",        "الوجبات",             "Meals",           "app", "meals"),
    ("quicklog", "_4",        "تسجيل سريع",          "Quick log",       "app", None),
    ("meal",     "_3",        "تفاصيل الوجبة",       "Meal details",    "app", None),
    ("workouts", "_19",       "التمارين",            "Training",        "app", "workouts"),
    ("session",  "_20",       "جلسة التمرين",        "Workout session", "app", None),
    ("exercise", "_22",       "تفاصيل التمرين",      "Exercise",        "app", None),
    ("load",     "_21",       "معدل التحميل",        "Load progression","app", None),
    ("progress", "_1",        "التقدّم",             "Progress",        "app", "progress"),
    ("photos",   "_10",       "صور التقدّم",         "Progress photos", "app", None),
    ("coach",    "_5",        "لوحة المدرّب",        "Coach dashboard", "coach", None),
    ("clients",  "_9",        "المتدربون",           "Clients",         "coach", None),
    ("client",   "_12",       "ملف المتدرب",         "Client profile",  "coach", None),
    ("trainee",  "_6",        "تفاصيل المتدرب",      "Trainee detail",  "coach", None),
    ("planedit", "_7",        "تعديل الخطة",         "Plan editor",     "coach", None),
    ("addclient","_13",       "إضافة متدرب",         "Add trainee",     "coach", None),
    ("chat",     "_11",       "المحادثة",            "Chat",            "coach", None),
    ("profile",  None,        "حسابي",               "Account",         "app", None),
]

# clicking text -> screen, per screen. First match on an element wins.
LINKS = {
    "signup":   [("لديك حساب", "signin"), ("تسجيل الدخول", "signin"), ("إنشاء", "goal"), ("Google", "goal"), ("Apple", "goal")],
    "signin":   [("حساب جديد", "signup"), ("دخول", "home"), ("Google", "home"), ("Apple", "home")],
    "goal":     [("التالي", "body"), ("متابعة", "body")],
    "body":     [("التالي", "diet"), ("متابعة", "diet")],
    "diet":     [("التالي", "prefs"), ("متابعة", "prefs")],
    "prefs":    [("التالي", "plan"), ("متابعة", "plan"), ("تخطي", "plan")],
    "plan":     [("ابدأ", "home"), ("انطلق", "home"), ("الرئيسية", "home")],
    "home":     [("فهد", "profile"), ("الوجبات", "meals"), ("التمارين", "workouts"), ("التقدّم", "progress"),
                 ("الفطور", "meal"), ("الغداء", "meal"), ("العشاء", "meal"), ("سناك", "meal"),
                 ("المدرّب", "coach"), ("الكوتش", "chat")],
    "meals":    [("الفطور", "meal"), ("الغداء", "meal"), ("العشاء", "meal"), ("سناك", "meal"),
                 ("أضف", "quicklog"), ("إضافة", "quicklog")],
    "quicklog": [("حفظ", "meals"), ("أضف", "meals"), ("إضافة", "meals")],
    "meal":     [("أضف", "meals"), ("حفظ", "meals")],
    "workouts": [("ابدأ", "session"), ("سكوات", "exercise"), ("بنش", "exercise"), ("تمرين", "exercise")],
    "session":  [("إنهاء", "workouts"), ("سكوات", "exercise"), ("التالي", "exercise")],
    "exercise": [("التحميل", "load"), ("السجل", "load")],
    "progress": [("الصور", "photos"), ("المقارنة", "photos"), ("المقاسات", "photos")],
    "coach":    [("المتدربون", "clients"), ("سلطان", "client"), ("إضافة", "addclient"), ("رسالة", "chat")],
    "clients":  [("سلطان", "client"), ("إضافة", "addclient")],
    "client":   [("الخطة", "planedit"), ("محادثة", "chat"), ("رسالة", "chat"), ("تفاصيل", "trainee")],
    "trainee":  [("الخطة", "planedit"), ("محادثة", "chat")],
    "planedit": [("حفظ", "client"), ("إرسال", "client")],
    "addclient":[("إضافة", "clients"), ("دعوة", "clients")],
}

TABS = [("home", "home", "الرئيسية", "Home"), ("meals", "menu_book", "الوجبات", "Meals"),
        ("workouts", "fitness_center", "التمارين", "Training"), ("progress", "monitoring", "التقدّم", "Progress")]

# ---------------------------------------------------------------- palette
DARK = json.loads((HERE / "tokens.json").read_text()) if (HERE / "tokens.json").exists() else {}
LIGHT = {
    "surface": "#F7F9F4", "background": "#F7F9F4", "surface-dim": "#DCE0D6", "surface-bright": "#FFFFFF",
    "surface-container-lowest": "#FFFFFF", "surface-container-low": "#F2F4EC", "surface-container": "#ECEFE6",
    "surface-container-high": "#E5E9DE", "surface-container-highest": "#DFE3D7", "surface-variant": "#E1E4D6",
    "on-surface": "#191D17", "on-background": "#191D17", "on-surface-variant": "#44483D",
    "outline": "#74796B", "outline-variant": "#C4C9B4",
    "primary": "#4D6700", "on-primary": "#FFFFFF", "primary-container": "#C4F34D", "on-primary-container": "#151F00",
    "primary-fixed": "#C4F34D", "on-primary-fixed": "#151F00", "primary-fixed-dim": "#A9D631",
    "on-primary-fixed-variant": "#3A4D00", "surface-tint": "#4D6700", "inverse-primary": "#A9D631",
    "inverse-surface": "#2E312C", "inverse-on-surface": "#F0F2EA",
    "secondary": "#00658A", "on-secondary": "#FFFFFF", "secondary-container": "#C1E8FF",
    "on-secondary-container": "#001E2B", "secondary-fixed": "#C1E8FF", "secondary-fixed-dim": "#7CD1FC",
    "on-secondary-fixed": "#001E2B", "on-secondary-fixed-variant": "#004D67",
    "tertiary": "#7B5800", "on-tertiary": "#FFFFFF", "tertiary-container": "#FFDDB1",
    "on-tertiary-container": "#291800", "tertiary-fixed": "#FFDDB1", "tertiary-fixed-dim": "#F6BC64",
    "on-tertiary-fixed": "#291800", "on-tertiary-fixed-variant": "#624000",
    "error": "#BA1A1A", "on-error": "#FFFFFF", "error-container": "#FFDAD6", "on-error-container": "#410002",
}

def triplet(hexstr):
    h = hexstr.lstrip("#")
    return f"{int(h[0:2],16)} {int(h[2:4],16)} {int(h[4:6],16)}"

# ---------------------------------------------------------------- extract
# Stitch's exported markup points at Google-hosted sample photos; they cannot load
# outside Stitch, so each one becomes a self-contained placeholder that keeps the layout.
PLACEHOLDER = (
    "data:image/svg+xml;charset=utf-8,"
    "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' preserveAspectRatio='xMidYMid slice'%3E"
    "%3Crect width='120' height='120' fill='%231e201f'/%3E"
    "%3Cg fill='none' stroke='%23c4c9b0' stroke-opacity='.45' stroke-width='3' "
    "stroke-linecap='round' stroke-linejoin='round'%3E"
    "%3Crect x='34' y='40' width='52' height='40' rx='6'/%3E"
    "%3Cpath d='M48 40l5-8h14l5 8'/%3E%3Ccircle cx='60' cy='60' r='11'/%3E%3C/g%3E%3C/svg%3E")

def strip_remote_images(html):
    return re.sub(r'src="https?://[^"]*"', f'src="{PLACEHOLDER}"', html)

def screen_html(folder, sid):
    src = (SRC / folder / "code.html").read_text(errors="ignore")
    if "<main" not in src:
        return ""
    body = "<main" + src.split("<main", 1)[1]
    inner = body.split(">", 1)[1].rsplit("</main>", 1)[0]
    inner = re.sub(r'<script\b.*?</script>', '', inner, flags=re.S)      # per-screen demo JS
    inner = re.sub(r'\son[a-z]+="[^"]*"', '', inner)                     # inline handlers
    inner = re.sub(r'\sid="([^"]+)"', lambda m: f' id="{sid}-{m.group(1)}"', inner)
    inner = re.sub(r'\sfor="([^"]+)"', lambda m: f' for="{sid}-{m.group(1)}"', inner)
    inner = strip_remote_images(inner)
    return inner.strip()

def config_block():
    src = (SRC / "_2/code.html").read_text(errors="ignore")
    cfg = src.split("tailwind.config = ", 1)[1].split("</script>", 1)[0].rstrip().rstrip(";")
    for tok in DARK:                                   # every colour becomes a themeable variable
        cfg = cfg.replace(f'"{tok}": "{DARK[tok]}"', f'"{tok}": "rgb(var(--c-{tok}) / <alpha-value>)"')
    return cfg

def palette_css():
    dark = "\n".join(f"    --c-{k}: {triplet(v)};" for k, v in DARK.items())
    light = "\n".join(f"    --c-{k}: {triplet(LIGHT.get(k, DARK[k]))};" for k in DARK)
    return f":root{{\n{dark}\n  }}\n  html.light{{\n{light}\n  }}"

def logo_symbol():
    svg = LOGO.read_text()
    inner = svg.split(">", 1)[1].rsplit("</svg>", 1)[0].replace("<title>FitCore</title>", "").strip()
    return ('<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">'
            f'<symbol id="brand-logo" viewBox="0 0 780 215">{inner}</symbol></svg>')

def build():
    screens = []
    for sid, folder, ar, en, group, tab in SCREENS:
        if folder is None:                      # a screen the shell renders itself
            screens.append(dict(id=sid, ar=ar, en=en, group=group, tab=tab, html=None))
            continue
        html = screen_html(folder, sid)
        if not html:
            print("  ! skipped", sid); continue
        screens.append(dict(id=sid, ar=ar, en=en, group=group, tab=tab, html=html))
    meta = [{k: s[k] for k in ("id", "ar", "en", "group", "tab")} for s in screens]

    tpl = (HERE / "shell.html").read_text()
    out = (tpl
        .replace("/*PALETTE*/", palette_css())
        .replace("<!--LOGO-->", logo_symbol())
        .replace("/*SCREEN_META*/", json.dumps(meta, ensure_ascii=False))
        .replace("/*LINKS*/", json.dumps(LINKS, ensure_ascii=False))
        .replace("/*TABS*/", json.dumps(TABS, ensure_ascii=False))
        .replace("/*I18N*/", (HERE / "i18n.json").read_text().strip())
        .replace("<!--SCREENS-->", "\n".join(
            f'<section data-screen="{s["id"]}" hidden>{s["html"]}</section>'
            for s in screens if s["html"] is not None)))
    (HERE / "index.html").write_text(out)
    # pass 2: compile exactly the classes these screens use, then inline the result
    import subprocess
    subprocess.run(["npx", "tailwindcss", "-c", "tailwind.config.js", "-i", "input.css",
                    "-o", "tw-built.css", "--minify"], cwd=HERE, check=True,
                   capture_output=True)
    css = (HERE / "tw-built.css").read_text()
    out = out.replace("/*TW_CSS*/", css)
    (HERE / "index.html").write_text(out)
    print(f"built index.html — {len(screens)} screens, {len(css)//1024} KB css, {len(out)//1024} KB total")

def artifact_copy():
    """Same site, without the html/head/body wrapper, for publishing as an Artifact."""
    import re
    src = (HERE / "index.html").read_text()
    head = src.split("<head>", 1)[1].split("</head>", 1)[0]
    body_attrs = re.search(r"<body([^>]*)>", src).group(1)
    body = src.split("<body", 1)[1].split(">", 1)[1].rsplit("</body>", 1)[0]
    keep = [m.group(0) for m in re.finditer(
        r"<title>[\s\S]*?</title>|<style[^>]*>[\s\S]*?</style>|<link\b[^>]*>", head)
        if "preconnect" not in m.group(0)]
    out = "\n".join(keep) + f"\n<div{body_attrs} style=\"min-height:100dvh\">\n" + body + "\n</div>\n"
    (HERE / "artifact.html").write_text(out)
    print(f"artifact copy — {len(out)//1024} KB")

if __name__ == "__main__":
    build()
    artifact_copy()
