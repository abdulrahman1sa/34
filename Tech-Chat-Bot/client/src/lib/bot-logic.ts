// client/src/lib/bot-logic.ts
// Local fallback logic follows the same Saudi dialect tone as SYSTEM_PROMPT in @shared/config/prompt.ts

export interface UserProfile {
  age?: number;
  height?: number; // cm
  weight?: number; // kg
  gender?: "male" | "female";
  goal?: "weight_loss" | "muscle_gain" | "maintenance";
  activityLevel?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  coachTone?: "kind" | "balanced" | "strict"; // New: Coach Tone
  medicalConditions?: string[];
  allergies?: string[];
  injuries?: string[];
  name?: string;
  isRamadan?: boolean;
  isPro?: boolean;
  isVoiceEnabled?: boolean;
  isSmartMode?: boolean; // New: Smart Mode Toggle
  apiKey?: string; // Client-side API Key (for testing only, not recommended for production)
  points?: number;
  level?: number;
  weeklyStreak?: number;
  foodXp?: number;
  unlockedMeals?: string[]; 
  loggedMeals?: LoggedMeal[];
}

export interface LoggedMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  timestamp: string;
  image?: string;
  confidence?: number;
  isSaudi?: boolean;
  healthTip?: string;
  portion?: number;
}

export interface BotResponse {
  text: string;
  options?: string[];
  action?: "save_profile" | "generate_plan" | "check_in" | "show_tracker" | "show_grocery" | "show_weekly_plan" | "show_insights" | "show_gamification" | "show_pro_modal" | "show_food_rewards" | "show_meal_scanner" | "change_tone";
  data?: any; // For structured AI responses
  updatedProfile?: UserProfile; // For profile updates from local logic
}

// ... (Keep existing constants and helpers) ...
const INTRO_MESSAGE = "ارحب يا بطل! 👋 معك الكوتش.\n\nأنا هنا عشان أضبط وضعك الصحي والأكل، لا مجاملات ولا لف ودوران.\n\nتبي تنحف؟ تبي تعضل؟ ولا بس تبي صحة؟ علمني علومك خلنا نبدأ.";

const ONBOARDING_STEPS = [
  { key: "gender", question: "بالبداية، عشان الحسابات تكون دقيقة.. أنت رجال ولا بنت؟", options: ["رجال", "بنت"] },
  { key: "age", question: "عطني عمرك بالسنوات (رقم بس):", type: "number" },
  { key: "height", question: "كم الطول؟ (بالـ سم):", type: "number" },
  { key: "weight", question: "وكم الوزن الحالي؟ (بالـ كجم):", type: "number" },
  { key: "goal", question: "وش الهدف اللي براسك؟", options: ["تنشيف (خسارة وزن)", "تضخيم (بناء عضل)", "محافظة (تعديل أكل)"] },
  { key: "activityLevel", question: "كيف حركتك اليومية؟ كن صريح!", options: ["خامل (ما أتحرك)", "خفيف (مشي بسيط)", "متوسط (تمرين 3-4)", "عالي (تمرين يومي)"] },
  { key: "coachTone", question: "كيف تبي أسلوبي معك؟", options: ["لطيف (شوي شوي)", "متوازن (نصيحة بحدود)", "صارم (جلد 🔥)"] }
];

export const DAILY_TARGETS = {
  water: 12, // cups
  steps: 8000
};

// --- Copy & Helpers ---

const TONE_PREFIXES = {
  kind: ["يا هلا وغلا", "حبيبي", "ما عليه", "خذ وقتك"],
  balanced: ["يا بطل", "اسمعني", "خلنا نركز", "ممتاز"],
  strict: ["واقف عندك!", "بدون أعذار", "ركز معي!", "لا يكثر"]
};

function getTonePrefix(tone: string = "balanced", name: string = "يا وحش") {
  const prefixes = TONE_PREFIXES[tone as keyof typeof TONE_PREFIXES];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  // Occasionally add the name
  if (Math.random() > 0.5) {
      return `${prefix} ${name}`;
  }
  return prefix;
}

// ... (Keep Food Rewards and other constants) ...
export interface FoodReward {
  id: string;
  levelName: string;
  xpThreshold: number;
  healthyAlternative: string;
  description: string;
  calories: number;
  imageEmoji: string;
}

export const FOOD_LEVELS: FoodReward[] = [
  { 
    id: "kitkat", 
    levelName: "راعي الكتكات 🍫", 
    xpThreshold: 100, 
    healthyAlternative: "ويفر شوكولاتة داكنة", 
    description: "بدل الكتكات المليان سكر، خذ لك ويفر دارك شوكلت. طعم يفك الأزمة وسكر أقل بواجد.",
    calories: 120,
    imageEmoji: "🍫"
  },
  { 
    id: "pizza", 
    levelName: "راعي البيتزا 🍕", 
    xpThreshold: 300, 
    healthyAlternative: "بيتزا تورتيلا شغل بيت", 
    description: "تورتيلا بر، صلصة طماط، خضار، وشوي موزاريلا لايت. تشبعك وما تحس بتأنيب الضمير.",
    calories: 350,
    imageEmoji: "🍕"
  },
  { 
    id: "burger", 
    levelName: "راعي البرقر 🍔", 
    xpThreshold: 600, 
    healthyAlternative: "برقر دجاج مشوي", 
    description: "صدر دجاج مفروم ومشوي، خبز بر، خس وطماط، وبدل المايونيز حط زبادي وخردل. بروتين عالي!",
    calories: 450,
    imageEmoji: "🍔"
  },
  { 
    id: "shawarma", 
    levelName: "راعي الشاورما 🌯", 
    xpThreshold: 1000, 
    healthyAlternative: "شاورما صاج صحية", 
    description: "دجاج متبل بزبادي وبهارات، خبز صاج بر، وثومية خفيفة (زبادي يوناني).",
    calories: 380,
    imageEmoji: "🌯"
  },
  { 
    id: "protein_meal", 
    levelName: "الوحش 🥩", 
    xpThreshold: 1500, 
    healthyAlternative: "ستيك تندرلوين", 
    description: "قطعة ستيك نظيفة مشوية مع بطاطس مهروسة (بدون دسم زايد). وجبة ملوك!",
    calories: 500,
    imageEmoji: "🥩"
  }
];

export async function analyzeFoodImage(imageUri: string): Promise<LoggedMeal> {
  await new Promise(r => setTimeout(r, 2000));

  const SAUDI_RESULTS = [
    { name: "كبسة دجاج (صدر)", calories: 550, protein: 45, carbs: 60, fats: 12, confidence: 0.94, isSaudi: true, healthTip: "نصيحة الكوتش: شيل الجلد وكل معها سلطة عشان تشبع، ولا تكثر رز!" },
    { name: "شاورما صاروخ", calories: 480, protein: 30, carbs: 45, fats: 20, confidence: 0.88, isSaudi: true, healthTip: "نصيحة الكوتش: المايونيز مصيبة، خففه أو اطلبها بدونه المرة الجاية." },
    { name: "مرقوق لحم", calories: 420, protein: 25, carbs: 50, fats: 15, confidence: 0.91, isSaudi: true, healthTip: "نصيحة الكوتش: المرقوق بالبر ممتاز، بس انتبه من كمية اللحم المدهن." },
    { name: "سمبوسة فرن", calories: 270, protein: 12, carbs: 30, fats: 10, confidence: 0.96, isSaudi: true, healthTip: "نصيحة الكوتش: بالفرن يا بطل! المقلي خله للعدو." },
    { name: "تمر وقهوة", calories: 150, protein: 2, carbs: 35, fats: 0, confidence: 0.85, isSaudi: true, healthTip: "نصيحة الكوتش: 3-5 تمرات كافية، لا تخلص السكرية كلها!" }
  ];

  const GENERIC_RESULTS = [
    { name: "سلطة دجاج", calories: 320, protein: 35, carbs: 12, fats: 15, confidence: 0.98, healthTip: "خيارك ممتاز، استمر!" },
    { name: "برقر لحم", calories: 650, protein: 30, carbs: 45, fats: 35, confidence: 0.92, healthTip: "اطلبها بدون جبن وبطاطس المرة الجاية، وفر سعراتك." }
  ];

  const isSaudi = Math.random() < 0.6;
  const pool = isSaudi ? SAUDI_RESULTS : GENERIC_RESULTS;
  const result = pool[Math.floor(Math.random() * pool.length)];
  
  return {
    id: Date.now().toString(),
    ...result,
    timestamp: new Date().toISOString(),
    image: imageUri,
    portion: 1.0
  };
}

export const MEAL_PLANS: any = {
  standard: {
    weight_loss: {
      title: "جدول التنشيف (حرق دهون)",
      meals: [
        { name: "الفطور", items: ["3 بيضات مسلوقة", "توست بر", "خيارة وطماطم", "شاهي بدون سكر"] },
        { name: "سناك 1", items: ["تفاحة", "زبادي قليل الدسم"] },
        { name: "الغداء", items: ["صدر دجاج مشوي (كف اليد)", "5 ملاعق رز", "سلطة خضراء (كثر منها)"] },
        { name: "سناك 2", items: ["3 تمرات", "قهوة عربية"] },
        { name: "العشاء", items: ["تونا بالماء", "سلطة مشكلة", "ملعقة زيت زيتون"] }
      ]
    },
    muscle_gain: { title: "جدول التضخيم", meals: [] }, maintenance: { title: "جدول المحافظة", meals: [] }
  },
  ramadan: {
    weight_loss: { title: "جدول رمضان (تنشيف)", meals: [] }, muscle_gain: { title: "جدول رمضان (تضخيم)", meals: [] }, maintenance: { title: "جدول رمضان (توازن)", meals: [] }
  }
};

const SAUDI_FOOD_DB = {
  "كبسة دجاج": 450,
  "جريش": 300,
  "قرصان": 280,
  "تمر (حبة)": 23,
  "سمبوسة فرن": 90,
  "لقيمات (حبة)": 45
};

export function calculateLevel(points: number) {
  return Math.floor(points / 100) + 1;
}

export function getLevelTitle(level: number) {
  if (level < 3) return "مبتدئ نشيط 🌱";
  if (level < 6) return "بطل واعد 🥉";
  if (level < 10) return "رياضي محترف 🥈";
  return "أسطورة الصحة 🥇";
}

export function generateInsights(profile: UserProfile, history: any) {
  const insights = [];
  const tone = profile.coachTone || "balanced";
  
  if (profile.activityLevel === "active" && profile.goal === "weight_loss") {
    const msg = tone === "strict" 
      ? "تنبيه! قاعد تهلك نفسك تمرين وأكلك قليل. ارفع البروتين ولا بيطيح عضلك!"
      : "يا بطل، نشاطك عالي ما شاء الله، تأكد إنك تاكل بروتين كفاية.";
    insights.push({ type: "warning", text: msg });
  }
  
  if (profile.isRamadan) {
    insights.push({ type: "tip", text: "توقعات الأسبوع: الجفاف عدوك في الصيام. اشرب موية صح وقت الغبقة." });
  }
  
  if (insights.length === 0) {
    const msg = tone === "strict" 
      ? "وضعك بالسليم، بس لا ترخي! نبي التزام أقوى الأسبوع الجاي."
      : "أمورك طيبة وماشي صح. استمر يا وحش!";
    insights.push({ type: "success", text: msg });
  }
  return insights;
}

export function calculateCalories(profile: UserProfile): number {
  if (!profile.weight || !profile.height || !profile.age) return 2000;
  let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
  bmr += profile.gender === "female" ? -161 : 5;
  const activityMultipliers: any = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
  const activity = profile.activityLevel || "sedentary";
  return Math.round(bmr * activityMultipliers[activity]);
}

export function generateGroceryList(planType: string, isRamadan: boolean) {
  return {
    "بروتينات": ["بيض", "صدر دجاج", "لحم مفروم (قليل دسم)", "تونا", "سمك فيليه", "زبادي يوناني", "لبن"],
    "نشويات": ["توست بر", "رز مزة", "شوفان", "بطاطس", "قرصان بر"],
    "خضار وفواكه": ["خيار", "طماط", "خس", "ليمون", "بصل", "فواكه", "موز", "تمر"],
    "أخرى": ["زيت زيتون", "شاهي", "قهوة", "بهارات مشكلة", "ملح"]
  };
}

// === NEW API INTEGRATION ===

export async function getSmartBotResponse(
  message: string, 
  userProfile: UserProfile, 
  chatHistory: any[]
): Promise<BotResponse> {
  try {
    // 8-second timeout for robustness
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        context: {
          profile: userProfile,
          history: chatHistory,
          stats: { steps: 5000, water: 4, calories: 1200 } // Mock stats for now
        },
        apiKey: userProfile.apiKey // Pass client-side key if exists (for testing)
      }),
      signal: controller.signal
    }).catch(err => {
        throw new Error("Network error or timeout");
    });
    
    clearTimeout(timeoutId);

    if (!res.ok) {
        console.warn("Smart endpoint failed, falling back to local logic. Status:", res.status);
        
        if (res.status === 401) {
            // Missing API Key - inform user
            return { 
                text: "⚠️ **الذكاء يحتاج تفعيل!**\n\nروح للإعدادات ⚙️ وحط مفتاح OpenAI عشان الكوتش يصير أذكى. أو استمر بالوضع السريع الحالي."
            };
        }
        
        // Fallback silently to local logic
        const localRes = getLocalBotResponse(message, userProfile);
        return { 
            ...localRes, 
            text: localRes.text + "\n\n(ملاحظة: شغالين بالوضع السريع ⚡️)" 
        };
    }

    const data = await res.json();
    
    // Convert Server Response to BotResponse
    if (data.type === "weekly_plan") return { text: "📅 **جدولك الذكي جاهز!**", action: "show_weekly_plan", data: data.data };
    if (data.type === "feedback") return { text: data.data.summary, action: "show_insights", data: data.data };
    if (data.type === "injury") return { text: "🩹 **تحليل الإصابة**", data: data.data };
    if (data.type === "text") return { text: data.data.text || "تم!" };
    
    return { text: data.data?.text || data.text || "تم!" };

  } catch (err) {
    console.error("Smart bot error, fallback active:", err);
    const localRes = getLocalBotResponse(message, userProfile);
    return { 
        ...localRes,
        text: localRes.text + "\n\n(ملاحظة: شغالين محلي مؤقتاً ⚡️)"
    };
  }
}

// === OLD LOGIC (FALLBACK) ===

export function getLocalBotResponse(input: string, userProfile: UserProfile): BotResponse & { updatedProfile?: UserProfile } {
  const normalizedInput = input.toLowerCase().trim();
  const tone = userProfile.coachTone || "balanced";
  const userName = userProfile.name || "حسن";
  const prefix = getTonePrefix(tone, userName);

  // --- Smart Mode Toggle ---
  if (normalizedInput.includes("ذكاء") || normalizedInput.includes("smart")) {
      const newState = !userProfile.isSmartMode;
      return { 
          text: newState ? "🤖 **فعلنا وضع الذكاء!**\n\nالحين مخي صار أكبر وأفهم عليك أكثر." : "🧠 **رجعنا للوضع المحلي.**\n\nسريع وبسيط.",
          updatedProfile: { ...userProfile, isSmartMode: newState },
          action: "save_profile"
      };
  }

  // --- Change Tone Logic ---
  if (normalizedInput.includes("نبرة") || normalizedInput.includes("أسلوب")) {
    return { 
      text: `${prefix}، تبي تغير الأسلوب؟ أبشر، اختر اللي يناسبك:`,
      options: ["لطيف", "متوازن", "صارم"],
      action: "change_tone"
    };
  }
  
  if (normalizedInput === "لطيف") return { text: `خلاص يا ${userName}، بكون معك هادي ولطيف. 🌸`, updatedProfile: { ...userProfile, coachTone: "kind" }, action: "save_profile" };
  if (normalizedInput === "متوازن") return { text: `تمام يا ${userName}، خير الأمور أوسطها. 👍`, updatedProfile: { ...userProfile, coachTone: "balanced" }, action: "save_profile" };
  if (normalizedInput === "صارم") return { text: `أبشر بالشدة يا ${userName}! ما فيه دلع بعد اليوم. 🔥`, updatedProfile: { ...userProfile, coachTone: "strict" }, action: "save_profile" };

  // --- Meal Scanning Logic ---
  if (normalizedInput.includes("صور") || normalizedInput.includes("كاميرا") || normalizedInput.includes("وجبة")) {
    return { text: `📸 **تحليل الوجبة**\n\nصور أكلك يا ${userName} خلني أشوف وش قاعد تاكل وأحسب لك السعرات.`, action: "show_meal_scanner" };
  }

  // --- VIP Logic ---
  if (normalizedInput.includes("vip") || normalizedInput.includes("pro")) {
    return { 
      text: userProfile.isPro 
        ? `💎 **أنت VIP يا ${userName}!**\n\nماخذ كل المزايا، استمتع.` 
        : `🌟 **تبي تصير VIP يا ${userName}؟**\n\nخطط دقيقة وتحليل إصابات عميق وتصدير ملفات. تستاهل الترقية.`,
      action: "show_pro_modal"
    };
  }

  // --- Voice Logic ---
  if (normalizedInput.includes("صوت") || normalizedInput.includes("تكلم")) {
     const newVoiceState = !userProfile.isVoiceEnabled;
     return {
       text: newVoiceState 
         ? "🎙️ **شغلت لك الصوت!**\n\nالحين أرد عليك صوت وكتابة."
         : "🔇 **كتمت الصوت.**\n\nنرجع للكتابة بس.",
       updatedProfile: { ...userProfile, isVoiceEnabled: newVoiceState },
       action: "save_profile"
     };
  }

  // --- Food XP / Rewards ---
  if (normalizedInput.includes("مكافآتي") || normalizedInput.includes("وجبات") || normalizedInput.includes("جوائز")) {
    return { text: "🍔 **مكافآتك الغذائية**\n\nكل ما التزمت، فتحت لك وجبة صحية جديدة تبرد الخاطر!", action: "show_food_rewards" };
  }

  // --- Gamification ---
  if (normalizedInput.includes("تحدي") || normalizedInput.includes("نقاط") || normalizedInput.includes("مستوى") || normalizedInput.includes("ملفي")) {
    return { text: `🏆 **إحصائياتك يا ${userName}**\n\nشوف مستواك يا وحش!`, action: "show_gamification" };
  }
  
  // --- Insights ---
  if (normalizedInput.includes("توقعات") || normalizedInput.includes("تحليل")) {
    return { text: `📊 **توقعات الأسبوع**\n\nخلنا نشوف وش وضعك هالأسبوع يا ${userName}.`, action: "show_insights" };
  }

  // --- Toggle Ramadan Mode ---
  if (normalizedInput.includes("وضع رمضان") || normalizedInput.includes("صيام")) {
    const newStatus = !userProfile.isRamadan;
    return {
      text: newStatus 
        ? "🌙 **فعلنا وضع رمضان!**\n\nتقبل الله. الجداول صارت (فطور، غبقة، سحور). انتبه للموية!"
        : "☀️ **رجعنا للوضع العادي.**\n\nفطور، غداء، عشاء. بالتوفيق!",
      updatedProfile: { ...userProfile, isRamadan: newStatus },
      action: "save_profile"
    };
  }

  // --- Belly Fat / Weight Loss Intent (LOCAL FALLBACK) ---
  const bellyKeywords = ["كرش", "بطن", "تنحيف", "انحف", "خسارة وزن", "وزن زايد", "سمنة", "دهون"];
  if (bellyKeywords.some(k => normalizedInput.includes(k))) {
    const hasProfile = userProfile.weight && userProfile.height;
    
    if (!hasProfile) {
      return {
        text: `فهمتك يا ${userName}! الكرش يطلع من السكر والنشويات الزايدة. خلنا نضبطها:\n\n• رز ربع كاس بس (أو بدله قرنبيط)\n• بروتين كف يدك كل وجبة (دجاج، سمك، لحم)\n• قص المشروبات السكرية 100%\n• 8000 خطوة يومياً\n\nكم وزنك وطولك عشان أحسب لك السعرات بالضبط؟`
      };
    }
    
    const calories = calculateCalories(userProfile);
    const proteinTarget = Math.round(userProfile.weight! * 2); // 2g per kg
    
    return {
      text: `خلنا نتخلص من الكرش يا ${userName}! 💪\n\n**خطتك:**\n• ${calories - 500} سعرة يومياً (عجز 500)\n• ${proteinTarget}g بروتين\n• رز/خبز نص الكمية العادية\n• مشي 8000 خطوة\n• قص السكريات والمشروبات الغازية\n\n**مثال وجبة:**\nصدر دجاج مشوي (كف اليد) + 3 ملاعق رز + سلطة كبيرة\n\nتبي جدول كامل؟`,
      options: ["يلا أنشئ لي جدول", "وش آكل الحين؟", "تمام فهمت"]
    };
  }

  // --- START INTENTS (Saudi Confirmations) ---
  const START_INTENTS = ["توكلنا على الله", "يلا", "ابدأ", "جاهز", "تمام", "ابشر", "هلا", "مرحبا"];
  if (START_INTENTS.some(i => normalizedInput.includes(i)) && !userProfile.gender) {
    return { text: ONBOARDING_STEPS[0].question, options: ONBOARDING_STEPS[0].options };
  }

  // --- Onboarding Logic ---
  if (!userProfile.gender) {
    if (normalizedInput.includes("ذكر") || normalizedInput.includes("رجال")) return { text: ONBOARDING_STEPS[1].question, updatedProfile: { ...userProfile, gender: "male" } };
    if (normalizedInput.includes("أنثى") || normalizedInput.includes("بنت")) return { text: ONBOARDING_STEPS[1].question, updatedProfile: { ...userProfile, gender: "female" } };
    // Fallback for this step
    return { text: "حياك الله! عشان أضبط لك الجدول، بس علمني أنت رجال ولا بنت؟", options: ["رجال", "بنت"] };
  }
  if (!userProfile.age) {
    const age = Number(normalizedInput.match(/\d+/)?.[0]);
    if (age && age > 10 && age < 100) return { text: ONBOARDING_STEPS[2].question, updatedProfile: { ...userProfile, age } };
    return { text: "معليش، بس كم عمرك بالأرقام؟ (مثلاً: 25)" };
  }
  if (!userProfile.height) {
    const height = Number(normalizedInput.match(/\d+/)?.[0]);
    if (height && height > 50 && height < 250) return { text: ONBOARDING_STEPS[3].question, updatedProfile: { ...userProfile, height } };
    return { text: "لاهنت، كم طولك بالـ سم؟ (مثلاً: 170)" };
  }
  if (!userProfile.weight) {
    const weight = Number(normalizedInput.match(/\d+/)?.[0]);
    if (weight && weight > 20 && weight < 300) return { text: ONBOARDING_STEPS[4].question, options: ONBOARDING_STEPS[4].options, updatedProfile: { ...userProfile, weight } };
    return { text: "كم وزنك الحالي بالكيلو؟ (مثلاً: 70)" };
  }
  if (!userProfile.goal) {
    let goal: any = "maintenance";
    if (normalizedInput.includes("خسارة") || normalizedInput.includes("تنحيف") || normalizedInput.includes("تنشيف")) goal = "weight_loss";
    if (normalizedInput.includes("عضل") || normalizedInput.includes("تضخيم") || normalizedInput.includes("بناء")) goal = "muscle_gain";
    if (normalizedInput.includes("محافظة") || normalizedInput.includes("تعديل") || normalizedInput.includes("توازن")) goal = "maintenance";
    
    // Explicit selection required if not detected clearly, but default to showing options again
    if (normalizedInput.includes("تنشيف") || normalizedInput.includes("تضخيم") || normalizedInput.includes("محافظة")) {
        return { text: ONBOARDING_STEPS[5].question, options: ONBOARDING_STEPS[5].options, updatedProfile: { ...userProfile, goal } };
    }
    return { text: "وش هدفك يا وحش؟", options: ["تنشيف (خسارة وزن)", "تضخيم (بناء عضل)", "محافظة (تعديل أكل)"] };
  }
  if (!userProfile.activityLevel) {
    let activity: any = null;
    if (normalizedInput.includes("خامل") || normalizedInput.includes("ما أتحرك")) activity = "sedentary";
    if (normalizedInput.includes("خفيف") || normalizedInput.includes("مشي")) activity = "light";
    if (normalizedInput.includes("متوسط")) activity = "moderate";
    if (normalizedInput.includes("عالي")) activity = "active";
    
    if (activity) return { text: ONBOARDING_STEPS[6].question, options: ONBOARDING_STEPS[6].options, updatedProfile: { ...userProfile, activityLevel: activity } };
    return { text: "كيف نشاطك اليومي؟", options: ["خامل (ما أتحرك)", "خفيف (مشي بسيط)", "متوسط (تمرين 3-4)", "عالي (تمرين يومي)"] };
  }
  if (!userProfile.coachTone) {
    let tone: any = null;
    if (normalizedInput.includes("لطيف")) tone = "kind";
    if (normalizedInput.includes("متوازن")) tone = "balanced";
    if (normalizedInput.includes("صارم") || normalizedInput.includes("جلد")) tone = "strict";
    
    if (tone) {
        const completedProfile = { ...userProfile, coachTone: tone, points: 50, level: 1, foodXp: 0, unlockedMeals: [] };
        const calories = calculateCalories(completedProfile);
        return { 
        text: `${getTonePrefix(tone, userName)} يا بطل! 👏\n\nحسبت لك احتياجك اليومي وهو تقريباً **${calories} سعرة**.\n\nجاهزين يا ${userName}؟ تقدر تطلب جدولك، أو تبدأ تصور وجباتك.`,
        options: ["أنشئ جدول غذائي", "صوّر وجبتك", "ماء وخطوات", "مكافآتي الغذائية"],
        updatedProfile: completedProfile,
        action: "save_profile"
        };
    }
    return { text: "كيف تبي أسلوبي معك؟", options: ["لطيف (شوي شوي)", "متوازن (نصيحة بحدود)", "صارم (جلد 🔥)"] };
  }

  // --- Features Logic ---

  if (normalizedInput.includes("جدول") || normalizedInput.includes("أسبوعي")) {
    if (!userProfile.weight) return { text: "لسه ما عرفتك زين. كمل إعداد ملفك أول!", options: ["جاهز"] };
    return { 
      text: userProfile.isRamadan 
        ? "🌙 **جدولك الرمضاني جاهز!**\n\nاضغط تحت وشيك عليه." 
        : "📅 **جدولك الأسبوعي جاهز!**\n\nاضغط تحت وشيك عليه.",
      action: "show_weekly_plan"
    };
  }

  if (normalizedInput.includes("مشتريات") || normalizedInput.includes("مقاضي")) {
     return { text: "🛒 **قائمة المقاضي**\n\nهذي الأغراض اللي تحتاجها عشان تلتزم.", action: "show_grocery" };
  }

  if (normalizedInput.includes("ماء") || normalizedInput.includes("خطوات") || normalizedInput.includes("تتبع") || normalizedInput.includes("تابع")) {
    return { text: `💧 **متابع النشاط**\n\nبشرني يا ${userName}، كيف همتك اليوم؟`, action: "show_tracker" };
  }

  if (normalizedInput.includes("إصابة") || normalizedInput.includes("الم") || normalizedInput.includes("ألم")) {
    return { text: "سلامات ما تشوف شر! 🤕\nوين الألم بالضبط؟", options: ["ركبة", "ظهر", "كتف", "كاحل"] };
  }
  
  if (normalizedInput.includes("ركبة")) return { text: "🩺 **للركبة:**\n• كمادات ثلج.\n• قوّ عضلة الفخذ.\n• لا تسوي سكوات عميق هالفترة." };
  if (normalizedInput.includes("ظهر")) return { text: "🩺 **للظهر:**\n• لا تجلس واجد.\n• سوي إطالات.\n• نم على مرتبة زينة." };

  if (normalizedInput.includes("تحفيز")) {
    const quotes = [
      tone === "strict" ? "قوم تحرك! الراحة ما تبني جسم." : `يا ${userName}، كل خطوة تقربك لهدفك.`,
      "الجسم اللي تبيه ينتظرك بعد التعب.",
      "لا توقف لما تتعب، وقف لما تخلص!",
      "الأكل الصحي احترام لجسمك، مو عقاب."
    ];
    return { text: quotes[Math.floor(Math.random() * quotes.length)] };
  }

  if (normalizedInput.includes("تحليل") || normalizedInput.includes("وضعي")) {
     if (!userProfile.weight) return { text: "لسه ما كملنا التعارف. جاهز؟", options: ["جاهز"] };
     const bmi = userProfile.weight && userProfile.height ? (userProfile.weight / ((userProfile.height/100) ** 2)).toFixed(1) : "?";
     return { text: `📋 **تقريرك:**\n\n• مؤشر الكتلة (BMI): **${bmi}**\n• احتياجك: **${calculateCalories(userProfile)}** سعرة\n• الهدف: ${userProfile.goal === "weight_loss" ? "تنشيف" : "تضخيم"}\n• الوضع: ${userProfile.isRamadan ? "رمضان 🌙" : "عادي ☀️"}\n\n${prefix}، الوضع يبشر بالخير!` };
  }

  // --- Common Food / Hunger Queries ---
  if (normalizedInput.includes("جيعان") || normalizedInput.includes("جوعان") || normalizedInput.includes("وش آكل")) {
    const mealExamples = [
      "صدر دجاج مشوي (كف يدك) + 3 ملاعق رز + سلطة كبيرة (حوالي 450 سعرة)",
      "3 بيضات مسلوقة + توست بر + خيار وطماطم (300 سعرة)",
      "تونا بالماء + سلطة مشكلة + ملعقة زيت زيتون (280 سعرة)",
      "قطعة سمك مشوي + بطاطس مسلوقة نص كاس + خضار سوتيه (380 سعرة)"
    ];
    const randomMeal = mealExamples[Math.floor(Math.random() * mealExamples.length)];
    return {
      text: `يا ${userName}! تفضل وجبة سريعة وصحية:\n\n**${randomMeal}**\n\nتبي أقترح لك شي ثاني؟`,
      options: ["اقترح وجبة ثانية", "كم سعراتي اليومية؟", "تمام شكراً"]
    };
  }

  // --- General Advice Queries ---
  if (normalizedInput.includes("وش اسوي") || normalizedInput.includes("ساعدني") || normalizedInput.includes("نصيحة")) {
    const hasGoal = userProfile.goal;
    if (!hasGoal) {
      return {
        text: `علمني يا ${userName}، وش هدفك بالضبط؟\n\n• تبي تنحف (خسارة وزن)\n• تبي تعضّل (بناء عضل)\n• ولا بس تحافظ على وضعك؟`,
        options: ["تنشيف (خسارة وزن)", "تضخيم (بناء عضل)", "محافظة (تعديل أكل)"]
      };
    }
    
    return {
      text: `خلني أوجهك يا ${userName}:\n\n• **الأكل:** ${userProfile.goal === 'weight_loss' ? 'عجز 500 سعرة' : 'زيادة 300 سعرة'}\n• **البروتين:** ${userProfile.weight ? Math.round(userProfile.weight * 2) : 150}g يومياً\n• **الخطوات:** 8000 خطوة على الأقل\n• **الماء:** 3 لتر (12 كاس)\n\nتبي جدول مفصل؟`,
      options: ["يلا أنشئ لي جدول", "كم سعرات الكبسة؟", "تمام فهمت"]
    };
  }

  // --- Calorie Queries for Specific Foods ---
  if (normalizedInput.includes("سعرات") || normalizedInput.includes("كم")) {
    if (normalizedInput.includes("كبسة")) return { text: "**كبسة دجاج:** حوالي 550-650 سعرة للصحن الوسط (حسب الدهن والرز). نصيحة: شيل جلد الدجاج وقلل الرز!" };
    if (normalizedInput.includes("شاورما")) return { text: "**شاورما دجاج:** 480-550 سعرة. المايونيز هو المصيبة! احذفه أو خففه." };
    if (normalizedInput.includes("برقر")) return { text: "**برقر لحم:** 600-750 سعرة (مع بطاطس). بدون بطاطس وجبن: حوالي 450 سعرة." };
    if (normalizedInput.includes("تمر")) return { text: "**التمر:** 23 سعرة للحبة. 3-5 تمرات يكفي، لا تخلص السكرية!" };
    
    return {
      text: `يا ${userName}، سم وش الأكل اللي تبي تعرف سعراته؟\n\nأو صوّره وأنا أحسب لك!`,
      options: ["كم سعرات الكبسة؟", "كم سعرات الشاورما؟", "صوّر وجبتك"]
    };
  }

  // --- Deduping & Intelligent Fallback ---
  // If we reach here, no specific intent was matched.
  // Instead of a generic "I don't understand", try to guide them.
  
  // Check for common affirmations/confirmations that might be out of context
  if (START_INTENTS.some(i => normalizedInput.includes(i))) {
      return { 
          text: `حياك الله يا ${userName}! 👏\n\nوش تبي نسوي اليوم؟`,
          options: ["أنشئ جدول غذائي", "صوّر وجبتك", "تحدي الأسبوع", "نصيحة سريعة"]
      };
  }

  return {
    text: `معليش يا ${userName}، ما فهمت عليك زين 😅.\n\nعلمني وش تبي بالضبط؟`,
    options: ["جدول غذائي", "تحليل وجبة", "تغيير الهدف", "وضع رمضان"]
  };
}

export function getBotResponse(input: string, userProfile: UserProfile): BotResponse & { updatedProfile?: UserProfile } {
    return getLocalBotResponse(input, userProfile);
}

export { INTRO_MESSAGE, SAUDI_FOOD_DB };