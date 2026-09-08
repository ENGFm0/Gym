#!/usr/bin/env python3
"""Assemble .dc.html artboards from shared head/nav parts + per-screen bodies."""
import pathlib, re, sys

HERE = pathlib.Path(__file__).resolve().parent
P = HERE / "parts"

HEAD = {"dark": (P / "head-dark.html").read_text(), "light": (P / "head-light.html").read_text()}
TAIL = (P / "tail.html").read_text()
NAV = (P / "nav.html").read_text()

LABELS = {
    "ar": ["الرئيسية", "الوجبات", "التمارين", "التقدّم"],
    "en": ["Home", "Meals", "Train", "Progress"],
}

def nav(active, lang):
    out = NAV
    for i in range(4):
        out = out.replace(f"NAV{i}", "naviOn" if i == active else "")
        out = out.replace(f"LBL{i}", LABELS[lang][i])
    return out

# name: (body file, theme, lang, active nav index or None)
SCREENS = [
    ("Main",        "home",        "dark",  "ar", 0),
    ("Diary",       "diary",       "dark",  "ar", 1),
    ("AddFood",     "addfood",     "dark",  "ar", None),
    ("Scanner",     "scanner",     "dark",  "ar", None),
    ("FoodDetail",  "fooddetail",  "dark",  "ar", None),
    ("Diets",       "diets",       "dark",  "ar", None),
    ("DietDetail",  "dietdetail",  "dark",  "ar", None),
    ("Workouts",    "workouts",    "dark",  "ar", 2),
    ("ExerciseLog", "exerciselog", "dark",  "ar", None),
    ("Progress",    "progress",    "dark",  "ar", 3),
    ("Scale",       "scale",       "dark",  "ar", None),
    ("Steps",       "steps",       "dark",  "ar", None),
    ("Profile",     "profile",     "dark",  "ar", None),
    ("Welcome",     "welcome",     "dark",  "ar", None),
    ("BodyData",    "bodydata",    "dark",  "ar", None),
    ("PlanResult",  "planresult",  "dark",  "ar", None),
    ("HomeLight",   "home",        "light", "ar", 0),
    ("DiaryLight",  "diary",       "light", "ar", 1),
    ("ScaleLight",  "scale",       "light", "ar", None),
    ("HomeEN",      "home-en",     "dark",  "en", 0),
    ("AddFoodEN",   "addfood-en",  "dark",  "en", None),
    ("System",      "system",      "dark",  "ar", None),
]

def build():
    for name, body_file, theme, lang, active in SCREENS:
        src = P / f"body-{body_file}.html"
        if not src.exists():
            print(f"skip (no body yet): {name}", file=sys.stderr)
            continue
        body = src.read_text()
        if "<!--NAV-->" in body:
            body = body.replace("<!--NAV-->", nav(active if active is not None else -1, lang))
        out = HEAD[theme] + "\n" + body.rstrip() + "\n" + TAIL
        (HERE / f"{name}.dc.html").write_text(out)
        print(f"built {name}.dc.html  ({len(out)} bytes)")

if __name__ == "__main__":
    build()
