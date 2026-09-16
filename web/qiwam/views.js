/* Real, working screens rendered from the user's own data, in the Stitch design language. */
var FOODS = [
  {id:"egg",n:"بيض",en:"Eggs",u:"حبة",base:1,kcal:90,p:6,c:.3,f:7.3},
  {id:"chick",n:"صدر دجاج مشوي",en:"Grilled chicken",u:"جم",base:100,kcal:165,p:31,c:0,f:3.6},
  {id:"beef",n:"لحم بقري",en:"Beef",u:"جم",base:100,kcal:250,p:26,c:0,f:16},
  {id:"salmon",n:"سلمون",en:"Salmon",u:"جم",base:100,kcal:208,p:20,c:0,f:13},
  {id:"shrimp",n:"روبيان",en:"Shrimp",u:"جم",base:100,kcal:99,p:24,c:.2,f:.3},
  {id:"tuna",n:"تونة بالماء",en:"Tuna",u:"علبة",base:1,kcal:110,p:25,c:0,f:1},
  {id:"yog",n:"لبن يوناني",en:"Greek yogurt",u:"جم",base:170,kcal:100,p:17,c:6,f:0},
  {id:"milk",n:"حليب",en:"Milk",u:"مل",base:200,kcal:104,p:7,c:10,f:4},
  {id:"halou",n:"جبن حلوم",en:"Halloumi",u:"جم",base:100,kcal:325,p:22,c:2.5,f:26},
  {id:"qareesh",n:"جبن قريش",en:"Cottage cheese",u:"جم",base:100,kcal:98,p:11,c:3.4,f:4.3},
  {id:"rice",n:"أرز أبيض مطبوخ",en:"White rice",u:"جم",base:100,kcal:130,p:2.7,c:28,f:.3},
  {id:"kabsa",n:"كبسة دجاج",en:"Kabsa",u:"صحن",base:1,kcal:640,p:34,c:72,f:22},
  {id:"shawrma",n:"شاورما دجاج",en:"Shawarma",u:"سندويتش",base:1,kcal:390,p:24,c:36,f:16},
  {id:"bread",n:"خبز عربي",en:"Arabic bread",u:"رغيف",base:1,kcal:140,p:5,c:26,f:1.5},
  {id:"oats",n:"شوفان",en:"Oats",u:"جم",base:100,kcal:389,p:17,c:66,f:7},
  {id:"pasta",n:"معكرونة",en:"Pasta",u:"جم",base:100,kcal:158,p:6,c:31,f:.9},
  {id:"potato",n:"بطاطس مقلية",en:"Fries",u:"جم",base:100,kcal:312,p:3.4,c:41,f:15},
  {id:"foul",n:"فول مدمس",en:"Foul",u:"صحن",base:1,kcal:270,p:14,c:34,f:8},
  {id:"hummus",n:"حمص بالطحينة",en:"Hummus",u:"جم",base:100,kcal:177,p:8,c:14,f:10},
  {id:"dates",n:"تمر",en:"Dates",u:"حبة",base:1,kcal:22,p:.2,c:6,f:0},
  {id:"banana",n:"موز",en:"Banana",u:"حبة",base:1,kcal:105,p:1.3,c:27,f:.4},
  {id:"apple",n:"تفاح",en:"Apple",u:"حبة",base:1,kcal:95,p:.5,c:25,f:.3},
  {id:"avo",n:"أفوكادو",en:"Avocado",u:"جم",base:100,kcal:214,p:2.6,c:11,f:20},
  {id:"almond",n:"لوز",en:"Almonds",u:"جم",base:100,kcal:579,p:21,c:22,f:50},
  {id:"pb",n:"زبدة فول سوداني",en:"Peanut butter",u:"جم",base:100,kcal:588,p:25,c:20,f:50},
  {id:"oil",n:"زيت زيتون",en:"Olive oil",u:"ملعقة",base:1,kcal:119,p:0,c:0,f:13.5},
  {id:"butter",n:"زبدة",en:"Butter",u:"جم",base:100,kcal:717,p:.9,c:.1,f:81},
  {id:"gsalad",n:"سلطة يونانية",en:"Greek salad",u:"حصة",base:1,kcal:310,p:8,c:10,f:27},
  {id:"broc",n:"بروكلي",en:"Broccoli",u:"جم",base:100,kcal:35,p:2.4,c:7,f:.4},
  {id:"cucum",n:"خيار",en:"Cucumber",u:"جم",base:100,kcal:15,p:.7,c:3.6,f:.1},
  {id:"whey",n:"بروتين واي",en:"Whey protein",u:"سكوب",base:1,kcal:120,p:24,c:3,f:1.5},
  {id:"latte",n:"قهوة بحليب",en:"Latte",u:"كوب",base:1,kcal:150,p:8,c:14,f:7},
  {id:"coffee",n:"قهوة سادة",en:"Black coffee",u:"فنجان",base:1,kcal:5,p:.2,c:.8,f:0},
  {id:"burger",n:"برجر",en:"Burger",u:"وجبة",base:1,kcal:540,p:28,c:41,f:29},
  {id:"pizza",n:"بيتزا",en:"Pizza slice",u:"قطعة",base:1,kcal:230,p:10,c:28,f:9}
];
var FOOD_BY_ID = {}; FOODS.forEach(function(f){ FOOD_BY_ID[f.id] = f; });
var MEAL_NAMES = ["الفطور","الغداء","سناك","العشاء"];
var MEAL_EN = { "الفطور":"Breakfast", "الغداء":"Lunch", "سناك":"Snack", "العشاء":"Dinner" };
var EXERCISE_LIB = [
  ["بنش برس","Bench press"],["سكوات","Squat"],["رفعة ميتة","Deadlift"],["ضغط أكتاف","Shoulder press"],
  ["سحب أمامي","Lat pulldown"],["تجديف بالبار","Barbell row"],["عقلة","Pull-up"],["مرجحة بايسبس","Biceps curl"],
  ["ترايسبس بالحبل","Triceps pushdown"],["دمبل صدر مائل","Incline dumbbell press"],["لانجز","Lunges"],
  ["رفرفة جانبي","Lateral raise"],["سمانة واقف","Standing calf raise"],["بلانك","Plank"],["كارديو","Cardio"]
];
var DAY_TEMPLATES = {
  1: [["جسم كامل","Full body"]],
  2: [["علوي","Upper body"],["سفلي","Lower body"]],
  3: [["دفع","Push"],["سحب","Pull"],["أرجل","Legs"]],
  4: [["صدر وترايسبس","Chest & triceps"],["ظهر وبايسبس","Back & biceps"],["أرجل","Legs"],["أكتاف وبطن","Shoulders & core"]],
  5: [["صدر","Chest"],["ظهر","Back"],["أرجل","Legs"],["أكتاف","Shoulders"],["ذراعين","Arms"]],
  6: [["دفع أ","Push A"],["سحب أ","Pull A"],["أرجل أ","Legs A"],["دفع ب","Push B"],["سحب ب","Pull B"],["أرجل ب","Legs B"]],
  7: [["دفع أ","Push A"],["سحب أ","Pull A"],["أرجل أ","Legs A"],["دفع ب","Push B"],["سحب ب","Pull B"],["أرجل ب","Legs B"],["كارديو وبطن","Cardio & core"]]
};
var WEEK_AR  = ["السبت","الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة"];
var WEEK_EN  = ["Saturday","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday"];
var WEEK_ARS = ["س","ح","ن","ث","ر","خ","ج"];
var WEEK_ENS = ["Sa","Su","Mo","Tu","We","Th","Fr"];
/* how a week lays itself out for n training days — rest spread in between */
var WEEK_SHAPES = { 1:[1], 2:[1,4], 3:[1,3,5], 4:[0,1,3,4], 5:[0,1,2,4,5], 6:[0,1,2,3,4,5], 7:[0,1,2,3,4,5,6] };

/* ---- units ---- */
var KG_LB = 2.20462, CM_IN = 2.54;
function U(){ S.profile.units = S.profile.units || { mass:"kg", len:"cm" }; return S.profile.units; }
function massU(){ return U().mass === "lb" ? (S.lang==="en"?"lb":"رطل") : (S.lang==="en"?"kg":"كجم"); }
function lenU(){ return U().len === "in" ? (S.lang==="en"?"in":"إنش") : (S.lang==="en"?"cm":"سم"); }
function showMass(kg){ return U().mass === "lb" ? kg*KG_LB : kg; }
function toKg(v){ return U().mass === "lb" ? v/KG_LB : v; }
function showLen(cm){ return U().len === "in" ? cm/CM_IN : cm; }
function toCm(v){ return U().len === "in" ? v*CM_IN : v; }
function dec(n, d){ var x = Math.round(n * Math.pow(10, d||0)) / Math.pow(10, d||0); return String(x); }

/* ---- day store ---- */
function todayKey(){ var d = new Date(); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(); }
function day(){
  S.days = S.days || {};
  var k = S.dayKey || todayKey();
  if (!S.days[k]) S.days[k] = { meals:{ "الفطور":[], "الغداء":[], "سناك":[], "العشاء":[] }, water:0, steps:0 };
  return S.days[k];
}
function mealTotals(m){
  var t = {kcal:0,p:0,c:0,f:0};
  (day().meals[m] || []).forEach(function(it){
    var k = it.qty / it.base;
    t.kcal += it.kcal*k; t.p += it.p*k; t.c += it.c*k; t.f += it.f*k;
  });
  return t;
}
function dayTotals(){
  var t = {kcal:0,p:0,c:0,f:0};
  MEAL_NAMES.forEach(function(m){ var v = mealTotals(m); t.kcal+=v.kcal; t.p+=v.p; t.c+=v.c; t.f+=v.f; });
  return t;
}

/* ---- small ui helpers, Stitch classes ---- */
function card(inner, cls){ return '<div class="rounded-2xl bg-surface-container p-4 '+(cls||"")+'">'+inner+'</div>'; }
function label(t){ return '<div class="font-label-sm text-label-sm text-on-surface-variant">'+t+'</div>'; }
function h(t, extra){ return '<div class="font-title-md text-title-md text-on-surface '+(extra||"")+'">'+t+'</div>'; }
function btn(text, act, cls){
  return '<button '+act+' class="tap h-12 px-4 rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-2 '+
         (cls || "bg-primary-fixed text-on-primary-fixed")+'">'+text+'</button>';
}
function field(id, lab, value, unit, mode){
  return '<div class="rounded-xl bg-surface-container-high p-3 flex flex-col gap-1">'+
    label(lab)+
    '<div class="flex items-baseline gap-2">'+
      '<input id="'+id+'" value="'+value+'" inputmode="'+(mode||"decimal")+'" '+(mode==="date"?'type="date"':'type="text"')+
      ' class="w-full bg-transparent border-0 p-0 font-title-md text-title-md text-on-surface focus:outline-none tabular-nums">'+
      (unit ? '<span class="font-label-sm text-label-sm text-on-surface-variant shrink-0">'+unit+'</span>' : "")+
    '</div></div>';
}
function seg(options, activeVal, act){
  return '<div class="rounded-xl bg-surface-container-low p-1 flex gap-1">'+options.map(function(o){
    var on = o[0] === activeVal;
    return '<button '+act.replace("%v", o[0])+' class="tap flex-1 h-10 rounded-lg font-label-lg text-label-lg '+
      (on ? "bg-primary-fixed text-on-primary-fixed" : "text-on-surface-variant")+'">'+o[1]+'</button>';
  }).join("")+'</div>';
}
function ringSvg(pct, center, sub){
  var r = 52, c = 2*Math.PI*r, d = c * Math.max(0, Math.min(1, pct));
  return '<div class="relative w-32 h-32 shrink-0">'+
    '<svg viewBox="0 0 120 120" class="w-32 h-32 -rotate-90">'+
      '<circle cx="60" cy="60" r="'+r+'" fill="none" stroke="rgb(var(--c-surface-container-highest))" stroke-width="10"/>'+
      (d > 1 ? '<circle cx="60" cy="60" r="'+r+'" fill="none" stroke="rgb(var(--c-primary-fixed))" stroke-width="10" stroke-linecap="round" stroke-dasharray="'+d.toFixed(1)+' '+c.toFixed(1)+'"/>' : "")+
    '</svg>'+
    '<div class="absolute inset-0 flex flex-col items-center justify-center">'+
      '<div class="font-metric-display-mobile text-metric-display-mobile font-bold text-on-surface tabular-nums leading-none">'+center+'</div>'+
      '<div class="font-label-sm text-label-sm text-on-surface-variant mt-1">'+sub+'</div>'+
    '</div></div>';
}
function bar(val, max, colorVar){
  return '<div class="h-1.5 rounded-full bg-surface-container-highest overflow-hidden"><div class="h-full rounded-full" style="width:'+
    (Math.max(0, Math.min(100, val/max*100)).toFixed(1))+'%;background:rgb(var(--c-'+colorVar+'))"></div></div>';
}

/* ===================== HOME ===================== */
function vHome(){
  var en = S.lang === "en", t = plan(), d = dayTotals(), dd = day();
  pedoResume();
  var burn = burnToday();
  var left = Math.round(t.kcal - d.kcal + burn);
  var name = S.profile.name || (en ? "there" : "بك");
  return '<div class="flex flex-col gap-4 pt-1">'+
    '<div class="flex items-start justify-between gap-3">'+
      '<div><div class="font-headline-md text-headline-md text-on-surface">'+(en?"Hey ":"أهلاً ")+name+'</div>'+
      '<button data-go="dietinfo" class="tap font-label-lg text-label-lg text-on-surface-variant">'+
        dietName()+' · '+(en?"target ":"هدفك ")+arGroup(t.kcal)+(en?" kcal":" سعرة")+'</button></div>'+
      '<button data-go="profile" class="tap w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-on-surface">'+
        '<span class="material-symbols-outlined text-[20px]">person</span></button>'+
    '</div>'+
    card('<div class="flex items-center justify-between gap-4">'+
      ringSvg(d.kcal / t.kcal, arGroup(Math.abs(left)), left >= 0 ? (en?"kcal left":"سعرة متبقية") : (en?"over":"سعرة زيادة"))+
      '<div class="flex-1 flex flex-col gap-3">'+
        '<div class="flex items-center justify-between"><span class="font-label-sm text-label-sm text-on-surface-variant">'+(en?"Target":"الهدف")+'</span>'+
          '<span class="font-title-md text-title-md text-on-surface tabular-nums">'+arGroup(t.kcal)+'</span></div>'+
        '<div class="h-px bg-outline-variant/50"></div>'+
        '<div class="flex items-center justify-between"><span class="font-label-sm text-label-sm text-on-surface-variant">'+(en?"Eaten":"تناولت")+'</span>'+
          '<span class="font-title-md text-title-md text-on-surface tabular-nums">'+arGroup(d.kcal)+'</span></div>'+
        '<div class="h-px bg-outline-variant/50"></div>'+
        '<div class="flex items-center justify-between"><span class="font-label-sm text-label-sm text-on-surface-variant">'+(en?"Burned":"المحروق")+'</span>'+
          '<span class="font-title-md text-title-md text-primary-fixed tabular-nums">'+arGroup(burn)+'</span></div>'+
      '</div></div>'+
      '<div class="grid grid-cols-3 gap-3 mt-4">'+
        macroCol(en?"Protein":"بروتين", d.p, t.p, "primary-fixed")+
        macroCol(en?"Carbs":"كارب", d.c, t.c, "secondary-fixed-dim")+
        macroCol(en?"Fat":"دهون", d.f, t.f, "tertiary-fixed-dim")+
      '</div>')+
    '<div class="grid grid-cols-2 gap-3">'+
      card('<div class="flex items-center justify-between"><span class="font-label-sm text-label-sm text-on-surface-variant">'+(en?"Steps":"الخطوات")+'</span>'+
        '<button data-act="pedo" class="tap px-2.5 h-8 rounded-lg flex items-center gap-1 font-label-sm text-label-sm '+
          (PEDO.on ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-high text-on-surface-variant")+'">'+
          '<span class="material-symbols-outlined text-[14px]">'+(PEDO.on?"sensors":"sensors_off")+'</span>'+
          (PEDO.on ? (en?"Counting":"يعدّ") : (en?"Track":"تتبّع"))+'</button></div>'+
        '<div id="steps-val" class="font-headline-md text-headline-md text-on-surface tabular-nums mt-1">'+arGroup(dd.steps||0)+'</div>'+
        bar(dd.steps||0, 10000, "primary-fixed")+
        '<div class="mt-2 font-label-sm text-label-sm text-on-surface-variant">'+
          (PEDO.on ? (en?"From your phone sensor":"من حسّاس جوالك") : (en?"Phone sensor":"يسجّلها الجوال"))+' · '+
          '<button data-act="stepsman" class="tap text-primary-fixed">'+(en?"enter manually":"إدخال يدوي")+'</button></div>')+
      card('<div class="flex items-center justify-between"><span class="font-label-sm text-label-sm text-on-surface-variant">'+(en?"Water":"الماء")+'</span>'+
        '<div class="flex gap-1"><button data-act="water" data-v="-0.25" class="tap w-8 h-8 rounded-lg bg-surface-container-high text-on-surface">−</button>'+
        '<button data-act="water" data-v="0.25" class="tap w-8 h-8 rounded-lg bg-primary-fixed text-on-primary-fixed">+</button></div></div>'+
        '<div class="font-headline-md text-headline-md text-on-surface tabular-nums mt-1">'+dec(dd.water||0,2)+'<span class="font-label-sm text-label-sm text-on-surface-variant"> '+(en?"L":"لتر")+'</span></div>'+
        bar(dd.water||0, 3, "secondary-fixed-dim"))+
    '</div>'+
    '<div class="flex items-center justify-between"><span class="font-title-md text-title-md text-on-surface">'+(en?"Today's meals":"وجبات اليوم")+'</span>'+
      '<button data-go="meals" class="tap font-label-lg text-label-lg text-primary-fixed">'+(en?"Diary":"اليوميات")+'</button></div>'+
    '<div class="rounded-2xl bg-surface-container divide-y divide-outline-variant/40">'+
      MEAL_NAMES.map(function(m){
        var mt = mealTotals(m), items = day().meals[m] || [];
        return '<button data-act="addmeal" data-meal="'+m+'" class="tap w-full flex items-center justify-between px-4 py-3.5 text-start">'+
          '<div class="flex items-center gap-3"><div class="w-10 h-10 rounded-xl '+(items.length?"bg-primary-fixed/15 text-primary-fixed":"bg-surface-container-high text-on-surface-variant")+' flex items-center justify-center">'+
            '<span class="material-symbols-outlined text-[18px]">'+(items.length?"check_circle":"add")+'</span></div>'+
          '<div><div class="font-label-lg text-label-lg text-on-surface">'+(en?MEAL_EN[m]:m)+'</div>'+
          '<div class="font-label-sm text-label-sm text-on-surface-variant">'+(items.length ? items.map(function(i){ return en&&i.en?i.en:i.n; }).join(" · ") : (en?"nothing logged":"ما سجّلت شي"))+'</div></div></div>'+
          '<div class="font-label-lg text-label-lg '+(items.length?"text-on-surface":"text-on-surface-variant")+' tabular-nums">'+(items.length?arGroup(mt.kcal):"+")+'</div></button>';
      }).join("")+
    '</div>'+
    '<div class="grid grid-cols-2 gap-3">'+
      quick(en?"Log weight":"سجّل وزنك","monitor_weight","weighin")+
      quick(en?"My program":"برنامجي","fitness_center","gotoworkouts")+
    '</div>'+
  '</div>';
}
/* ===================== pedometer: the phone counts the steps ===================== */
var PEDO = { on:false, lastT:0, buf:[], saved:0 };
function pedoSupported(){
  return typeof window !== "undefined" && typeof window.DeviceMotionEvent !== "undefined";
}
function pedoNeedsTap(){
  return pedoSupported() && typeof window.DeviceMotionEvent.requestPermission === "function";
}
function pedoTick(e){
  var a = e.accelerationIncludingGravity || e.acceleration;
  if (!a) return;
  var m = Math.sqrt((a.x||0)*(a.x||0) + (a.y||0)*(a.y||0) + (a.z||0)*(a.z||0));
  PEDO.buf.push(m); if (PEDO.buf.length > 10) PEDO.buf.shift();
  var avg = 0; PEDO.buf.forEach(function(x){ avg += x; }); avg /= PEDO.buf.length;
  var now = Date.now();
  if (m - avg > 1.5 && now - PEDO.lastT > 280){          /* one peak = one step */
    PEDO.lastT = now;
    var d = day(); d.steps = (d.steps || 0) + 1;
    var el = document.getElementById("steps-val");
    if (el) el.textContent = arGroup(d.steps);
    if (now - PEDO.saved > 4000){ PEDO.saved = now; save(); }
  }
}
function pedoAttach(){
  window.addEventListener("devicemotion", pedoTick);
  PEDO.on = true; S.pedo = true; save();
}
function pedoStart(){
  var en = S.lang === "en";
  if (!pedoSupported()){
    toast(en?"No motion sensor here — use manual entry":"ما فيه حسّاس حركة — استخدم الإدخال اليدوي");
    return;
  }
  if (pedoNeedsTap()){
    window.DeviceMotionEvent.requestPermission().then(function(r){
      if (r === "granted"){ pedoAttach(); render(current, true); toast(en?"Counting your steps":"بدأ عدّ خطواتك"); }
      else toast(en?"Motion access denied":"ما سمحت بالحركة");
    })["catch"](function(){ toast(en?"Motion access denied":"ما سمحت بالحركة"); });
    return;
  }
  pedoAttach(); render(current, true); toast(en?"Counting your steps":"بدأ عدّ خطواتك");
}
function pedoStop(){
  window.removeEventListener("devicemotion", pedoTick);
  PEDO.on = false; S.pedo = false; save(); render(current, true);
}
function pedoResume(){                                    /* silent resume where iOS does not need a tap */
  if (PEDO.on || !S.pedo) return;
  if (!pedoSupported() || pedoNeedsTap()) return;
  window.addEventListener("devicemotion", pedoTick); PEDO.on = true;
}
function arDec(n, d){
  var s = dec(n, d);
  return S.lang === "en" ? s : s.replace(/[0-9]/g, function(x){ return AR[+x]; }).replace(".", "٫");
}
function dietName(){
  var en = S.lang === "en", id = S.profile.diet || "balanced";
  var d = DIETS.filter(function(x){ return x.id === id; })[0];
  return d ? (en ? d.en : d.ar) : id;
}
function macroCol(name, val, max, color){
  return '<div class="flex flex-col gap-1.5"><div class="flex items-baseline justify-between">'+
    '<span class="font-label-sm text-label-sm text-on-surface-variant">'+name+'</span></div>'+
    '<span class="font-label-lg text-label-lg text-on-surface tabular-nums">'+ar(val)+' / '+ar(max)+'</span>'+
    bar(val, max, color)+'</div>';
}
function quick(text, icon, act){
  return '<button data-act="'+act+'" class="tap rounded-2xl bg-surface-container p-4 flex items-center gap-3 text-start">'+
    '<div class="w-10 h-10 rounded-xl bg-primary-fixed/15 text-primary-fixed flex items-center justify-center">'+
    '<span class="material-symbols-outlined text-[18px]">'+icon+'</span></div>'+
    '<span class="font-label-lg text-label-lg text-on-surface">'+text+'</span></button>';
}

/* ===================== MEALS (diary) ===================== */
function vMeals(){
  var en = S.lang === "en", t = plan(), d = dayTotals();
  return '<div class="flex flex-col gap-4 pt-1">'+
    '<div><div class="font-headline-md text-headline-md text-on-surface">'+(en?"Meals":"الوجبات")+'</div>'+
    label(en?"Your daily food log":"سجل أكلك اليومي")+'</div>'+
    seg([["log", en?"My diary":"يومياتي"],["diet", en?"My diet":"النظام"]], "log", 'data-act="mealstab" data-v="%v"')+
    card('<div class="flex items-center justify-between gap-2 flex-wrap">'+
      stat(en?"Target":"الهدف", arGroup(t.kcal))+stat(en?"Eaten":"أكل", arGroup(d.kcal))+
      stat(en?"Left":"متبقي", arGroup(t.kcal - d.kcal), "text-primary-fixed")+'</div>'+
      '<div class="mt-3 h-2 rounded-full bg-surface-container-highest overflow-hidden flex">'+
        '<div style="width:'+pc(d.p*4,t.kcal)+'%;background:rgb(var(--c-primary-fixed))"></div>'+
        '<div style="width:'+pc(d.c*4,t.kcal)+'%;background:rgb(var(--c-secondary-fixed-dim))"></div>'+
        '<div style="width:'+pc(d.f*9,t.kcal)+'%;background:rgb(var(--c-tertiary-fixed-dim))"></div></div>'+
      '<div class="flex justify-between mt-2 font-label-sm text-label-sm">'+
        '<span class="text-primary-fixed">'+(en?"Protein ":"بروتين ")+ar(d.p)+'/'+ar(t.p)+'</span>'+
        '<span class="text-secondary-fixed-dim">'+(en?"Carbs ":"كارب ")+ar(d.c)+'/'+ar(t.c)+'</span>'+
        '<span class="text-tertiary-fixed-dim">'+(en?"Fat ":"دهون ")+ar(d.f)+'/'+ar(t.f)+'</span></div>')+
    MEAL_NAMES.map(function(m){
      var items = day().meals[m] || [], mt = mealTotals(m);
      return '<div class="rounded-2xl bg-surface-container overflow-hidden">'+
        '<div class="flex items-center justify-between px-4 py-3">'+
          '<span class="font-title-md text-title-md text-on-surface">'+(en?MEAL_EN[m]:m)+'</span>'+
          '<span class="font-label-lg text-label-lg text-on-surface-variant tabular-nums">'+arGroup(mt.kcal)+'</span></div>'+
        (items.length ? items.map(function(it, i){
          var k = it.qty/it.base;
          return '<div class="flex items-center justify-between px-4 py-3 border-t border-outline-variant/40">'+
            '<div class="min-w-0"><div class="font-label-lg text-label-lg text-on-surface truncate">'+(en&&it.en?it.en:it.n)+'</div>'+
            '<div class="font-label-sm text-label-sm text-on-surface-variant">'+dec(it.qty,1)+' '+it.u+' · '+ar(it.p*k)+(en?" g protein":" بروتين")+'</div></div>'+
            '<div class="flex items-center gap-2 shrink-0"><span class="font-label-lg text-label-lg text-on-surface-variant tabular-nums">'+ar(it.kcal*k)+'</span>'+
            '<button data-act="delitem" data-meal="'+m+'" data-i="'+i+'" class="tap w-9 h-9 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">'+
            '<span class="material-symbols-outlined text-[16px]">close</span></button></div></div>';
        }).join("") : '<div class="px-4 py-3 border-t border-outline-variant/40 font-label-sm text-label-sm text-on-surface-variant">'+(en?"nothing logged":"ما سجّلت شي")+'</div>')+
        '<button data-act="addmeal" data-meal="'+m+'" class="tap w-full flex items-center gap-2 px-4 py-3.5 border-t border-outline-variant/40 text-primary-fixed">'+
          '<span class="material-symbols-outlined text-[18px]">add</span>'+
          '<span class="font-label-lg text-label-lg">'+(en?("Add to "+MEAL_EN[m]):("أضف لـ"+m))+'</span></button>'+
      '</div>';
    }).join("")+
  '</div>';
}
function stat(l, v, tone){
  return '<div class="flex flex-col"><span class="font-label-sm text-label-sm text-on-surface-variant">'+l+'</span>'+
    '<span class="font-title-md text-title-md tabular-nums '+(tone||"text-on-surface")+'">'+v+'</span></div>';
}
function pc(a, b){ return Math.max(0, Math.min(100, a/b*100)).toFixed(1); }

/* ===================== ADD FOOD ===================== */
var foodQuery = "", foodPick = null;
function vAddFood(){
  var en = S.lang === "en", meal = S.addMeal || "الغداء";
  var q = foodQuery.trim();
  var list = FOODS.filter(function(f){ return !q || (f.n + " " + f.en).toLowerCase().indexOf(q.toLowerCase()) > -1; }).slice(0, 30);
  return '<div class="flex flex-col gap-4 pt-1">'+
    '<div><div class="font-headline-md text-headline-md text-on-surface">'+(en?("Add to "+MEAL_EN[meal]):("إضافة إلى "+meal))+'</div>'+
    label(en?"Search, or add your own":"ابحث، أو أضف صنفك")+'</div>'+
    '<div class="rounded-xl bg-surface-container flex items-center gap-2 px-3 h-12">'+
      '<span class="material-symbols-outlined text-[20px] text-on-surface-variant">search</span>'+
      '<input id="food-q" value="'+foodQuery.replace(/"/g,"&quot;")+'" placeholder="'+(en?"chicken, rice, dates…":"دجاج، أرز، تمر…")+'"'+
      ' class="flex-1 bg-transparent border-0 p-0 font-body-md text-body-md text-on-surface focus:outline-none">'+
    '</div>'+
    seg(MEAL_NAMES.map(function(m){ return [m, en?MEAL_EN[m]:m]; }), meal, 'data-act="setmeal" data-v="%v"')+
    (foodPick ? foodPickPanel(en) : "")+
    '<div class="rounded-2xl bg-surface-container divide-y divide-outline-variant/40">'+
      (list.length ? list.map(function(f){
        return '<button data-act="pickfood" data-id="'+f.id+'" class="tap w-full flex items-center justify-between px-4 py-3.5 text-start">'+
          '<div class="min-w-0"><div class="font-label-lg text-label-lg text-on-surface truncate">'+(en?f.en:f.n)+'</div>'+
          '<div class="font-label-sm text-label-sm text-on-surface-variant">'+dec(f.base,0)+' '+f.u+' · '+ar(f.kcal)+(en?" kcal · ":" سعرة · ")+ar(f.p)+(en?" g protein":" بروتين")+'</div></div>'+
          '<div class="w-9 h-9 rounded-lg bg-primary-fixed/15 text-primary-fixed flex items-center justify-center shrink-0">'+
          '<span class="material-symbols-outlined text-[18px]">add</span></div></button>';
      }).join("") : '<div class="px-4 py-6 text-center font-body-md text-body-md text-on-surface-variant">'+(en?"Nothing found — add it manually":"ما لقينا شي — أضفه يدوياً")+'</div>')+
    '</div>'+
    btn((en?"Add a custom item":"أضف صنفاً يدوياً"), 'data-act="manualfood"', "bg-surface-container text-on-surface w-full")+
  '</div>';
}
function foodPickPanel(en){
  var f = FOOD_BY_ID[foodPick.id], k = foodPick.qty / f.base;
  return card(
    '<div class="flex items-center justify-between mb-3"><span class="font-title-md text-title-md text-on-surface">'+(en?f.en:f.n)+'</span>'+
    '<button data-act="closepick" class="tap w-9 h-9 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">'+
    '<span class="material-symbols-outlined text-[16px]">close</span></button></div>'+
    '<div class="flex items-center gap-2 mb-3">'+
      '<button data-act="qty" data-v="-1" class="tap w-11 h-11 rounded-xl bg-surface-container-high text-on-surface">−</button>'+
      '<input id="pick-qty" value="'+dec(foodPick.qty,1)+'" inputmode="decimal" class="flex-1 h-11 text-center rounded-xl bg-surface-container-high border-0 font-title-md text-title-md text-on-surface focus:outline-none tabular-nums">'+
      '<span class="font-label-lg text-label-lg text-on-surface-variant w-12">'+f.u+'</span>'+
      '<button data-act="qty" data-v="1" class="tap w-11 h-11 rounded-xl bg-primary-fixed text-on-primary-fixed">+</button>'+
    '</div>'+
    '<div class="grid grid-cols-4 gap-2 mb-3">'+
      [[en?"kcal":"سعرة", ar(f.kcal*k), "text-on-surface"],[en?"P":"بروتين", ar(f.p*k), "text-primary-fixed"],
       [en?"C":"كارب", ar(f.c*k), "text-secondary-fixed-dim"],[en?"F":"دهون", ar(f.f*k), "text-tertiary-fixed-dim"]]
      .map(function(x){ return '<div class="rounded-xl bg-surface-container-high p-2 text-center"><div class="font-label-lg text-label-lg '+x[2]+' tabular-nums">'+x[1]+'</div>'+
        '<div class="font-label-sm text-label-sm text-on-surface-variant">'+x[0]+'</div></div>'; }).join("")+
    '</div>'+
    btn(en?"Add":"أضف", 'data-act="confirmfood"', "bg-primary-fixed text-on-primary-fixed w-full"), "border border-primary-fixed/40");
}

/* ===================== BODY DATA (birth date, typed, units) ===================== */
function ageFrom(birth){
  if (!birth) return null;
  var b = new Date(birth); if (isNaN(b)) return null;
  var n = new Date(), a = n.getFullYear() - b.getFullYear();
  var m = n.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < b.getDate())) a--;
  return (a > 0 && a < 120) ? a : null;
}
function vBody(){
  var en = S.lang === "en", p = S.profile;
  var age = ageFrom(p.birth);
  var ACTS = [["light", en?"Desk / light":"خامل أو مكتبي", "1.2–1.375"],
              ["moderate", en?"Moderate · 3–4 days":"متوسط · ٣–٤ أيام", "1.55"],
              ["high", en?"High · daily":"عالي · يومياً", "1.725"]];
  return '<div class="flex flex-col gap-4 pt-1">'+
    '<div><div class="font-headline-md text-headline-md text-on-surface">'+(en?"Your body":"قياساتك")+'</div>'+
    label(en?"Age comes from your birth date":"العمر يُحسب من تاريخ ميلادك")+'</div>'+
    seg([["male", en?"Male":"ذكر"],["female", en?"Female":"أنثى"]], p.gender || "male", 'data-act="gender" data-v="%v"')+
    '<div class="flex gap-2">'+
      seg([["kg","كجم / kg"],["lb","رطل / lb"]], U().mass, 'data-act="unit" data-kind="mass" data-v="%v"')+
      seg([["cm","سم / cm"],["in","إنش / in"]], U().len, 'data-act="unit" data-kind="len" data-v="%v"')+
    '</div>'+
    '<div class="grid grid-cols-2 gap-3">'+
      '<div class="col-span-2">'+field("f-birth", en?"Birth date":"تاريخ الميلاد", p.birth || "", age ? (ar(age)+(en?" yrs":" سنة")) : "", "date")+'</div>'+
      field("f-height", en?"Height":"الطول", p.height ? dec(showLen(+p.height),0) : "", lenU())+
      field("f-weight", en?"Weight":"الوزن الحالي", p.weight ? dec(showMass(+p.weight),1) : "", massU())+
      '<div class="col-span-2">'+field("f-target", en?"Target weight":"الوزن المستهدف", p.target ? dec(showMass(+p.target),1) : "", massU())+'</div>'+
    '</div>'+
    '<div>'+label(en?"Activity":"مستوى النشاط")+
    '<div class="rounded-2xl bg-surface-container divide-y divide-outline-variant/40 mt-2">'+
      ACTS.map(function(a){
        var on = (p.activity || "light") === a[0];
        return '<button data-act="activity" data-v="'+a[0]+'" class="tap w-full flex items-center justify-between px-4 py-3.5 text-start">'+
          '<div><div class="font-label-lg text-label-lg text-on-surface">'+a[1]+'</div>'+
          '<div class="font-label-sm text-label-sm text-on-surface-variant">PAL '+a[2]+'</div></div>'+
          '<div class="w-6 h-6 rounded-full '+(on?"bg-primary-fixed text-on-primary-fixed":"bg-surface-container-high")+' flex items-center justify-center">'+
          (on?'<span class="material-symbols-outlined text-[14px]">check</span>':"")+'</div></button>';
      }).join("")+'</div></div>'+
    card('<div class="flex items-center justify-between"><span class="font-label-lg text-label-lg text-on-surface">'+(en?"Your target":"هدفك")+'</span>'+
      '<span class="font-headline-md text-headline-md text-on-surface tabular-nums">'+arGroup(plan().kcal)+'</span></div>'+
      '<div class="font-label-sm text-label-sm text-on-surface-variant mt-1">'+(en?"BMR ":"أيض أساسي ")+arGroup(plan().bmr)+
      (en?" · TDEE ":" · مصروف ")+arGroup(plan().tdee)+'</div>', "border border-primary-fixed/40")+
    btn(en?"Save and continue":"احفظ وتابع", 'data-act="savebody"', "bg-primary-fixed text-on-primary-fixed w-full")+
  '</div>';
}


/* ===================== activities: not just iron ===================== */
var ACT_LIB = [
  {id:"gym",   ar:"حديد",        en:"Weights",   met:5.0, unit:"session", icon:"fitness_center"},
  {id:"run",   ar:"ركض",         en:"Running",   met:9.8, unit:"min",     icon:"directions_run"},
  {id:"walk",  ar:"مشي",         en:"Walking",   met:3.5, unit:"min",     icon:"directions_walk"},
  {id:"swim",  ar:"سباحة",       en:"Swimming",  met:7.0, unit:"min",     icon:"pool"},
  {id:"bike",  ar:"دراجة",       en:"Cycling",   met:7.5, unit:"min",     icon:"pedal_bike"},
  {id:"cross", ar:"كروسفت",      en:"CrossFit",  met:8.0, unit:"min",     icon:"sports_gymnastics"},
  {id:"box",   ar:"ملاكمة",      en:"Boxing",    met:9.0, unit:"min",     icon:"sports_mma"},
  {id:"foot",  ar:"كرة قدم",     en:"Football",  met:7.0, unit:"min",     icon:"sports_soccer"},
  {id:"pad",   ar:"بادل / تنس",  en:"Padel",     met:6.5, unit:"min",     icon:"sports_tennis"},
  {id:"yoga",  ar:"يوغا / إطالة", en:"Yoga",      met:3.0, unit:"min",     icon:"self_improvement"},
  {id:"row",   ar:"تجديف",       en:"Rowing",    met:7.0, unit:"min",     icon:"rowing"},
  {id:"hike",  ar:"هايكنق",      en:"Hiking",    met:6.0, unit:"min",     icon:"hiking"}
];
var ACT_BY_ID = {}; ACT_LIB.forEach(function(a){ ACT_BY_ID[a.id] = a; });
function myActivities(){
  if (!S.activities) S.activities = [{ id:"gym", perWeek:4 }];
  return S.activities;
}
function actInfo(id){
  var c = (S.customActs || {})[id];
  return c || ACT_BY_ID[id] || { id:id, ar:id, en:id, met:5, unit:"min", icon:"exercise" };
}
function weekStart(){
  var d = new Date(); d.setHours(0,0,0,0);
  d.setDate(d.getDate() - ((d.getDay() + 1) % 7));   // week starts Saturday
  return d.getTime();
}
function sessionsThisWeek(){
  var w = weekStart();
  return (S.sessions || []).filter(function(s){ return (s.t || 0) >= w; });
}
function burnToday(){
  var t0 = new Date(); t0.setHours(0,0,0,0);
  var fromSessions = (S.sessions || []).filter(function(s){ return (s.t||0) >= t0.getTime(); })
    .reduce(function(a, s){ return a + (s.kcal || 0); }, 0);
  return Math.round(fromSessions + (day().steps || 0) * 0.04);
}
function metKcal(met, minutes){
  var w = +S.profile.weight || 80;
  return Math.round(met * w * (minutes / 60));
}

/* ===================== MY PROGRAM ===================== */
function program(){
  if (!S.program){
    var n = suggestedDays();
    S.program = { perWeek:n, on: WEEK_SHAPES[n].slice(),
                  days: DAY_TEMPLATES[n].map(function(d){ return { ar:d[0], en:d[1], ex:[] }; }) };
  }
  if (!S.program.on) S.program.on = (WEEK_SHAPES[S.program.perWeek] || WEEK_SHAPES[4]).slice();
  return S.program;
}
function suggestedDays(){                       /* from the activity level you picked at signup */
  var a = S.profile.activity;
  return a === "high" ? 5 : a === "moderate" ? 4 : 3;
}
function reflow(pr){                            /* names follow the split, your exercises stay put */
  var n = Math.max(1, Math.min(7, pr.on.length));
  var tpl = DAY_TEMPLATES[n];
  pr.perWeek = n;
  pr.days = tpl.map(function(t, i){ return { ar:t[0], en:t[1], ex: (pr.days[i] && pr.days[i].ex) || [] }; });
}
function vWorkouts(){
  var en = S.lang === "en", tab = S.wkTab || "week";
  return '<div class="flex flex-col gap-4 pt-1">'+
    '<div><div class="font-headline-md text-headline-md text-on-surface">'+(en?"Training":"التمارين")+'</div>'+
    label(en?"Your week, your activities, your program":"أسبوعك، أنشطتك، برنامجك")+'</div>'+
    seg([["week", en?"Week":"أسبوعي"],["acts", en?"Activities":"أنشطتي"],
         ["prog", en?"Program":"برنامجي"],["log", en?"History":"السجل"]],
        tab, 'data-act="wktab" data-v="%v"')+
    (tab === "acts" ? wkActs(en) : tab === "prog" ? wkProg(en) : tab === "log" ? wkLog(en) : wkWeek(en))+
  '</div>';
}

/* ---- tab 1: the week at a glance ---- */
function wkWeek(en){
  var acts = myActivities(), week = sessionsThisWeek();
  var target = acts.reduce(function(a, x){ return a + (+x.perWeek || 0); }, 0);
  var done = week.length;
  var vol = week.reduce(function(a, s){ return a + (s.volume || 0); }, 0);
  var kcal = week.reduce(function(a, s){ return a + (s.kcal || 0); }, 0);
  var adh = target ? Math.min(100, Math.round(done / target * 100)) : 0;
  var perDay = [0,0,0,0,0,0,0], today = (new Date().getDay() + 1) % 7;
  week.forEach(function(s){ var d = new Date(s.t || Date.now()); perDay[(d.getDay()+1)%7]++; });
  var peak = Math.max.apply(null, perDay) || 1;
  var pr = program();

  return card(
    '<div class="flex items-center justify-between gap-4">'+
      ringSvg(target ? done/target : 0, ar(done), (en?"of ":"من ")+ar(target)+(en?" sessions":" جلسات"))+
      '<div class="flex-1 flex flex-col gap-3">'+
        miniRow(en?"Adherence":"الالتزام", ar(adh)+"٪", adh >= 80 ? "text-primary-fixed" : "text-on-surface")+
        '<div class="h-px bg-outline-variant/50"></div>'+
        miniRow(en?"Volume":"الحمل", arGroup(vol)+(en?" kg":" كجم"), "text-on-surface")+
        '<div class="h-px bg-outline-variant/50"></div>'+
        miniRow(en?"Burned":"المحروق", arGroup(kcal)+(en?" kcal":" سعرة"), "text-primary-fixed")+
      '</div>'+
    '</div>'+
    '<div class="mt-4 pt-3 border-t border-outline-variant/40 flex items-end justify-between gap-1.5" style="height:56px">'+
      perDay.map(function(n, i){
        var hgt = n ? Math.max(12, Math.round(n / peak * 32)) : 5;
        return '<div class="flex-1 flex flex-col items-center gap-1.5">'+
          '<div class="w-2.5 rounded-full '+(n ? "bg-primary-fixed" : "bg-surface-container-highest")+'" style="height:'+hgt+'px"></div>'+
          '<span class="font-label-sm text-label-sm '+(i === today ? "text-on-surface" : "text-on-surface-variant")+'">'+(en?WEEK_ENS[i]:WEEK_ARS[i])+'</span></div>';
      }).join("")+
    '</div>')+

    /* what today asks of you */
    todayCard(en, pr)+

    (acts.length ? btn((en?"Log a session":"سجّل جلسة"), 'data-act="quicklog"', "bg-primary-fixed text-on-primary-fixed w-full") : "")+

    card('<div class="flex items-center gap-3">'+
      '<span class="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">'+
        '<span class="material-symbols-outlined text-[18px]">sports</span></span>'+
      '<div class="flex-1 min-w-0"><div class="font-label-lg text-label-lg text-on-surface">'+(en?"Have a coach?":"عندك مدرّب؟")+'</div>'+
      '<div class="font-label-sm text-label-sm text-on-surface-variant">'+(en?"Their plan shows up here too":"خطته تظهر هنا كمان")+'</div></div>'+
      '<button data-go="workouts_stitch" class="tap px-3 h-10 rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg shrink-0">'+(en?"View":"اعرض")+'</button></div>');
}
function todayCard(en, pr){
  var wd = (new Date().getDay() + 1) % 7, k = pr.on.indexOf(wd);
  if (k < 0) return card('<div class="flex items-center gap-3">'+
    '<span class="w-10 h-10 rounded-xl bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">'+
      '<span class="material-symbols-outlined text-[18px]">bedtime</span></span>'+
    '<div class="flex-1 min-w-0"><div class="font-label-lg text-label-lg text-on-surface">'+(en?"Today is a rest day":"اليوم راحة")+'</div>'+
    '<div class="font-label-sm text-label-sm text-on-surface-variant">'+(en?"Walk, stretch, sleep well.":"امشِ، مدّد، ونم زين.")+'</div></div>'+
    '<button data-act="wktab" data-v="prog" class="tap px-3 h-10 rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg shrink-0">'+(en?"Plan":"الجدول")+'</button></div>');
  var d = pr.days[k];
  return card('<div class="flex items-center gap-3">'+
    '<span class="w-10 h-10 rounded-xl bg-primary-fixed/15 text-primary-fixed flex items-center justify-center shrink-0">'+
      '<span class="material-symbols-outlined text-[18px]">fitness_center</span></span>'+
    '<div class="flex-1 min-w-0"><div class="font-label-lg text-label-lg text-on-surface truncate">'+(en?("Today · "+d.en):("اليوم · "+d.ar))+'</div>'+
    '<div class="font-label-sm text-label-sm text-on-surface-variant truncate">'+
      (d.ex.length ? ar(d.ex.length)+(en?" exercises":" تمارين") : (en?"nothing planned yet":"ما أضفت تمارين"))+'</div></div>'+
    (d.ex.length
      ? '<button data-act="startday" data-d="'+k+'" class="tap px-3 h-10 rounded-xl bg-primary-fixed text-on-primary-fixed font-label-lg text-label-lg shrink-0">'+(en?"Start":"ابدأ")+'</button>'
      : '<button data-act="wktab" data-v="prog" class="tap px-3 h-10 rounded-xl bg-surface-container-high text-on-surface font-label-lg text-label-lg shrink-0">'+(en?"Build":"رتّبه")+'</button>')+
    '</div>', "border border-primary-fixed/40");
}
function miniRow(l, v, tone){
  return '<div class="flex items-center justify-between">'+
    '<span class="font-label-sm text-label-sm text-on-surface-variant">'+l+'</span>'+
    '<span class="font-title-md text-title-md tabular-nums '+(tone||"text-on-surface")+'">'+v+'</span></div>';
}

/* ---- tab 2: my activities ---- */
function wkActs(en){
  var acts = myActivities(), week = sessionsThisWeek();
  return '<div class="flex items-center justify-between">'+
      '<span class="font-title-md text-title-md text-on-surface">'+(en?"My activities":"أنشطتي")+'</span>'+
      '<button data-act="pickact" class="tap flex items-center gap-1 font-label-lg text-label-lg text-primary-fixed">'+
        '<span class="material-symbols-outlined text-[18px]">add</span>'+(en?"Add":"أضف")+'</button></div>'+
    label(en?"Everything you do, with a weekly target each":"كل شي تسويه، ولكل واحد هدف أسبوعي")+
    (acts.length ? '<div class="rounded-2xl bg-surface-container divide-y divide-outline-variant/40">'+
      acts.map(function(a, i){
        var info = actInfo(a.id);
        var doneA = week.filter(function(s){ return s.act === a.id; }).length;
        var hit = a.perWeek && doneA >= a.perWeek;
        return '<button data-act="actsheet" data-i="'+i+'" class="tap w-full text-start px-4 py-3 flex items-center gap-3">'+
          '<span class="w-10 h-10 rounded-xl '+(hit?"bg-primary-fixed text-on-primary-fixed":"bg-primary-fixed/15 text-primary-fixed")+' flex items-center justify-center shrink-0">'+
            '<span class="material-symbols-outlined text-[18px]">'+info.icon+'</span></span>'+
          '<span class="flex-1 min-w-0">'+
            '<span class="flex items-baseline justify-between gap-2">'+
              '<span class="font-label-lg text-label-lg text-on-surface truncate">'+(en?info.en:info.ar)+'</span>'+
              '<span class="font-label-sm text-label-sm tabular-nums shrink-0 '+(hit?"text-primary-fixed":"text-on-surface-variant")+'">'+ar(doneA)+(en?" of ":" من ")+ar(a.perWeek)+'</span></span>'+
            '<span class="block mt-1.5">'+bar(doneA, Math.max(1, a.perWeek), "primary-fixed")+'</span>'+
          '</span>'+
          '<span class="material-symbols-outlined text-[18px] text-on-surface-variant rtl:rotate-180 shrink-0">chevron_right</span>'+
        '</button>';
      }).join("")+'</div>'
      : card('<div class="text-center py-2">'+
          '<div class="font-label-lg text-label-lg text-on-surface">'+(en?"Nothing tracked yet":"ما عندك أنشطة")+'</div>'+
          '<div class="font-label-sm text-label-sm text-on-surface-variant mt-1">'+(en?"Iron, swimming, running — add what you actually do.":"حديد، سباحة، ركض — أضف اللي تسويه فعلاً.")+'</div></div>'))+
    (acts.length ? btn((en?"Log a session":"سجّل جلسة"), 'data-act="quicklog"', "bg-primary-fixed text-on-primary-fixed w-full") : "");
}

/* ---- tab 3: the weekly schedule, training days and rest days ---- */
function wkProg(en){
  var pr = program(), on = pr.on, open = (S.openDay == null) ? -1 : S.openDay;
  var off = 7 - on.length;
  return card(
    '<div class="flex items-center justify-between">'+
      '<span class="font-title-md text-title-md text-on-surface">'+(en?"Your week":"جدول أسبوعك")+'</span>'+
      '<span class="font-label-sm text-label-sm text-on-surface-variant">'+
        (en ? (ar(on.length)+" training, "+ar(off)+" rest") : (ar(on.length)+" أيام تمرين و"+ar(off)+" راحة"))+'</span></div>'+
    '<div class="mt-3">'+label(en?"How many days a week":"كم يوم بالأسبوع")+
      '<div class="flex gap-1.5 mt-1.5">'+[1,2,3,4,5,6,7].map(function(n){
        var sel = n === on.length;
        return '<button data-act="perweek" data-v="'+n+'" class="tap flex-1 h-10 rounded-xl font-label-lg text-label-lg tabular-nums '+
          (sel ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-high text-on-surface-variant")+'">'+ar(n)+'</button>';
      }).join("")+'</div></div>'+
    '<div class="mt-3">'+label(en?"Which days you train":"متى تتمرّن")+
      '<div class="flex gap-1.5 mt-1.5">'+[0,1,2,3,4,5,6].map(function(i){
        var sel = on.indexOf(i) >= 0;
        return '<button data-act="togday" data-d="'+i+'" class="tap flex-1 h-12 rounded-xl font-label-lg text-label-lg '+
          (sel ? "bg-primary-fixed text-on-primary-fixed" : "bg-surface-container-high text-on-surface-variant")+'">'+
          (en?WEEK_ENS[i]:WEEK_ARS[i])+'</button>';
      }).join("")+'</div>'+
      '<div class="mt-2 font-label-sm text-label-sm text-on-surface-variant">'+
        (en?"Tap a day to flip it between training and rest — the splits rearrange themselves.":"اضغط أي يوم يصير تمرين أو راحة — والتقسيمة ترتّب نفسها.")+'</div></div>')+

    '<div class="rounded-2xl bg-surface-container divide-y divide-outline-variant/40 overflow-hidden">'+
    [0,1,2,3,4,5,6].map(function(wd){
      var k = on.indexOf(wd), name = en ? WEEK_EN[wd] : WEEK_AR[wd];
      if (k < 0){
        return '<button data-act="togday" data-d="'+wd+'" class="tap w-full flex items-center gap-3 px-4 py-3 text-start">'+
          '<span class="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">'+
            '<span class="material-symbols-outlined text-[16px]">bedtime</span></span>'+
          '<span class="flex-1 font-label-lg text-label-lg text-on-surface-variant">'+name+'</span>'+
          '<span class="font-label-sm text-label-sm text-on-surface-variant shrink-0">'+(en?"Rest":"راحة")+'</span></button>';
      }
      var d = pr.days[k], isOpen = k === open;
      var summary = d.ex.length
        ? ar(d.ex.length)+(en?" exercises · ":" تمارين · ")+d.ex.slice(0,2).map(function(e){ return en?e.en:e.ar; }).join(" · ")
        : (en?"nothing planned yet":"ما أضفت تمارين");
      return '<div>'+
        '<button data-act="expday" data-d="'+k+'" class="tap w-full px-4 py-3 flex items-center gap-3 text-start">'+
          '<span class="w-8 h-8 rounded-lg '+(d.ex.length?"bg-primary-fixed/15 text-primary-fixed":"bg-surface-container-high text-on-surface-variant")+' flex items-center justify-center font-label-sm text-label-sm shrink-0">'+ar(k+1)+'</span>'+
          '<span class="flex-1 min-w-0"><span class="block font-label-lg text-label-lg text-on-surface truncate">'+name+' · '+(en?d.en:d.ar)+'</span>'+
          '<span class="block font-label-sm text-label-sm text-on-surface-variant truncate">'+summary+'</span></span>'+
          '<span class="material-symbols-outlined text-[18px] text-on-surface-variant shrink-0 '+(isOpen?"rotate-180":"")+'">expand_more</span>'+
        '</button>'+
        (isOpen ?
          (d.ex.length ? d.ex.map(function(e, j){
            return '<div class="flex items-center justify-between ps-4 pe-3 py-2.5 border-t border-outline-variant/40 bg-surface-container-low">'+
              '<div class="min-w-0"><div class="font-label-lg text-label-lg text-on-surface truncate">'+(en?e.en:e.ar)+'</div>'+
              '<div class="font-label-sm text-label-sm text-on-surface-variant tabular-nums">'+ar(e.sets)+(en?" sets × ":" جولات × ")+ar(e.reps)+(en?" reps":" تكرار")+'</div></div>'+
              '<button data-act="delex" data-d="'+k+'" data-j="'+j+'" class="tap w-9 h-9 rounded-lg text-on-surface-variant flex items-center justify-center shrink-0">'+
              '<span class="material-symbols-outlined text-[16px]">close</span></button></div>';
          }).join("") : "")+
          '<div class="flex gap-2 p-3 border-t border-outline-variant/40 bg-surface-container-low">'+
            '<button data-act="addex" data-d="'+k+'" class="tap flex-1 h-11 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center gap-1.5 font-label-lg text-label-lg">'+
              '<span class="material-symbols-outlined text-[18px]">add</span>'+(en?"Add exercise":"أضف تمرين")+'</button>'+
            (d.ex.length ? '<button data-act="startday" data-d="'+k+'" class="tap flex-1 h-11 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center gap-1.5 font-label-lg text-label-lg">'+
              '<span class="material-symbols-outlined text-[18px]">play_arrow</span>'+(en?"Start":"ابدأ")+'</button>' : "")+
          '</div>' : "")+
      '</div>';
    }).join("")+'</div>';
}

/* ---- tab 3: everything you have logged ---- */
function wkLog(en){
  var all = (S.sessions || []).slice().reverse();
  if (!all.length) return card('<div class="text-center py-4">'+
    '<div class="font-label-lg text-label-lg text-on-surface">'+(en?"No sessions yet":"ما فيه جلسات")+'</div>'+
    '<div class="font-label-sm text-label-sm text-on-surface-variant mt-1">'+(en?"Your first logged session lands here.":"أول جلسة تسجّلها تظهر هنا.")+'</div></div>');
  var kcal = all.reduce(function(a, s){ return a + (s.kcal||0); }, 0);
  var mins = all.reduce(function(a, s){ return a + (s.min||0); }, 0);
  return card('<div class="flex items-center justify-between gap-2">'+
      stat(en?"Sessions":"جلسات", ar(all.length))+
      stat(en?"Minutes":"دقائق", arGroup(mins))+
      stat(en?"Burned":"المحروق", arGroup(kcal), "text-primary-fixed")+'</div>')+
    '<div class="rounded-2xl bg-surface-container divide-y divide-outline-variant/40">'+
    all.slice(0, 30).map(function(s, i){
      var info = actInfo(s.act || "gym");
      var meta = [s.d];
      if (s.min) meta.push(ar(s.min)+(en?" min":" دقيقة"));
      if (s.volume) meta.push(arGroup(s.volume)+(en?" kg":" كجم"));
      if (s.km) meta.push(arDec(s.km,1)+(en?" km":" كم"));
      return '<div class="flex items-center gap-3 px-4 py-3">'+
        '<span class="w-9 h-9 rounded-xl bg-surface-container-high text-on-surface-variant flex items-center justify-center shrink-0">'+
          '<span class="material-symbols-outlined text-[17px]">'+info.icon+'</span></span>'+
        '<div class="flex-1 min-w-0"><div class="font-label-lg text-label-lg text-on-surface truncate">'+(en?(s.en||info.en):(s.ar||info.ar))+'</div>'+
        '<div class="font-label-sm text-label-sm text-on-surface-variant truncate">'+meta.join(" · ")+'</div></div>'+
        '<span class="font-label-lg text-label-lg text-primary-fixed tabular-nums shrink-0">'+(s.kcal?arGroup(s.kcal):"—")+'</span>'+
        '<button data-act="delsession" data-i="'+(S.sessions.length-1-i)+'" class="tap w-8 h-8 rounded-lg text-on-surface-variant flex items-center justify-center shrink-0">'+
          '<span class="material-symbols-outlined text-[15px]">close</span></button></div>';
    }).join("")+'</div>';
}

/* ---- adding an activity: pick the weekly target before it lands ---- */
function newActSheet(){
  var en = S.lang === "en", info = actInfo(S.newAct), per = +S.newPer || 3;
  openPanel(
    '<div class="flex items-center gap-3 mb-4">'+
      '<span class="w-11 h-11 rounded-xl bg-primary-fixed/15 text-primary-fixed flex items-center justify-center shrink-0">'+
        '<span class="material-symbols-outlined text-[20px]">'+info.icon+'</span></span>'+
      '<div class="flex-1 min-w-0"><div class="font-title-md text-title-md text-on-surface truncate">'+(en?info.en:info.ar)+'</div>'+
      '<div class="font-label-sm text-label-sm text-on-surface-variant">'+(en?"Set your weekly target":"حدّد هدفك الأسبوعي")+'</div></div></div>'+
    '<div class="rounded-2xl bg-surface-container-high p-4">'+
      '<div class="font-label-sm text-label-sm text-on-surface-variant text-center">'+(en?"Times per week":"كم مرة بالأسبوع")+'</div>'+
      '<div class="flex items-center justify-center gap-6 mt-1">'+
        '<button data-act="newminus" class="tap w-11 h-11 rounded-xl bg-surface-container text-on-surface font-title-md text-title-md">−</button>'+
        '<span class="font-metric-display-mobile text-metric-display-mobile font-bold text-on-surface tabular-nums w-12 text-center">'+ar(per)+'</span>'+
        '<button data-act="newplus" class="tap w-11 h-11 rounded-xl bg-primary-fixed text-on-primary-fixed font-title-md text-title-md">+</button>'+
      '</div></div>'+
    '<div class="mt-3">'+btn(en?"Add activity":"أضف النشاط", 'data-act="confirmact"', "bg-primary-fixed text-on-primary-fixed w-full")+'</div>');
}

/* ---- one sheet per activity: target, log, remove ---- */
function actSheet(i){
  var en = S.lang === "en", a = myActivities()[i];
  if (!a) return;
  var info = actInfo(a.id);
  var doneA = sessionsThisWeek().filter(function(s){ return s.act === a.id; }).length;
  openPanel(
    '<div class="flex items-center gap-3 mb-4">'+
      '<span class="w-11 h-11 rounded-xl bg-primary-fixed/15 text-primary-fixed flex items-center justify-center shrink-0">'+
        '<span class="material-symbols-outlined text-[20px]">'+info.icon+'</span></span>'+
      '<div class="flex-1 min-w-0"><div class="font-title-md text-title-md text-on-surface truncate">'+(en?info.en:info.ar)+'</div>'+
      '<div class="font-label-sm text-label-sm text-on-surface-variant">'+(en?("done "+ar(doneA)+" of "+ar(a.perWeek)+" this week"):("سويت "+ar(doneA)+" من "+ar(a.perWeek)+" هذا الأسبوع"))+'</div></div></div>'+
    '<div class="rounded-2xl bg-surface-container-high p-4">'+
      '<div class="font-label-sm text-label-sm text-on-surface-variant text-center">'+(en?"Times per week":"كم مرة بالأسبوع")+'</div>'+
      '<div class="flex items-center justify-center gap-6 mt-1">'+
        '<button data-act="actminus" data-i="'+i+'" class="tap w-11 h-11 rounded-xl bg-surface-container text-on-surface font-title-md text-title-md">−</button>'+
        '<span class="font-metric-display-mobile text-metric-display-mobile font-bold text-on-surface tabular-nums w-12 text-center">'+ar(a.perWeek)+'</span>'+
        '<button data-act="actplus" data-i="'+i+'" class="tap w-11 h-11 rounded-xl bg-primary-fixed text-on-primary-fixed font-title-md text-title-md">+</button>'+
      '</div>'+
      '<div class="mt-3">'+bar(doneA, Math.max(1, a.perWeek), "primary-fixed")+'</div>'+
    '</div>'+
    '<div class="mt-3">'+btn(a.id === "gym" ? (en?"Open the program":"افتح البرنامج") : (en?"Log a session":"سجّل جلسة"),
      a.id === "gym" ? 'data-act="openprog"' : 'data-act="logact" data-id="'+a.id+'"',
      "bg-primary-fixed text-on-primary-fixed w-full")+'</div>'+
    '<div class="mt-2">'+btn(en?"Remove activity":"احذف النشاط", 'data-act="delact" data-i="'+i+'"',
      "bg-surface-container-high text-on-surface-variant w-full")+'</div>');
}
/* ===================== LIVE SESSION ===================== */
var TIMER = { id:null, restLeft:0, restOf:90 };
function mmss(ms){
  var t = Math.max(0, Math.round(ms/1000)), m = Math.floor(t/60), sec = t%60;
  var str = m+":"+(sec<10?"0":"")+sec;
  return S.lang === "en" ? str : str.replace(/[0-9]/g, function(d){ return AR[+d]; });
}
function sessionTimer(){
  if (TIMER.id) return;
  TIMER.id = setInterval(function(){
    if (current !== "session"){ clearInterval(TIMER.id); TIMER.id = null; TIMER.restLeft = 0; return; }
    var c = document.getElementById("sess-clock");
    if (c && S.sessionStart) c.textContent = mmss(Date.now() - S.sessionStart);
    if (TIMER.restLeft > 0){
      TIMER.restLeft--;
      paintRest();
      if (TIMER.restLeft === 0){
        try { if (navigator.vibrate) navigator.vibrate([120,80,120]); } catch(err){}
        toast(S.lang === "en" ? "Rest over — next set" : "خلصت الراحة — الجولة الجاية");
      }
    }
  }, 1000);
}
function paintRest(){
  var bar = document.getElementById("rest-bar"), gap = document.getElementById("rest-space");
  if (!bar) return;
  if (TIMER.restLeft <= 0){
    bar.classList.add("hidden"); if (gap) gap.classList.add("hidden"); return;
  }
  bar.classList.remove("hidden"); if (gap) gap.classList.remove("hidden");
  var t = document.getElementById("rest-left");
  if (t) t.textContent = mmss(TIMER.restLeft * 1000);
  var f = document.getElementById("rest-fill");
  if (f) f.style.width = (TIMER.restLeft / (TIMER.restOf || 90) * 100).toFixed(1)+"%";
}
function restBar(en){
  var on = TIMER.restLeft > 0;
  return '<div id="rest-bar" class="fixed inset-x-0 bottom-28 z-40 px-gutter '+(on?"":"hidden")+'">'+
    '<div class="max-w-3xl mx-auto rounded-2xl bg-primary-container text-on-primary-container p-3 shadow-lg">'+
      '<div class="flex items-center gap-3">'+
        '<span class="w-10 h-10 rounded-xl bg-on-primary-container/15 flex items-center justify-center shrink-0">'+
          '<span class="material-symbols-outlined text-[20px]">timer</span></span>'+
        '<div class="flex-1 min-w-0"><div class="font-label-sm text-label-sm opacity-80">'+(en?"Rest":"راحة")+'</div>'+
          '<div id="rest-left" class="font-title-md text-title-md tabular-nums">'+mmss(TIMER.restLeft*1000)+'</div></div>'+
        '<button data-act="rest15" class="tap px-3 h-10 rounded-xl bg-on-primary-container/15 font-label-lg text-label-lg shrink-0">+'+ar(15)+(en?"s":"ث")+'</button>'+
        '<button data-act="restskip" class="tap px-3 h-10 rounded-xl bg-on-primary-container text-primary-container font-label-lg text-label-lg shrink-0">'+(en?"Skip":"تخطّي")+'</button>'+
      '</div>'+
      '<div class="mt-2 h-1.5 rounded-full bg-on-primary-container/20 overflow-hidden">'+
        '<div id="rest-fill" class="h-full rounded-full bg-on-primary-container" style="width:'+(on ? (TIMER.restLeft/(TIMER.restOf||90)*100).toFixed(1) : "0")+'%"></div></div>'+
    '</div></div>';
}
function exKey(e){ return e.ar || e.en; }
function lastNote(e, en){
  var l = (S.exLast || {})[exKey(e)];
  if (!l || !l.w) return "";
  return (en ? "last " : "آخر مرة ")+arDec(showMass(+l.w),1)+" "+massU()+" × "+ar(l.r);
}
function vSession(){
  var en = S.lang === "en", pr = program(), i = S.sessionDay || 0, d = pr.days[i] || pr.days[0];
  S.sessionLog = S.sessionLog || {};
  if (!S.sessionStart) S.sessionStart = Date.now();
  S.restOf = S.restOf || 90; TIMER.restOf = S.restOf;
  sessionTimer();

  if (!d || !d.ex.length){
    return '<div class="flex flex-col gap-4 pt-1">'+
      card('<div class="text-center py-3">'+
        '<div class="font-label-lg text-label-lg text-on-surface">'+(en?"This day has no exercises":"هذا اليوم ما فيه تمارين")+'</div>'+
        '<div class="font-label-sm text-label-sm text-on-surface-variant mt-1">'+(en?"Add them to your program first.":"أضفها لبرنامجك أول.")+'</div></div>')+
      btn(en?"Back to the program":"ارجع للبرنامج", 'data-act="backprog"', "bg-primary-fixed text-on-primary-fixed w-full")+'</div>';
  }

  d.ex.forEach(function(e, j){
    if (!S.sessionLog[j]) S.sessionLog[j] = Array.apply(null, Array(e.sets)).map(function(){ return { w:"", r:e.reps, done:false }; });
  });
  var totalSets = 0, doneSets = 0, vol = 0;
  d.ex.forEach(function(e, j){
    (S.sessionLog[j]||[]).forEach(function(st){ totalSets++; if (st.done){ doneSets++; vol += (+st.w||0)*(+st.r||0); } });
  });
  var idx = Math.max(0, Math.min(S.exIdx || 0, d.ex.length - 1));
  var e = d.ex[idx], sets = S.sessionLog[idx] || [];
  var exDone = sets.length && sets.every(function(x){ return x.done; });
  var note = lastNote(e, en);
  var allDone = doneSets === totalSets;

  return '<div class="flex flex-col gap-4 pt-1">'+

    /* live header */
    card('<div class="flex items-center justify-between gap-3">'+
        '<div class="min-w-0"><div class="font-title-md text-title-md text-on-surface truncate">'+(en?d.en:d.ar)+'</div>'+
        '<div class="font-label-sm text-label-sm text-primary-fixed">'+(en?"Session running":"الجلسة شغّالة")+'</div></div>'+
        '<div id="sess-clock" class="font-metric-display-mobile text-metric-display-mobile font-bold text-on-surface tabular-nums shrink-0">'+
          mmss(Date.now() - S.sessionStart)+'</div></div>'+
      '<div class="grid grid-cols-2 gap-3 mt-3">'+
        '<div class="rounded-xl bg-surface-container-high p-3"><div class="font-label-sm text-label-sm text-on-surface-variant">'+(en?"Sets":"الجولات")+'</div>'+
          '<div class="font-title-md text-title-md text-on-surface tabular-nums">'+ar(doneSets)+(en?" of ":" من ")+ar(totalSets)+'</div></div>'+
        '<div class="rounded-xl bg-surface-container-high p-3"><div class="font-label-sm text-label-sm text-on-surface-variant">'+(en?"Volume":"الحمل")+'</div>'+
          '<div class="font-title-md text-title-md text-primary-fixed tabular-nums">'+arGroup(vol)+(en?" kg":" كجم")+'</div></div>'+
      '</div>'+
      '<div class="mt-3">'+bar(doneSets, Math.max(1, totalSets), "primary-fixed")+'</div>')+

    /* jump between exercises */
    '<div class="flex gap-2 overflow-x-auto -mx-gutter px-gutter pb-1">'+
      d.ex.map(function(x, j){
        var st = S.sessionLog[j] || [], fin = st.length && st.every(function(y){ return y.done; });
        var on = j === idx;
        return '<button data-act="goex" data-i="'+j+'" class="tap shrink-0 h-10 px-3 rounded-xl flex items-center gap-1.5 font-label-lg text-label-lg '+
          (on ? "bg-primary-fixed text-on-primary-fixed" : fin ? "bg-primary-fixed/15 text-primary-fixed" : "bg-surface-container text-on-surface-variant")+'">'+
          (fin && !on ? '<span class="material-symbols-outlined text-[15px]">check</span>' : '<span class="tabular-nums">'+ar(j+1)+'</span>')+
          '<span class="max-w-[7rem] truncate">'+(en?x.en:x.ar)+'</span></button>';
      }).join("")+
    '</div>'+

    /* the exercise you are on */
    '<div class="rounded-2xl bg-surface-container overflow-hidden">'+
      '<div class="flex items-start justify-between gap-2 px-4 pt-4 pb-3">'+
        '<div class="min-w-0">'+
          '<div class="font-title-md text-title-md text-on-surface truncate">'+(en?e.en:e.ar)+'</div>'+
          '<div class="font-label-sm text-label-sm text-on-surface-variant truncate">'+
            (en?("Exercise "+ar(idx+1)+" of "+ar(d.ex.length)):("التمرين "+ar(idx+1)+" من "+ar(d.ex.length)))+
            (note ? " · "+note : "")+'</div></div>'+
        '<div class="flex gap-1 shrink-0">'+
          '<button data-act="exnav" data-v="-1" class="tap w-10 h-10 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center'+(idx?"":" opacity-40")+'">'+
            '<span class="material-symbols-outlined text-[18px] rtl:rotate-180">chevron_left</span></button>'+
          '<button data-act="exnav" data-v="1" class="tap w-10 h-10 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center'+(idx < d.ex.length-1?"":" opacity-40")+'">'+
            '<span class="material-symbols-outlined text-[18px] rtl:rotate-180">chevron_right</span></button>'+
        '</div></div>'+

      sets.map(function(st, k){
        return '<div class="flex items-center gap-2 px-3 py-2 border-t border-outline-variant/40 '+(st.done?"bg-primary-fixed/10":"")+'">'+
          '<span class="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-label-sm text-label-sm '+
            (st.done?"bg-primary-fixed text-on-primary-fixed":"bg-surface-container-high text-on-surface-variant")+'">'+ar(k+1)+'</span>'+
          '<div class="flex-1 grid grid-cols-2 gap-2">'+
            '<div class="rounded-xl bg-surface-container-high px-3 py-1.5">'+
              '<div class="font-label-sm text-label-sm text-on-surface-variant">'+massU()+'</div>'+
              '<input data-set="'+idx+'-'+k+'-w" value="'+st.w+'" inputmode="decimal" placeholder="—" '+
                'class="w-full bg-transparent border-0 p-0 font-title-md text-title-md text-on-surface focus:outline-none tabular-nums"></div>'+
            '<div class="rounded-xl bg-surface-container-high px-3 py-1.5">'+
              '<div class="font-label-sm text-label-sm text-on-surface-variant">'+(en?"reps":"تكرار")+'</div>'+
              '<input data-set="'+idx+'-'+k+'-r" value="'+st.r+'" inputmode="numeric" '+
                'class="w-full bg-transparent border-0 p-0 font-title-md text-title-md text-on-surface focus:outline-none tabular-nums"></div>'+
          '</div>'+
          '<button data-act="doneset" data-j="'+idx+'" data-k="'+k+'" class="tap w-11 h-11 rounded-xl shrink-0 flex items-center justify-center '+
            (st.done?"bg-primary-fixed text-on-primary-fixed":"bg-surface-container-high text-on-surface-variant")+'">'+
            '<span class="material-symbols-outlined text-[20px]">check</span></button>'+
          (sets.length > 1 ? '<button data-act="delset" data-j="'+idx+'" data-k="'+k+'" class="tap w-7 h-11 rounded-lg shrink-0 text-on-surface-variant flex items-center justify-center">'+
            '<span class="material-symbols-outlined text-[15px]">close</span></button>' : "")+
        '</div>';
      }).join("")+

      '<button data-act="addset" data-j="'+idx+'" class="tap w-full py-3 border-t border-outline-variant/40 text-primary-fixed font-label-lg text-label-lg flex items-center justify-center gap-1.5">'+
        '<span class="material-symbols-outlined text-[18px]">add</span>'+(en?"Add set":"أضف جولة")+'</button>'+

      '<div class="flex items-center gap-2 px-3 py-2.5 border-t border-outline-variant/40 bg-surface-container-low">'+
        '<span class="font-label-sm text-label-sm text-on-surface-variant shrink-0">'+(en?"Rest":"الراحة")+'</span>'+
        '<div class="flex-1 flex gap-1.5">'+[60,90,120,180].map(function(v){
          var on = v === S.restOf;
          return '<button data-act="restset" data-v="'+v+'" class="tap flex-1 h-9 rounded-lg font-label-sm text-label-sm tabular-nums '+
            (on?"bg-primary-fixed text-on-primary-fixed":"bg-surface-container-high text-on-surface-variant")+'">'+
            (v<60?ar(v)+(en?"s":"ث"):mmss(v*1000))+'</button>';
        }).join("")+'</div></div>'+
    '</div>'+

    (exDone && idx < d.ex.length - 1
      ? btn((en?"Next · ":"التالي · ")+(en?d.ex[idx+1].en:d.ex[idx+1].ar), 'data-act="exnav" data-v="1"', "bg-primary-fixed text-on-primary-fixed w-full")
      : "")+

    btn(en?"Finish session":"أنهِ الجلسة", 'data-act="finish"',
        (allDone ? "bg-primary-fixed text-on-primary-fixed w-full" : "bg-surface-container-high text-on-surface w-full"))+

    /* keeps the finish button clear of the rest bar */
    '<div id="rest-space" class="'+(TIMER.restLeft > 0 ? "" : "hidden")+'" style="height:104px"></div>'+
    restBar(en)+
  '</div>';
}

/* ===================== PROGRESS: weight · measurements · photos ===================== */
var PARTS = [["neck","الرقبة","Neck"],["shoulder","الكتف","Shoulder"],["chest","الصدر","Chest"],["arm","الذراع","Arm"],
             ["waist","الخصر","Waist"],["hip","الأرداف","Hips"],["thigh","الفخذ","Thigh"],["calf","السمانة","Calf"]];
function vProgress(){
  var en = S.lang === "en", tab = S.progTab || "weight";
  return '<div class="flex flex-col gap-4 pt-1">'+
    '<div><div class="font-headline-md text-headline-md text-on-surface">'+(en?"Progress":"التقدّم")+'</div>'+
    label(en?"Weight, measurements and photos — all yours to update":"وزنك ومقاساتك وصورك — تحدّثها بنفسك")+'</div>'+
    seg([["weight", en?"Weight":"الوزن"],["size", en?"Measurements":"المقاسات"],["photos", en?"Photos":"الصور"]], tab, 'data-act="progtab" data-v="%v"')+
    (tab === "weight" ? weightTab(en) : tab === "size" ? sizeTab(en) : photoTab(en))+
  '</div>';
}
function weightTab(en){
  var ws = S.weights || [];
  var cur = ws.length ? ws[ws.length-1] : null, prev = ws.length > 1 ? ws[ws.length-2] : null;
  var diff = (cur && prev) ? cur.kg - prev.kg : null;
  return card(
    '<div class="flex items-start justify-between">'+
      '<div><div class="font-label-sm text-label-sm text-on-surface-variant">'+(en?"Current weight":"وزنك الحالي")+'</div>'+
      '<div class="flex items-baseline gap-2"><span class="font-metric-display-mobile text-metric-display-mobile font-bold text-on-surface tabular-nums">'+
      (cur ? arDec(showMass(cur.kg),1) : "—")+'</span><span class="font-label-lg text-label-lg text-on-surface-variant">'+massU()+'</span></div>'+
      (prev ? '<div class="font-label-sm text-label-sm text-on-surface-variant mt-1">'+(en?"Previous: ":"السابق: ")+arDec(showMass(prev.kg),1)+' '+massU()+' · '+prev.d+'</div>' : "")+
      '</div>'+
      (diff !== null ? '<div class="px-3 py-1.5 rounded-lg '+(diff <= 0 ? "bg-primary-fixed/15 text-primary-fixed" : "bg-tertiary-container text-on-tertiary-container")+' font-label-lg text-label-lg tabular-nums">'+
        arDec(Math.abs(showMass(diff)),1)+(diff <= 0 ? "−" : "+")+' '+massU()+'</div>' : "")+
    '</div>'+
    '<div class="flex items-end gap-2 mt-4">'+
      '<div class="flex-1 rounded-xl bg-surface-container-high p-3">'+
        '<div class="font-label-sm text-label-sm text-on-surface-variant">'+(en?"New reading":"القراءة الجديدة")+'</div>'+
        '<div class="flex items-baseline gap-2"><input id="w-new" inputmode="decimal" value="'+(cur ? dec(showMass(cur.kg),1) : "")+'"'+
        ' class="w-full bg-transparent border-0 p-0 font-title-md text-title-md text-on-surface focus:outline-none tabular-nums">'+
        '<span class="font-label-sm text-label-sm text-on-surface-variant">'+massU()+'</span></div></div>'+
      btn(en?"Update":"حدّث", 'data-act="savew"', "bg-primary-fixed text-on-primary-fixed")+
    '</div>'+
    (ws.length ? '<div class="mt-4">'+sparkline(ws.map(function(x){ return x.kg; }))+'</div>' : "")+
    (ws.length ? '<div class="mt-3 divide-y divide-outline-variant/40">'+ws.slice().reverse().slice(0,6).map(function(x, i, arr){
      var p2 = arr[i+1], dd = p2 ? x.kg - p2.kg : null;
      return '<div class="flex items-center justify-between py-2.5">'+
        '<span class="font-label-lg text-label-lg text-on-surface-variant">'+x.d+'</span>'+
        '<div class="flex items-center gap-3"><span class="font-label-lg text-label-lg text-on-surface tabular-nums">'+arDec(showMass(x.kg),1)+' '+massU()+'</span>'+
        (dd !== null ? '<span class="w-14 text-start font-label-sm text-label-sm tabular-nums '+(dd<=0?"text-primary-fixed":"text-on-surface-variant")+'">'+arDec(Math.abs(showMass(dd)),1)+(dd<=0?"−":"+")+'</span>' : '<span class="w-14"></span>')+
        '</div></div>';
    }).join("")+'</div>' : '<div class="mt-3 font-label-sm text-label-sm text-on-surface-variant">'+(en?"No readings yet — your first one starts the chart.":"ما سجّلت وزن بعد — أول قراءة تبدأ المنحنى.")+'</div>'));
}
function sparkline(vals){
  if (vals.length < 2) return "";
  var w = 300, h = 60, min = Math.min.apply(null, vals), max = Math.max.apply(null, vals), pad = (max-min)||1;
  var pts = vals.map(function(v,i){ return [(i*(w-8)/(vals.length-1)+4).toFixed(1), (h-6-(v-min)/pad*(h-14)).toFixed(1)]; });
  return '<svg viewBox="0 0 '+w+' '+h+'" class="w-full" style="height:60px" aria-hidden="true">'+
    '<polyline points="'+pts.map(function(p){ return p.join(","); }).join(" ")+'" fill="none" stroke="rgb(var(--c-primary-fixed))" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'+
    '<circle cx="'+pts[pts.length-1][0]+'" cy="'+pts[pts.length-1][1]+'" r="3.5" fill="rgb(var(--c-primary-fixed))"/></svg>';
}
function sizeTab(en){
  var last = (S.measures && S.measures.length) ? S.measures[S.measures.length-1].v : {};
  var prev = (S.measures && S.measures.length > 1) ? S.measures[S.measures.length-2].v : {};
  return card(
    '<div class="flex items-center justify-between mb-3"><span class="font-title-md text-title-md text-on-surface">'+(en?"Today's measurements":"مقاسات اليوم")+'</span>'+
    '<span class="font-label-sm text-label-sm text-on-surface-variant">'+lenU()+'</span></div>'+
    '<div class="grid grid-cols-2 gap-2">'+PARTS.map(function(p){
      var v = last[p[0]], pv = prev[p[0]], d = (v != null && pv != null) ? v - pv : null;
      return '<div class="rounded-xl bg-surface-container-high p-3">'+
        '<div class="flex items-center justify-between"><span class="font-label-sm text-label-sm text-on-surface-variant">'+(en?p[2]:p[1])+'</span>'+
        (d !== null && d !== 0 ? '<span class="font-label-sm text-label-sm tabular-nums '+(d<0?"text-primary-fixed":"text-on-surface-variant")+'">'+arDec(Math.abs(showLen(d)),1)+(d<0?"−":"+")+'</span>' : "")+'</div>'+
        '<input data-m="'+p[0]+'" inputmode="decimal" value="'+(v != null ? dec(showLen(v),1) : "")+'" placeholder="—"'+
        ' class="w-full bg-transparent border-0 p-0 mt-1 font-title-md text-title-md text-on-surface focus:outline-none tabular-nums"></div>';
    }).join("")+'</div>'+
    '<div class="mt-3">'+btn(en?"Save measurements":"احفظ المقاسات", 'data-act="savemeasures"', "bg-primary-fixed text-on-primary-fixed w-full")+'</div>'+
    ((S.measures && S.measures.length) ? '<div class="mt-4 pt-3 border-t border-outline-variant/40">'+
      label(en?"History — every reading is kept":"السجل — كل قراءة محفوظة")+
      '<div class="mt-1 divide-y divide-outline-variant/40">'+
      S.measures.slice().reverse().slice(0, 8).map(function(m, i, arr){
        var older = arr[i+1];
        var cells = PARTS.filter(function(pp){ return m.v[pp[0]] != null; }).map(function(pp){
          var v = m.v[pp[0]], ov = older ? older.v[pp[0]] : null, dd = (ov != null) ? v - ov : null;
          return '<span class="font-label-sm text-label-sm text-on-surface-variant">'+(en?pp[2]:pp[1])+' '+
            '<span class="text-on-surface tabular-nums">'+arDec(showLen(v),1)+'</span>'+
            (dd ? ' <span class="tabular-nums '+(dd<0?"text-primary-fixed":"text-tertiary-fixed-dim")+'">'+
              arDec(Math.abs(showLen(dd)),1)+(dd<0?"−":"+")+'</span>' : "")+'</span>';
        }).join("");
        return '<div class="py-2.5">'+
          '<div class="flex items-center justify-between">'+
            '<span class="font-label-lg text-label-lg text-on-surface">'+m.d+'</span>'+
            '<button data-act="delmeasure" data-i="'+(S.measures.length-1-i)+'" class="tap w-8 h-8 rounded-lg bg-surface-container-high text-on-surface-variant flex items-center justify-center">'+
              '<span class="material-symbols-outlined text-[15px]">close</span></button></div>'+
          '<div class="mt-1 flex flex-wrap gap-x-3 gap-y-1">'+(cells || '<span class="font-label-sm text-label-sm text-on-surface-variant">—</span>')+'</div>'+
        '</div>';
      }).join("")+'</div></div>' : ""));
}
function photoTab(en){
  var ph = S.photos || [];
  return card(
    '<div class="flex items-center justify-between mb-3"><span class="font-title-md text-title-md text-on-surface">'+(en?"Progress photos":"صور التقدّم")+'</span>'+
    '<span class="font-label-sm text-label-sm text-on-surface-variant">'+ar(ph.length)+'</span></div>'+
    '<button data-act="addphoto" class="tap w-full h-14 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center gap-2 font-label-lg text-label-lg">'+
      '<span class="material-symbols-outlined text-[20px]">photo_camera</span>'+(en?"Add a photo":"أضف صورة")+'</button>'+
    (ph.length ? '<div class="grid grid-cols-3 gap-2 mt-3">'+ph.slice().reverse().map(function(p, i){
      var idx = ph.length - 1 - i;
      return '<div class="relative rounded-xl overflow-hidden bg-surface-container-high aspect-[3/4]">'+
        '<img src="'+p.src+'" alt="" class="w-full h-full object-cover">'+
        '<div class="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 font-label-sm text-label-sm text-white">'+p.d+'</div>'+
        '<button data-act="delphoto" data-i="'+idx+'" class="tap absolute top-1 end-1 w-7 h-7 rounded-lg bg-black/55 text-white flex items-center justify-center">'+
        '<span class="material-symbols-outlined text-[14px]">close</span></button></div>';
    }).join("")+'</div>' : '<div class="mt-3 font-label-sm text-label-sm text-on-surface-variant">'+
      (en?"Same pose, same light, once a week — that is where the change shows.":"نفس الوضعية ونفس الإضاءة مرة بالأسبوع — هنا يبان التغيير.")+'</div>')+
    (ph.length > 1 ? '<div class="mt-3">'+btn(en?"Compare":"قارن", 'data-go="photos_stitch"', "bg-surface-container-high text-on-surface w-full")+'</div>' : ""));
}

/* ===================== DIET SECTION ===================== */
var DIETS = [
  {id:"keto", ar:"الكيتو دايت", en:"Keto", split:{f:.70,p:.25,c:.05},
   yes:["لحوم وأسماك","بيض","زبدة وزيت زيتون","أفوكادو","جبن كامل الدسم","خضار ورقي"],
   no:["أرز ومعكرونة","خبز","سكر وحلويات","تمر وموز","بطاطس"]},
  {id:"highprotein", ar:"عالي البروتين", en:"High protein", split:{f:.28,p:.37,c:.35},
   yes:["دجاج ولحم وسمك","بيض وبياض بيض","بروتين واي","جبن قريش","بقوليات"],
   no:["الكارب الفارغ","المقليات اليومية","العصائر بدل الوجبات"]},
  {id:"balanced", ar:"متوازن", en:"Balanced", split:{f:.30,p:.30,c:.40},
   yes:["كل المجموعات الغذائية","بروتين بكل وجبة","خضار في وجبتين"],
   no:["السكر المضاف اليومي","المقليات المتكررة"]},
  {id:"mediterranean", ar:"البحر المتوسط", en:"Mediterranean", split:{f:.35,p:.20,c:.45},
   yes:["زيت زيتون","أسماك","بقوليات","حبوب كاملة","خضار وفواكه"],
   no:["اللحوم المصنعة","السكر المضاف","الخبز الأبيض"]},
  {id:"if", ar:"صيام متقطع ١٦:٨", en:"Intermittent fasting", split:{f:.30,p:.30,c:.40},
   yes:["كل الأصناف داخل النافذة","بروتين بكل وجبة","ماء وقهوة سادة أثناء الصيام"],
   no:["الأكل خارج النافذة","العصائر أثناء الصيام"]}
];
function vDietInfo(){
  var en = S.lang === "en", cur = S.profile.diet || "balanced";
  var d = DIETS.filter(function(x){ return x.id === cur; })[0] || DIETS[2];
  var t = plan();
  return '<div class="flex flex-col gap-4 pt-1">'+
    '<div><div class="font-headline-md text-headline-md text-on-surface">'+(en?"My diet":"نظامي الغذائي")+'</div>'+
    label(en?"Everything about the system you follow":"كل شي عن نظامك")+'</div>'+
    card('<div class="flex items-center justify-between"><span class="font-title-md text-title-md text-on-surface">'+(en?d.en:d.ar)+'</span>'+
      '<span class="font-label-sm text-label-sm text-on-surface-variant tabular-nums">'+arGroup(t.kcal)+(en?" kcal":" سعرة")+'</span></div>'+
      '<div class="grid grid-cols-3 gap-2 mt-3">'+
        '<div class="rounded-xl bg-surface-container-high p-3 text-center"><div class="font-title-md text-title-md text-tertiary-fixed-dim tabular-nums">'+ar(t.f)+'</div><div class="font-label-sm text-label-sm text-on-surface-variant">'+(en?"Fat g · ":"دهون جم · ")+ar(d.split.f*100)+'٪</div></div>'+
        '<div class="rounded-xl bg-surface-container-high p-3 text-center"><div class="font-title-md text-title-md text-primary-fixed tabular-nums">'+ar(t.p)+'</div><div class="font-label-sm text-label-sm text-on-surface-variant">'+(en?"Protein g · ":"بروتين جم · ")+ar(d.split.p*100)+'٪</div></div>'+
        '<div class="rounded-xl bg-surface-container-high p-3 text-center"><div class="font-title-md text-title-md text-secondary-fixed-dim tabular-nums">'+ar(t.c)+'</div><div class="font-label-sm text-label-sm text-on-surface-variant">'+(en?"Carbs g · ":"كارب جم · ")+ar(d.split.c*100)+'٪</div></div>'+
      '</div>', "border border-primary-fixed/40")+
    card('<div class="flex items-center gap-2 mb-2"><span class="material-symbols-outlined text-[18px] text-primary-fixed">check_circle</span>'+
      '<span class="font-title-md text-title-md text-on-surface">'+(en?"Eat freely":"كُل بحرية")+'</span></div>'+
      '<div class="flex flex-wrap gap-2">'+d.yes.map(function(x){ return '<span class="px-3 py-1.5 rounded-lg bg-primary-fixed/15 text-primary-fixed font-label-sm text-label-sm">'+x+'</span>'; }).join("")+'</div>')+
    card('<div class="flex items-center gap-2 mb-2"><span class="material-symbols-outlined text-[18px] text-on-surface-variant">cancel</span>'+
      '<span class="font-title-md text-title-md text-on-surface">'+(en?"Avoid":"تجنّبه")+'</span></div>'+
      '<div class="flex flex-wrap gap-2">'+d.no.map(function(x){ return '<span class="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">'+x+'</span>'; }).join("")+'</div>')+
    '<div>'+label(en?"Switch system":"بدّل النظام")+
    '<div class="rounded-2xl bg-surface-container divide-y divide-outline-variant/40 mt-2">'+DIETS.map(function(x){
      var on = x.id === cur;
      return '<button data-act="setdiet" data-v="'+x.id+'" class="tap w-full flex items-center justify-between px-4 py-3.5 text-start">'+
        '<div><div class="font-label-lg text-label-lg text-on-surface">'+(en?x.en:x.ar)+'</div>'+
        '<div class="font-label-sm text-label-sm text-on-surface-variant">'+ar(x.split.f*100)+'٪ / '+ar(x.split.p*100)+'٪ / '+ar(x.split.c*100)+'٪</div></div>'+
        (on ? '<span class="px-2.5 py-1 rounded-lg bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">'+(en?"Active":"نشط")+'</span>'
            : '<span class="material-symbols-outlined text-[18px] text-on-surface-variant rtl:rotate-180">chevron_right</span>')+
      '</button>';
    }).join("")+'</div></div>'+
  '</div>';
}

/* ===================== actions ===================== */
function num(id){
  var el = document.getElementById(id); if (!el) return NaN;
  return parseFloat((el.value||"").replace(/[٠-٩]/g, function(d){ return String(d.charCodeAt(0)-1632); })
    .replace(/[٫٬]/g, ".").replace(/[^0-9.]/g, ""));
}
function stamp(){
  var d = new Date();
  return S.lang === "en" ? (d.getDate()+"/"+(d.getMonth()+1)) : (ar(d.getDate())+"/"+ar(d.getMonth()+1));
}
function dynamicAct(name, ds){
  var en = S.lang === "en";
  switch(name){
    case "unit": U()[ds.kind] = ds.v; save(); render(current, true); return true;
    case "gender": S.profile.gender = ds.v; save(); render(current, true); return true;
    case "activity": S.profile.activity = ds.v; save(); render(current, true); return true;
    case "setdiet": S.profile.diet = ds.v; save(); render(current, true); toast(en?"Diet updated":"تحدّث نظامك"); return true;
    case "savebody": {
      var b = document.getElementById("f-birth"); if (b && b.value) S.profile.birth = b.value;
      var a = ageFrom(S.profile.birth); if (a) S.profile.age = a;
      var hh = num("f-height"), ww = num("f-weight"), tt = num("f-target");
      if (!isNaN(hh)) S.profile.height = Math.round(toCm(hh));
      if (!isNaN(ww)){ S.profile.weight = Math.round(toKg(ww)*10)/10; pushWeight(S.profile.weight); }
      if (!isNaN(tt)) S.profile.target = Math.round(toKg(tt)*10)/10;
      save(); toast(en?"Saved":"انحفظت بياناتك"); go("plan"); return true;
    }
    case "mealstab": if (ds.v === "diet") go("dietinfo"); return true;
    case "addmeal": S.addMeal = ds.meal; foodPick = null; foodQuery = ""; save(); go("addfood"); return true;
    case "setmeal": S.addMeal = ds.v; save(); render(current, true); return true;
    case "pickfood": {
      var f = FOOD_BY_ID[ds.id];
      foodPick = { id: f.id, qty: f.base };
      render(current, true); return true;
    }
    case "qty": {
      if (!foodPick) return true;
      var f2 = FOOD_BY_ID[foodPick.id];
      var typed = num("pick-qty"); if (!isNaN(typed)) foodPick.qty = typed;
      var step = (f2.u === "جم" || f2.u === "مل") ? 10 : 1;
      foodPick.qty = Math.max(step, Math.round((foodPick.qty + step * (+ds.v)) * 10) / 10);
      render(current, true); return true;
    }
    case "closepick": foodPick = null; render(current, true); return true;
    case "confirmfood": {
      if (!foodPick) return true;
      var typed2 = num("pick-qty"); if (!isNaN(typed2) && typed2 > 0) foodPick.qty = typed2;
      var f3 = FOOD_BY_ID[foodPick.id], meal = S.addMeal || "الغداء";
      day().meals[meal].push({ n:f3.n, en:f3.en, u:f3.u, base:f3.base, qty:foodPick.qty,
                               kcal:f3.kcal, p:f3.p, c:f3.c, f:f3.f });
      foodPick = null; save(); go("meals");
      toast((en?"Added to ":"أُضيف لـ") + (en?MEAL_EN[meal]:meal)); return true;
    }
    case "manualfood": {
      openPanel('<div class="font-title-md text-title-md text-on-surface mb-3">'+(en?"Custom item":"صنف يدوي")+'</div>'+
        '<div class="grid grid-cols-2 gap-2">'+
          '<div class="col-span-2">'+field("mf-n", en?"Name":"الاسم", "", "", "text")+'</div>'+
          field("mf-k", en?"Calories":"السعرات", "", en?"kcal":"سعرة")+
          field("mf-p", en?"Protein":"بروتين", "", en?"g":"جم")+
          field("mf-c", en?"Carbs":"كارب", "", en?"g":"جم")+
          field("mf-f", en?"Fat":"دهون", "", en?"g":"جم")+
        '</div><div class="mt-3">'+btn(en?"Add":"أضف", 'data-act="savemanual"', "bg-primary-fixed text-on-primary-fixed w-full")+'</div>');
      return true;
    }
    case "savemanual": {
      var nEl = document.getElementById("mf-n");
      var nm = (nEl && nEl.value.trim()) || (en?"Custom item":"صنف يدوي");
      var kc = num("mf-k"); if (isNaN(kc) || kc <= 0){ toast(en?"Enter the calories":"اكتب السعرات"); return true; }
      var meal2 = S.addMeal || "الغداء";
      day().meals[meal2].push({ n:nm, en:nm, u:(en?"serving":"حصة"), base:1, qty:1, kcal:kc,
        p:num("mf-p")||0, c:num("mf-c")||0, f:num("mf-f")||0 });
      save(); closePanel(); go("meals"); toast(en?"Added":"أُضيف"); return true;
    }
    case "delitem": day().meals[ds.meal].splice(+ds.i, 1); save(); render(current, true); return true;
    case "steps": day().steps = Math.max(0, (day().steps||0) + (+ds.v)); save(); render(current, true); return true;
    case "pedo": { if (PEDO.on) pedoStop(); else pedoStart(); return true; }
    case "stepsman": {
      openPanel('<div class="font-title-md text-title-md text-on-surface mb-1">'+(en?"Steps today":"خطوات اليوم")+'</div>'+
        '<div class="font-label-sm text-label-sm text-on-surface-variant mb-3">'+
          (en?"Your phone counts them on its own — type them in only when it was in your bag.":"جوالك يعدّها بنفسه — اكتبها يدوياً فقط إذا كان بالشنطة.")+'</div>'+
        field("st-n", en?"Steps":"الخطوات", String(day().steps||0), "", "numeric")+
        '<div class="mt-3">'+btn(en?"Save":"احفظ", 'data-act="savesteps"', "bg-primary-fixed text-on-primary-fixed w-full")+'</div>');
      return true;
    }
    case "savesteps": {
      var st = num("st-n");
      if (isNaN(st) || st < 0){ toast(en?"Enter the steps":"اكتب الخطوات"); return true; }
      day().steps = Math.round(st); save(); closePanel(); render(current, true);
      toast(en?"Steps updated":"تحدّثت خطواتك"); return true;
    }
    case "water": day().water = Math.max(0, Math.round(((day().water||0) + parseFloat(ds.v))*100)/100); save(); render(current, true); return true;
    case "weighin": S.progTab = "weight"; save(); go("progress"); return true;
    case "gotoworkouts": go("workouts"); return true;
    case "progtab": S.progTab = ds.v; save(); render(current, true); return true;
    case "savew": {
      var w = num("w-new");
      if (isNaN(w) || w <= 0){ toast(en?"Enter a weight":"اكتب وزناً صحيحاً"); return true; }
      pushWeight(Math.round(toKg(w)*10)/10); save(); render(current, true); toast(en?"Weight updated":"تحدّث وزنك"); return true;
    }
    case "savemeasures": {
      var v = {}, any = false;
      Array.prototype.forEach.call(document.querySelectorAll("[data-m]"), function(el){
        var x = parseFloat((el.value||"").replace(/[^0-9.]/g, ""));
        if (!isNaN(x) && x > 0){ v[el.dataset.m] = Math.round(toCm(x)*10)/10; any = true; }
      });
      if (!any){ toast(en?"Nothing to save":"ما فيه أرقام"); return true; }
      S.measures = S.measures || []; S.measures.push({ d: stamp(), v: v });
      save(); render(current, true); toast(en?"Measurements saved":"انحفظت مقاساتك"); return true;
    }
    case "addphoto": {
      var inp = document.getElementById("photo-input");
      if (inp) inp.click();
      return true;
    }
    case "delphoto": (S.photos||[]).splice(+ds.i, 1); save(); render(current, true); return true;
    case "pickact": {
      var mine = myActivities().map(function(x){ return x.id; });
      var pool = ACT_LIB.filter(function(a){ return mine.indexOf(a.id) < 0; });
      openPanel('<div class="font-title-md text-title-md text-on-surface mb-1">'+(en?"Add an activity":"أضف نشاط")+'</div>'+
        '<div class="font-label-sm text-label-sm text-on-surface-variant mb-3">'+
          (en?"Not just iron — pick whatever you actually do.":"مو حديد بس — اختر اللي تسويه فعلاً.")+'</div>'+
        (pool.length ? '<div class="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">'+pool.map(function(a){
          return '<button data-act="addact" data-id="'+a.id+'" class="tap rounded-xl bg-surface-container-high p-3 flex items-center gap-2 text-start">'+
            '<span class="material-symbols-outlined text-[18px] text-primary-fixed shrink-0">'+a.icon+'</span>'+
            '<span class="font-label-lg text-label-lg text-on-surface truncate">'+(en?a.en:a.ar)+'</span></button>';
        }).join("")+'</div>' : '<div class="font-label-sm text-label-sm text-on-surface-variant">'+(en?"You already track them all.":"كلها عندك أصلاً.")+'</div>')+
        '<div class="mt-3">'+btn(en?"Something else":"نشاط من عندك", 'data-act="customact"', "bg-surface-container-high text-on-surface w-full")+'</div>');
      return true;
    }
    case "addact": {
      if (myActivities().filter(function(x){ return x.id === ds.id; }).length){
        toast(en?"Already on your list":"موجود عندك أصلاً"); return true;
      }
      S.newAct = ds.id; S.newPer = 3; newActSheet(); return true;
    }
    case "newplus": S.newPer = Math.min(14, (+S.newPer||3) + 1); newActSheet(); return true;
    case "newminus": S.newPer = Math.max(1, (+S.newPer||3) - 1); newActSheet(); return true;
    case "confirmact": {
      if (!S.newAct) return true;
      myActivities().push({ id: S.newAct, perWeek: Math.max(1, +S.newPer || 3) });
      S.newAct = null; S.wkTab = "acts"; save(); closePanel(); go("workouts");
      toast(en?"Activity added":"أُضيف النشاط"); return true;
    }
    case "customact": {
      openPanel('<div class="font-title-md text-title-md text-on-surface mb-3">'+(en?"Your own activity":"نشاطك أنت")+'</div>'+
        field("ca-n", en?"Name":"اسم النشاط", "", "", "text")+
        '<div class="grid grid-cols-2 gap-2 mt-2">'+
          field("ca-w", en?"Times per week":"كم مرة بالأسبوع", "3", "", "numeric")+
          '<div class="rounded-xl bg-surface-container-high p-3 flex flex-col gap-1">'+label(en?"Intensity":"الشدّة")+
          '<select id="ca-met" class="w-full bg-transparent border-0 p-0 font-title-md text-title-md text-on-surface focus:outline-none">'+
            '<option value="3.5">'+(en?"Light":"خفيف")+'</option>'+
            '<option value="6" selected>'+(en?"Moderate":"متوسط")+'</option>'+
            '<option value="9">'+(en?"Hard":"شديد")+'</option></select></div>'+
        '</div>'+
        '<div class="mt-3">'+btn(en?"Add":"أضف", 'data-act="savecustomact"', "bg-primary-fixed text-on-primary-fixed w-full")+'</div>');
      return true;
    }
    case "savecustomact": {
      var caEl = document.getElementById("ca-n");
      var caN = caEl ? caEl.value.trim() : "";
      if (!caN){ toast(en?"Name your activity":"اكتب اسم النشاط"); return true; }
      var mEl = document.getElementById("ca-met");
      var cid = "c" + Date.now();
      S.customActs = S.customActs || {};
      S.customActs[cid] = { id:cid, ar:caN, en:caN, met: mEl ? +mEl.value : 6, unit:"min", icon:"exercise" };
      var pw = num("ca-w");
      myActivities().push({ id: cid, perWeek: Math.max(1, Math.round(isNaN(pw) ? 3 : pw)) });
      S.wkTab = "acts"; save(); closePanel(); go("workouts"); toast(en?"Activity added":"أُضيف النشاط"); return true;
    }
    case "wktab": S.wkTab = ds.v; save(); render(current, true); return true;
    case "expday": S.openDay = (S.openDay === +ds.d) ? -1 : +ds.d; save(); render(current, true); return true;
    case "actsheet": actSheet(+ds.i); return true;
    case "openprog": S.wkTab = "prog"; save(); closePanel(); go("workouts"); return true;
    case "quicklog": {
      var mine2 = myActivities();
      openPanel('<div class="font-title-md text-title-md text-on-surface mb-1">'+(en?"Log a session":"سجّل جلسة")+'</div>'+
        '<div class="font-label-sm text-label-sm text-on-surface-variant mb-3">'+(en?"Which one did you do?":"وش سويت؟")+'</div>'+
        '<div class="rounded-2xl bg-surface-container-high divide-y divide-outline-variant/40 overflow-hidden">'+
        mine2.map(function(a, i){
          var nf = actInfo(a.id);
          return '<button data-act="'+(a.id === "gym" ? "openprog" : "logact")+'" data-id="'+a.id+'" class="tap w-full flex items-center gap-3 px-4 py-3 text-start">'+
            '<span class="material-symbols-outlined text-[18px] text-primary-fixed shrink-0">'+nf.icon+'</span>'+
            '<span class="flex-1 font-label-lg text-label-lg text-on-surface truncate">'+(en?nf.en:nf.ar)+'</span>'+
            '<span class="material-symbols-outlined text-[18px] text-on-surface-variant rtl:rotate-180 shrink-0">chevron_right</span></button>';
        }).join("")+'</div>');
      return true;
    }
    case "actplus": { var ap = myActivities()[+ds.i]; if (ap) ap.perWeek = Math.min(14, (+ap.perWeek||0)+1); save(); render(current, true); actSheet(+ds.i); return true; }
    case "actminus": { var am = myActivities()[+ds.i]; if (am) am.perWeek = Math.max(1, (+am.perWeek||0)-1); save(); render(current, true); actSheet(+ds.i); return true; }
    case "delact": {
      var gone = myActivities().splice(+ds.i, 1)[0];
      if (gone && S.customActs) delete S.customActs[gone.id];
      save(); closePanel(); render(current, true); toast(en?"Removed":"انحذف"); return true;
    }
    case "logact": {
      if (ds.id === "gym"){ S.wkTab = "prog"; save(); closePanel(); go("workouts");
        toast(en?"Pick a day and start":"اختر يوم وابدأ"); return true; }
      var inf = actInfo(ds.id);
      openPanel('<div class="flex items-center gap-2 mb-1">'+
          '<span class="material-symbols-outlined text-[20px] text-primary-fixed">'+inf.icon+'</span>'+
          '<span class="font-title-md text-title-md text-on-surface">'+(en?inf.en:inf.ar)+'</span></div>'+
        '<div class="font-label-sm text-label-sm text-on-surface-variant mb-3">'+
          (en?"How long did you go for?":"كم استمريت؟")+'</div>'+
        '<div class="grid grid-cols-2 gap-2">'+
          field("la-min", en?"Minutes":"الدقائق", "45", "", "numeric")+
          field("la-km", en?"Distance (optional)":"المسافة (اختياري)", "", en?"km":"كم", "decimal")+
        '</div>'+
        '<div class="mt-3">'+btn(en?"Save session":"احفظ الجلسة", 'data-act="savelogact" data-id="'+ds.id+'"', "bg-primary-fixed text-on-primary-fixed w-full")+'</div>');
      return true;
    }
    case "savelogact": {
      var inf2 = actInfo(ds.id), mn = num("la-min");
      if (isNaN(mn) || mn <= 0){ toast(en?"Enter the minutes":"اكتب الدقائق"); return true; }
      var km = num("la-km"), kc2 = metKcal(inf2.met, mn);
      S.sessions = S.sessions || [];
      S.sessions.push({ d: stamp(), t: Date.now(), act: inf2.id, ar: inf2.ar, en: inf2.en,
        min: Math.round(mn), km: isNaN(km) ? 0 : km, kcal: kc2 });
      if (S.sessions.length > 200) S.sessions.shift();
      S.wkTab = "acts"; save(); closePanel(); render(current, true);
      toast((en?"Logged · ":"انسجلت · ")+arGroup(kc2)+(en?" kcal":" سعرة")); return true;
    }
    case "delsession": { (S.sessions||[]).splice(+ds.i, 1); save(); render(current, true); return true; }
    case "delmeasure": { (S.measures||[]).splice(+ds.i, 1); save(); render(current, true); toast(en?"Removed":"انحذف"); return true; }
    case "perweek": {
      var n = Math.max(1, Math.min(7, +ds.v)), pr = program();
      pr.on = WEEK_SHAPES[n].slice();
      reflow(pr);
      S.openDay = -1; save(); render(current, true); return true;
    }
    case "togday": {
      var wd = +ds.d, pr0 = program(), at = pr0.on.indexOf(wd);
      if (at >= 0){
        if (pr0.on.length === 1){ toast(en?"Keep at least one training day":"خلّ يوم تمرين واحد على الأقل"); return true; }
        pr0.on.splice(at, 1); pr0.days.splice(at, 1);
        S.openDay = -1;
      } else {
        pr0.on.push(wd); pr0.on.sort(function(a, b){ return a - b; });
        var pos = pr0.on.indexOf(wd);
        pr0.days.splice(pos, 0, { ar:"", en:"", ex:[] });
        S.openDay = pos;
      }
      reflow(pr0); save(); render(current, true); return true;
    }
    case "addex": {
      var di = +ds.d;
      openPanel('<div class="font-title-md text-title-md text-on-surface mb-3">'+(en?"Add exercise":"أضف تمرين")+'</div>'+
        '<div class="grid grid-cols-2 gap-2 mb-3">'+field("ex-sets", en?"Sets":"الجولات", "4", "", "numeric")+
        field("ex-reps", en?"Reps":"التكرارات", "10", "", "numeric")+'</div>'+
        '<div class="rounded-2xl bg-surface-container-high divide-y divide-outline-variant/40 max-h-72 overflow-y-auto">'+
        EXERCISE_LIB.map(function(e, i){
          return '<button data-act="pickex" data-d="'+di+'" data-i="'+i+'" class="tap w-full text-start px-4 py-3 font-label-lg text-label-lg text-on-surface">'+
            (en?e[1]:e[0])+'</button>';
        }).join("")+'</div>');
      return true;
    }
    case "pickex": {
      var e = EXERCISE_LIB[+ds.i], pr2 = program();
      var sets = num("ex-sets") || 4, reps = num("ex-reps") || 10;
      pr2.days[+ds.d].ex.push({ ar:e[0], en:e[1], sets:Math.max(1,Math.round(sets)), reps:Math.max(1,Math.round(reps)) });
      save(); closePanel(); render(current, true); toast(en?"Added":"أُضيف"); return true;
    }
    case "delex": program().days[+ds.d].ex.splice(+ds.j, 1); save(); render(current, true); return true;
    case "startday": {
      S.sessionDay = +ds.d; S.sessionLog = {}; S.exIdx = 0;
      S.sessionStart = Date.now(); TIMER.restLeft = 0;
      save(); go("session"); return true;
    }
    case "backprog": S.wkTab = "prog"; save(); go("workouts"); return true;
    case "goex": S.exIdx = +ds.i; save(); render(current, true); return true;
    case "exnav": {
      var pr4 = program(), dd4 = pr4.days[S.sessionDay || 0] || pr4.days[0];
      var ni = Math.max(0, Math.min((S.exIdx || 0) + (+ds.v), dd4.ex.length - 1));
      S.exIdx = ni; save(); render(current, true); return true;
    }
    case "restset": S.restOf = +ds.v; TIMER.restOf = +ds.v; save(); render(current, true); return true;
    case "rest15": {
      TIMER.restLeft += 15;
      if (TIMER.restLeft > TIMER.restOf) TIMER.restOf = TIMER.restLeft;
      paintRest(); return true;
    }
    case "restskip": TIMER.restLeft = 0; paintRest(); return true;
    case "delset": {
      var arr = S.sessionLog[+ds.j] || [];
      if (arr.length > 1) arr.splice(+ds.k, 1);
      save(); render(current, true); return true;
    }
    case "doneset": {
      var j = +ds.j, k = +ds.k;
      var wEl = document.querySelector('[data-set="'+j+'-'+k+'-w"]'), rEl = document.querySelector('[data-set="'+j+'-'+k+'-r"]');
      var st = S.sessionLog[j][k];
      if (wEl) st.w = wEl.value; if (rEl) st.r = rEl.value;
      st.done = !st.done;
      if (st.done){
        var pr5 = program(), d5 = pr5.days[S.sessionDay || 0] || pr5.days[0], ex5 = d5.ex[j];
        if (ex5 && st.w){ S.exLast = S.exLast || {}; S.exLast[exKey(ex5)] = { w: st.w, r: st.r, d: stamp() }; }
        TIMER.restOf = S.restOf || 90; TIMER.restLeft = TIMER.restOf;   /* the rest starts itself */
        sessionTimer();
        var rest5 = (S.sessionLog[j] || []).every(function(x){ return x.done; });
        if (rest5 && j < d5.ex.length - 1){
          S.exIdx = j + 1;
          toast(en ? ("Next · "+d5.ex[j+1].en) : ("التالي · "+d5.ex[j+1].ar));
        }
      }
      save(); render(current, true); paintRest(); return true;
    }
    case "addset": {
      var jj = +ds.j;
      S.sessionLog[jj] = S.sessionLog[jj] || [];
      S.sessionLog[jj].push({ w:"", r:"", done:false }); save(); render(current, true); return true;
    }
    case "finish": {
      var pr3 = program(), d3 = pr3.days[S.sessionDay || 0] || pr3.days[0], vol = 0, done = 0;
      Object.keys(S.sessionLog || {}).forEach(function(j){
        (S.sessionLog[j]||[]).forEach(function(s){ if (s.done){ vol += (+s.w||0)*(+s.r||0); done++; } });
      });
      if (!done){
        S.sessionLog = {}; S.sessionStart = 0; S.exIdx = 0;
        TIMER.restLeft = 0; if (TIMER.id){ clearInterval(TIMER.id); TIMER.id = null; }
        S.wkTab = "prog"; save(); go("workouts");
        toast(en ? "No sets logged — session dropped" : "ما سجّلت ولا جولة — انلغت الجلسة"); return true;
      }
      S.sessions = S.sessions || [];
      var mins3 = S.sessionStart ? Math.round((Date.now() - S.sessionStart) / 60000) : 0;
      mins3 = Math.min(180, Math.max(10, mins3 || done * 3));
      S.sessions.push({ d: stamp(), t: Date.now(), act: "gym", ar: d3.ar, en: d3.en,
        volume: Math.round(vol), sets: done, min: mins3, kcal: metKcal(5.0, mins3) });
      if (S.sessions.length > 200) S.sessions.shift();
      S.sessionLog = {}; S.sessionStart = 0; S.exIdx = 0; S.wkTab = "log";
      TIMER.restLeft = 0; if (TIMER.id){ clearInterval(TIMER.id); TIMER.id = null; }
      save(); go("workouts");
      toast((en?"Session saved · ":"انحفظت الجلسة · ")+arGroup(vol)+(en?" kg":" كجم")); return true;
    }
  }
  return false;
}
function pushWeight(kg){
  S.weights = S.weights || [];
  S.weights.push({ d: stamp(), t: Date.now(), kg: kg });   // always a new row — the old one stays
  if (S.weights.length > 120) S.weights.shift();
  S.profile.weight = kg;
}
var DYNAMIC = { home:vHome, meals:vMeals, addfood:vAddFood, body:vBody, workouts:vWorkouts,
                session:vSession, progress:vProgress, dietinfo:vDietInfo };
