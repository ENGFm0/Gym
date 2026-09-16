/**
 * The catalogs the app ships with. In offline mode these are the data;
 * against the API the same lists come from the server.
 */
import type { ActivityCatalogItem, Diet, Food } from "./types";

export const FOODS: Food[] = [
  { id: "egg", nameAr: "بيض", nameEn: "Eggs", unit: "حبة", baseAmount: 1, calories: 90, protein: 6, carbs: 0.3, fat: 7.3, isCustom: false },
  { id: "chick", nameAr: "صدر دجاج مشوي", nameEn: "Grilled chicken", unit: "جم", baseAmount: 100, calories: 165, protein: 31, carbs: 0, fat: 3.6, isCustom: false },
  { id: "beef", nameAr: "لحم بقري", nameEn: "Beef", unit: "جم", baseAmount: 100, calories: 250, protein: 26, carbs: 0, fat: 16, isCustom: false },
  { id: "salmon", nameAr: "سلمون", nameEn: "Salmon", unit: "جم", baseAmount: 100, calories: 208, protein: 20, carbs: 0, fat: 13, isCustom: false },
  { id: "shrimp", nameAr: "روبيان", nameEn: "Shrimp", unit: "جم", baseAmount: 100, calories: 99, protein: 24, carbs: 0.2, fat: 0.3, isCustom: false },
  { id: "tuna", nameAr: "تونة بالماء", nameEn: "Tuna", unit: "علبة", baseAmount: 1, calories: 110, protein: 25, carbs: 0, fat: 1, isCustom: false },
  { id: "yog", nameAr: "لبن يوناني", nameEn: "Greek yogurt", unit: "جم", baseAmount: 170, calories: 100, protein: 17, carbs: 6, fat: 0, isCustom: false },
  { id: "milk", nameAr: "حليب", nameEn: "Milk", unit: "مل", baseAmount: 200, calories: 104, protein: 7, carbs: 10, fat: 4, isCustom: false },
  { id: "halou", nameAr: "جبن حلوم", nameEn: "Halloumi", unit: "جم", baseAmount: 100, calories: 325, protein: 22, carbs: 2.5, fat: 26, isCustom: false },
  { id: "qareesh", nameAr: "جبن قريش", nameEn: "Cottage cheese", unit: "جم", baseAmount: 100, calories: 98, protein: 11, carbs: 3.4, fat: 4.3, isCustom: false },
  { id: "rice", nameAr: "أرز أبيض مطبوخ", nameEn: "White rice", unit: "جم", baseAmount: 100, calories: 130, protein: 2.7, carbs: 28, fat: 0.3, isCustom: false },
  { id: "kabsa", nameAr: "كبسة دجاج", nameEn: "Kabsa", unit: "صحن", baseAmount: 1, calories: 640, protein: 34, carbs: 72, fat: 22, isCustom: false },
  { id: "shawrma", nameAr: "شاورما دجاج", nameEn: "Shawarma", unit: "سندويتش", baseAmount: 1, calories: 390, protein: 24, carbs: 36, fat: 16, isCustom: false },
  { id: "bread", nameAr: "خبز عربي", nameEn: "Arabic bread", unit: "رغيف", baseAmount: 1, calories: 140, protein: 5, carbs: 26, fat: 1.5, isCustom: false },
  { id: "oats", nameAr: "شوفان", nameEn: "Oats", unit: "جم", baseAmount: 100, calories: 389, protein: 17, carbs: 66, fat: 7, isCustom: false },
  { id: "pasta", nameAr: "معكرونة", nameEn: "Pasta", unit: "جم", baseAmount: 100, calories: 158, protein: 6, carbs: 31, fat: 0.9, isCustom: false },
  { id: "potato", nameAr: "بطاطس مقلية", nameEn: "Fries", unit: "جم", baseAmount: 100, calories: 312, protein: 3.4, carbs: 41, fat: 15, isCustom: false },
  { id: "foul", nameAr: "فول مدمس", nameEn: "Foul", unit: "صحن", baseAmount: 1, calories: 270, protein: 14, carbs: 34, fat: 8, isCustom: false },
  { id: "hummus", nameAr: "حمص بالطحينة", nameEn: "Hummus", unit: "جم", baseAmount: 100, calories: 177, protein: 8, carbs: 14, fat: 10, isCustom: false },
  { id: "dates", nameAr: "تمر", nameEn: "Dates", unit: "حبة", baseAmount: 1, calories: 22, protein: 0.2, carbs: 6, fat: 0, isCustom: false },
  { id: "banana", nameAr: "موز", nameEn: "Banana", unit: "حبة", baseAmount: 1, calories: 105, protein: 1.3, carbs: 27, fat: 0.4, isCustom: false },
  { id: "apple", nameAr: "تفاح", nameEn: "Apple", unit: "حبة", baseAmount: 1, calories: 95, protein: 0.5, carbs: 25, fat: 0.3, isCustom: false },
  { id: "avo", nameAr: "أفوكادو", nameEn: "Avocado", unit: "جم", baseAmount: 100, calories: 214, protein: 2.6, carbs: 11, fat: 20, isCustom: false },
  { id: "almond", nameAr: "لوز", nameEn: "Almonds", unit: "جم", baseAmount: 100, calories: 579, protein: 21, carbs: 22, fat: 50, isCustom: false },
  { id: "pb", nameAr: "زبدة فول سوداني", nameEn: "Peanut butter", unit: "جم", baseAmount: 100, calories: 588, protein: 25, carbs: 20, fat: 50, isCustom: false },
  { id: "oil", nameAr: "زيت زيتون", nameEn: "Olive oil", unit: "ملعقة", baseAmount: 1, calories: 119, protein: 0, carbs: 0, fat: 13.5, isCustom: false },
  { id: "butter", nameAr: "زبدة", nameEn: "Butter", unit: "جم", baseAmount: 100, calories: 717, protein: 0.9, carbs: 0.1, fat: 81, isCustom: false },
  { id: "gsalad", nameAr: "سلطة يونانية", nameEn: "Greek salad", unit: "حصة", baseAmount: 1, calories: 310, protein: 8, carbs: 10, fat: 27, isCustom: false },
  { id: "broc", nameAr: "بروكلي", nameEn: "Broccoli", unit: "جم", baseAmount: 100, calories: 35, protein: 2.4, carbs: 7, fat: 0.4, isCustom: false },
  { id: "cucum", nameAr: "خيار", nameEn: "Cucumber", unit: "جم", baseAmount: 100, calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, isCustom: false },
  { id: "whey", nameAr: "بروتين واي", nameEn: "Whey protein", unit: "سكوب", baseAmount: 1, calories: 120, protein: 24, carbs: 3, fat: 1.5, isCustom: false },
  { id: "latte", nameAr: "قهوة بحليب", nameEn: "Latte", unit: "كوب", baseAmount: 1, calories: 150, protein: 8, carbs: 14, fat: 7, isCustom: false },
  { id: "coffee", nameAr: "قهوة سادة", nameEn: "Black coffee", unit: "فنجان", baseAmount: 1, calories: 5, protein: 0.2, carbs: 0.8, fat: 0, isCustom: false },
  { id: "burger", nameAr: "برجر", nameEn: "Burger", unit: "وجبة", baseAmount: 1, calories: 540, protein: 28, carbs: 41, fat: 29, isCustom: false },
  { id: "pizza", nameAr: "بيتزا", nameEn: "Pizza slice", unit: "قطعة", baseAmount: 1, calories: 230, protein: 10, carbs: 28, fat: 9, isCustom: false }
];

export const ACTIVITY_LIBRARY: ActivityCatalogItem[] = [
  { id: "gym", nameAr: "حديد", nameEn: "Weights", met: 5.0, unit: "session", icon: "fitness_center" },
  { id: "run", nameAr: "ركض", nameEn: "Running", met: 9.8, unit: "minutes", icon: "directions_run" },
  { id: "walk", nameAr: "مشي", nameEn: "Walking", met: 3.5, unit: "minutes", icon: "directions_walk" },
  { id: "swim", nameAr: "سباحة", nameEn: "Swimming", met: 7.0, unit: "minutes", icon: "pool" },
  { id: "bike", nameAr: "دراجة", nameEn: "Cycling", met: 7.5, unit: "minutes", icon: "pedal_bike" },
  { id: "cross", nameAr: "كروسفت", nameEn: "CrossFit", met: 8.0, unit: "minutes", icon: "sports_gymnastics" },
  { id: "box", nameAr: "ملاكمة", nameEn: "Boxing", met: 9.0, unit: "minutes", icon: "sports_mma" },
  { id: "foot", nameAr: "كرة قدم", nameEn: "Football", met: 7.0, unit: "minutes", icon: "sports_soccer" },
  { id: "pad", nameAr: "بادل / تنس", nameEn: "Padel", met: 6.5, unit: "minutes", icon: "sports_tennis" },
  { id: "yoga", nameAr: "يوغا / إطالة", nameEn: "Yoga", met: 3.0, unit: "minutes", icon: "self_improvement" },
  { id: "row", nameAr: "تجديف", nameEn: "Rowing", met: 7.0, unit: "minutes", icon: "rowing" },
  { id: "hike", nameAr: "هايكنق", nameEn: "Hiking", met: 6.0, unit: "minutes", icon: "hiking" }
];

export const EXERCISES: { nameAr: string; nameEn: string }[] = [
  { nameAr: "بنش برس", nameEn: "Bench press" },
  { nameAr: "سكوات", nameEn: "Squat" },
  { nameAr: "رفعة ميتة", nameEn: "Deadlift" },
  { nameAr: "ضغط أكتاف", nameEn: "Shoulder press" },
  { nameAr: "سحب أمامي", nameEn: "Lat pulldown" },
  { nameAr: "تجديف بالبار", nameEn: "Barbell row" },
  { nameAr: "عقلة", nameEn: "Pull-up" },
  { nameAr: "مرجحة بايسبس", nameEn: "Biceps curl" },
  { nameAr: "ترايسبس بالحبل", nameEn: "Triceps pushdown" },
  { nameAr: "دمبل صدر مائل", nameEn: "Incline dumbbell press" },
  { nameAr: "لانجز", nameEn: "Lunges" },
  { nameAr: "رفرفة جانبي", nameEn: "Lateral raise" },
  { nameAr: "سمانة واقف", nameEn: "Standing calf raise" },
  { nameAr: "بلانك", nameEn: "Plank" },
  { nameAr: "كارديو", nameEn: "Cardio" }
];

export const DIETS: Diet[] = [
  { id: "keto", nameAr: "الكيتو دايت", nameEn: "Keto", split: { fat: .70, protein: .25, carbs: .05 }, eat: ["لحوم وأسماك", "بيض", "زبدة وزيت زيتون", "أفوكادو", "جبن كامل الدسم", "خضار ورقي"], avoid: ["أرز ومعكرونة", "خبز", "سكر وحلويات", "تمر وموز", "بطاطس"] },
  { id: "highprotein", nameAr: "عالي البروتين", nameEn: "High protein", split: { fat: .28, protein: .37, carbs: .35 }, eat: ["دجاج ولحم وسمك", "بيض وبياض بيض", "بروتين واي", "جبن قريش", "بقوليات"], avoid: ["الكارب الفارغ", "المقليات اليومية", "العصائر بدل الوجبات"] },
  { id: "balanced", nameAr: "متوازن", nameEn: "Balanced", split: { fat: .30, protein: .30, carbs: .40 }, eat: ["كل المجموعات الغذائية", "بروتين بكل وجبة", "خضار في وجبتين"], avoid: ["السكر المضاف اليومي", "المقليات المتكررة"] },
  { id: "mediterranean", nameAr: "البحر المتوسط", nameEn: "Mediterranean", split: { fat: .35, protein: .20, carbs: .45 }, eat: ["زيت زيتون", "أسماك", "بقوليات", "حبوب كاملة", "خضار وفواكه"], avoid: ["اللحوم المصنعة", "السكر المضاف", "الخبز الأبيض"] },
  { id: "if", nameAr: "صيام متقطع ١٦:٨", nameEn: "Intermittent fasting", split: { fat: .30, protein: .30, carbs: .40 }, eat: ["كل الأصناف داخل النافذة", "بروتين بكل وجبة", "ماء وقهوة سادة أثناء الصيام"], avoid: ["الأكل خارج النافذة", "العصائر أثناء الصيام"] }
];

export const BODY_PARTS: [string, string, string][] = [
  ["neck", "الرقبة", "Neck"],
  ["shoulder", "الكتف", "Shoulder"],
  ["chest", "الصدر", "Chest"],
  ["arm", "الذراع", "Arm"],
  ["waist", "الخصر", "Waist"],
  ["hip", "الأرداف", "Hips"],
  ["thigh", "الفخذ", "Thigh"],
  ["calf", "السمانة", "Calf"]
];

export const MEAL_LABELS: Record<string, [string, string]> = {
  breakfast: ["الفطور", "Breakfast"],
  lunch: ["الغداء", "Lunch"],
  snack: ["سناك", "Snack"],
  dinner: ["العشاء", "Dinner"]
};
