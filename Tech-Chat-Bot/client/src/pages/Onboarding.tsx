import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { UserProfile, calculateCalories } from "@/lib/bot-logic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Activity, Dumbbell, Apple, HeartPulse, Sparkles, Check, Flame, Battery, BatteryCharging, BatteryFull, ShieldAlert, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [, setLocation] = useLocation();
  const [direction, setDirection] = useState(0);
  
  const [formData, setFormData] = useState<UserProfile>({
    name: "حسن",
    gender: "male",
    age: 25,
    height: 170,
    weight: 70,
    goal: "weight_loss",
    activityLevel: "moderate",
    medicalConditions: [],
    injuries: [],
    coachTone: "balanced"
  });

  const totalSteps = 6; // Intro, Personal, Body, Goal, Activity/Health, Summary

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const completeOnboarding = () => {
    // Save profile to local storage
    const profileWithDefaults = {
      ...formData,
      points: 50,
      level: 1,
      foodXp: 0,
      weeklyStreak: 0,
      unlockedMeals: [],
      loggedMeals: [],
      isPro: false,
      isRamadan: false,
      isVoiceEnabled: false
    };
    
    localStorage.setItem("health-user-profile", JSON.stringify(profileWithDefaults));
    
    // Add initial welcome message to chat history if empty
    const savedChat = localStorage.getItem("health-chat-history");
    if (!savedChat) {
      const initialMsg = {
        id: "intro",
        text: `يا هلا والله ${formData.name}! 👋\n\nأنا كوتش صحتك. ضبطت لك ملفك وحسبت سعراتك.\n\nهدفك: ${formData.goal === 'weight_loss' ? 'تنشيف' : formData.goal === 'muscle_gain' ? 'تضخيم' : 'محافظة'}\nمستوى النشاط: ${formData.activityLevel === 'sedentary' ? 'خامل' : formData.activityLevel === 'active' ? 'عالي' : 'متوسط'}\n\nجاهز نبدأ؟`,
        sender: "bot",
        timestamp: new Date()
      };
      localStorage.setItem("health-chat-history", JSON.stringify([initialMsg]));
    }

    setLocation("/");
  };

  const updateField = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleSelection = (field: "medicalConditions" | "injuries", value: string) => {
    setFormData(prev => {
      const current = prev[field] || [];
      const exists = current.includes(value);
      return {
        ...prev,
        [field]: exists ? current.filter(i => i !== value) : [...current, value]
      };
    });
  };

  // Variants for slide animation
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "circOut"
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.3 }
    })
  };

  const progressPercentage = (step / (totalSteps - 1)) * 100;

  return (
    <div className="min-h-[100dvh] w-full bg-zinc-50 flex flex-col relative overflow-hidden font-sans select-none" dir="rtl">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-400/10 blur-[100px] rounded-full mix-blend-multiply" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-400/10 blur-[100px] rounded-full mix-blend-multiply" />
        <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-purple-400/10 blur-[80px] rounded-full mix-blend-multiply animate-pulse" />
      </div>

      {/* Header / Stepper */}
      <div className="pt-8 px-6 pb-2 z-20 flex flex-col gap-4">
        <div className="flex justify-between items-center text-sm font-medium text-zinc-400">
          <span>{step === 0 ? "البداية" : step === totalSteps - 1 ? "جاهز!" : `خطوة ${step} من ${totalSteps - 1}`}</span>
          {step > 0 && step < totalSteps - 1 && (
            <span className="text-emerald-600 font-bold">{Math.round(progressPercentage)}%</span>
          )}
        </div>
        
        {/* Animated Progress Bar */}
        <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute top-0 right-0 h-full bg-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "circOut" }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center p-6 z-10 w-full max-w-lg mx-auto">
        <AnimatePresence mode="wait" custom={direction}>
          
          {/* STEP 0: WELCOME */}
          {step === 0 && (
            <motion.div
              key="step0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex flex-col items-center text-center space-y-8"
            >
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-300 to-blue-400 rounded-full opacity-20 blur-2xl animate-pulse" />
                <div className="relative w-full h-full bg-white rounded-full shadow-2xl p-1 flex items-center justify-center border-4 border-white">
                    <img src="/health-avatar.png" className="w-full h-full object-cover rounded-full" alt="Logo" />
                </div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute bottom-2 right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg"
                >
                  <Sparkles size={20} fill="currentColor" />
                </motion.div>
              </div>
              
              <div className="space-y-3">
                <h1 className="text-4xl font-extrabold text-zinc-800 tracking-tight">كوتش الصحة</h1>
                <p className="text-zinc-500 text-lg leading-relaxed max-w-xs mx-auto">
                  رفيقك الشخصي لحياة صحية،<br/>بلهجتك وبدون تعقيد.
                </p>
              </div>

              <div className="w-full pt-4">
                 <Button 
                  onClick={handleNext} 
                  className="w-full h-16 text-xl rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  يلا نبدأ الرحلة! 🚀
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 1: NAME & GENDER */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-8 w-full"
            >
              <div className="space-y-2 text-center mb-6">
                <h2 className="text-3xl font-bold text-zinc-800">عرفنا عليك</h2>
                <p className="text-zinc-500">عشان نقدر نساعدك بشكل أفضل</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-lg">وش اسمك الكريم؟</Label>
                  <Input 
                    value={formData.name} 
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="مثل: حسن" 
                    className="h-14 text-lg rounded-2xl bg-white border-zinc-200 focus:border-emerald-500 focus:ring-emerald-500/20 text-right shadow-sm"
                  />
                   {formData.name === "حسن" && (
                     <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium px-2">
                       <Sparkles size={12} />
                       <span>حطينا "حسن" كافتراضي، غيره إذا حبيت!</span>
                     </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-lg">الجنس</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: "male", label: "ذكر", icon: "👨" },
                      { value: "female", label: "أنثى", icon: "👩" }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => updateField("gender", opt.value)}
                        className={`
                          relative overflow-hidden p-4 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-2
                          ${formData.gender === opt.value 
                            ? 'border-emerald-500 bg-emerald-50/80 text-emerald-800 shadow-md scale-[1.02]' 
                            : 'border-zinc-100 bg-white text-zinc-400 hover:bg-zinc-50'
                          }
                        `}
                      >
                         <span className="text-4xl mb-1 filter drop-shadow-sm">{opt.icon}</span>
                         <span className="font-bold text-lg">{opt.label}</span>
                         {formData.gender === opt.value && (
                           <motion.div 
                             layoutId="genderCheck"
                             className="absolute top-3 right-3 text-emerald-500"
                           >
                             <CheckCircle2 size={20} fill="currentColor" className="text-white" />
                           </motion.div>
                         )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: BODY METRICS */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-8 w-full"
            >
              <div className="space-y-2 text-center mb-6">
                <h2 className="text-3xl font-bold text-zinc-800">قياسات جسمك</h2>
                <p className="text-zinc-500">لحساب سعراتك واحتياجك بدقة</p>
              </div>

              <div className="space-y-8 bg-white/60 backdrop-blur-md p-6 rounded-[2rem] border border-white shadow-lg">
                {/* Age */}
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <Label className="text-lg font-medium text-zinc-600">العمر</Label>
                     <div className="bg-zinc-100 px-4 py-1 rounded-full font-bold text-zinc-800 text-xl font-mono">
                       {formData.age} <span className="text-xs text-zinc-400 font-sans">سنة</span>
                     </div>
                   </div>
                   <Slider 
                      value={[formData.age || 25]} 
                      min={10} max={80} step={1}
                      onValueChange={(v) => updateField("age", v[0])}
                      className="py-2"
                   />
                </div>

                {/* Height */}
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <Label className="text-lg font-medium text-zinc-600">الطول</Label>
                     <div className="bg-zinc-100 px-4 py-1 rounded-full font-bold text-zinc-800 text-xl font-mono">
                       {formData.height} <span className="text-xs text-zinc-400 font-sans">سم</span>
                     </div>
                   </div>
                   <Slider 
                      value={[formData.height || 170]} 
                      min={120} max={220} step={1}
                      onValueChange={(v) => updateField("height", v[0])}
                      className="py-2"
                   />
                   <div className="flex justify-between text-xs text-zinc-300 px-1">
                     <span>120</span>
                     <span>220</span>
                   </div>
                </div>

                {/* Weight */}
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <Label className="text-lg font-medium text-zinc-600">الوزن</Label>
                     <div className="bg-zinc-100 px-4 py-1 rounded-full font-bold text-zinc-800 text-xl font-mono">
                       {formData.weight} <span className="text-xs text-zinc-400 font-sans">كجم</span>
                     </div>
                   </div>
                   <Slider 
                      value={[formData.weight || 70]} 
                      min={30} max={200} step={0.5}
                      onValueChange={(v) => updateField("weight", v[0])}
                      className="py-2"
                   />
                   <div className="flex justify-between text-xs text-zinc-300 px-1">
                     <span>30</span>
                     <span>200</span>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: GOALS */}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6 w-full"
            >
               <div className="space-y-2 text-center mb-4">
                <h2 className="text-3xl font-bold text-zinc-800">وش هدفك الرئيسي؟</h2>
                <p className="text-zinc-500">بنجهز خطتك بناءً على اختيارك</p>
              </div>

              <div className="grid gap-4">
                {[
                  { value: "weight_loss", label: "تنشيف / خسارة وزن", icon: <Flame className="text-orange-500" size={24} />, desc: "حرق دهون، إبراز تفاصيل الجسم" },
                  { value: "muscle_gain", label: "تضخيم / بناء عضل", icon: <Dumbbell className="text-blue-500" size={24} />, desc: "زيادة الكتلة العضلية والقوة" },
                  { value: "maintenance", label: "صحة عامة / محافظة", icon: <HeartPulse className="text-red-500" size={24} />, desc: "تحسين اللياقة والأكل الصحي" }
                ].map((opt) => (
                   <div
                    key={opt.value}
                    onClick={() => updateField("goal", opt.value)}
                    className={`
                      relative cursor-pointer p-5 rounded-3xl border-2 transition-all duration-300
                      ${formData.goal === opt.value 
                        ? 'border-emerald-500 bg-white shadow-lg scale-[1.02] ring-4 ring-emerald-500/10' 
                        : 'border-zinc-100 bg-white/50 hover:bg-white text-zinc-400'
                      }
                    `}
                   >
                     <div className="flex items-start gap-4">
                       <div className={`p-3 rounded-2xl ${formData.goal === opt.value ? 'bg-emerald-50' : 'bg-zinc-50'}`}>
                         {opt.icon}
                       </div>
                       <div className="flex-1">
                         <h3 className={`text-lg font-bold mb-1 ${formData.goal === opt.value ? 'text-zinc-800' : 'text-zinc-500'}`}>{opt.label}</h3>
                         <p className="text-sm text-zinc-400">{opt.desc}</p>
                       </div>
                       {formData.goal === opt.value && (
                         <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                           <Check size={14} strokeWidth={3} />
                         </div>
                       )}
                     </div>
                   </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 4: ACTIVITY & HEALTH */}
          {step === 4 && (
            <motion.div
              key="step4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-8 w-full"
            >
               <div className="space-y-2 text-center mb-2">
                <h2 className="text-3xl font-bold text-zinc-800">نمط حياتك</h2>
                <p className="text-zinc-500">كيف حركتك وصحتك؟</p>
              </div>

              {/* Activity Segmented Control */}
              <div className="space-y-3">
                <Label className="text-lg">مستوى النشاط</Label>
                <div className="bg-zinc-100 p-1.5 rounded-2xl flex gap-1 relative">
                  {[
                    { value: "sedentary", label: "خامل", icon: <Battery className="rotate-90" size={16} /> },
                    { value: "moderate", label: "متوسط", icon: <BatteryCharging className="rotate-90" size={16} /> },
                    { value: "active", label: "عالي", icon: <BatteryFull className="rotate-90" size={16} /> }
                  ].map((lvl) => (
                    <button
                      key={lvl.value}
                      onClick={() => updateField("activityLevel", lvl.value)}
                      className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all duration-300 relative z-10
                        ${formData.activityLevel === lvl.value ? 'text-zinc-800 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}
                      `}
                    >
                      {lvl.icon}
                      {lvl.label}
                    </button>
                  ))}
                  {/* Sliding Background */}
                  <div 
                    className="absolute top-1.5 bottom-1.5 bg-white rounded-xl shadow-sm transition-all duration-300 z-0"
                    style={{
                      left: formData.activityLevel === "active" ? "4px" : formData.activityLevel === "moderate" ? "34%" : "67%",
                      width: "32%"
                    }}
                  />
                </div>
              </div>

              {/* Injuries Chips */}
              <div className="space-y-3">
                <Label className="text-lg flex items-center gap-2">
                  <ShieldAlert size={18} className="text-red-400" />
                  إصابات (اختياري)
                </Label>
                <div className="flex flex-wrap gap-2">
                   {["ركبة", "ظهر", "كتف", "كاحل", "معصم"].map((injury) => (
                     <Badge
                        key={injury}
                        variant="outline"
                        onClick={() => toggleSelection("injuries", injury)}
                        className={`
                          px-4 py-2.5 rounded-2xl cursor-pointer text-sm border transition-all
                          ${formData.injuries?.includes(injury) 
                            ? 'bg-red-50 border-red-200 text-red-600 font-bold' 
                            : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'
                          }
                        `}
                     >
                       {injury}
                     </Badge>
                   ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: SUMMARY & CTA */}
          {step === 5 && (
             <motion.div
              key="step5"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6 w-full"
            >
               <div className="text-center space-y-2 mb-4">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                    <Check size={32} strokeWidth={4} />
                  </div>
                  <h2 className="text-3xl font-bold text-zinc-800">تم تجهيز ملفك! 🎉</h2>
                  <p className="text-zinc-500">وهذي بطاقتك الصحية يا بطل</p>
              </div>

              {/* Health Card */}
              <div className="relative overflow-hidden rounded-[2rem] bg-zinc-900 text-white p-6 shadow-2xl">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 blur-[60px] rounded-full translate-y-1/2 -translate-x-1/2" />
                 
                 <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-3xl">
                        {formData.gender === 'male' ? '👨' : '👩'}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{formData.name}</h3>
                        <div className="flex gap-2 text-sm text-zinc-400 mt-1">
                          <span className="bg-zinc-800 px-2 py-0.5 rounded-md">{formData.age} سنة</span>
                          <span className="bg-zinc-800 px-2 py-0.5 rounded-md">{formData.height} سم</span>
                          <span className="bg-zinc-800 px-2 py-0.5 rounded-md">{formData.weight} كجم</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-px w-full bg-white/10" />

                    <div className="grid grid-cols-2 gap-4">
                       <div>
                         <div className="text-zinc-400 text-xs mb-1">الهدف</div>
                         <div className="font-bold text-lg flex items-center gap-2">
                            {formData.goal === 'weight_loss' ? <Flame size={16} className="text-orange-500"/> : <Dumbbell size={16} className="text-blue-500"/>}
                            {formData.goal === 'weight_loss' ? 'تنشيف' : formData.goal === 'muscle_gain' ? 'تضخيم' : 'محافظة'}
                         </div>
                       </div>
                       <div>
                         <div className="text-zinc-400 text-xs mb-1">السعرات المقترحة</div>
                         <div className="font-bold text-lg text-emerald-400 font-mono">
                           {calculateCalories(formData)} kcal
                         </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={completeOnboarding} 
                  className="w-full h-16 text-xl rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  اعتمد وادخل التطبيق
                  <ChevronLeft className="mr-2 h-6 w-6" />
                </Button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Footer Nav */}
      {step > 0 && (
        <div className="px-6 pb-8 pt-4 z-20 flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              disabled={step === 0}
              className="h-12 w-12 rounded-full hover:bg-zinc-100 text-zinc-400"
            >
              <ChevronRight size={24} />
            </Button>

            {step < 5 && (
              <Button 
                onClick={handleNext} 
                className="h-14 px-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg transition-all"
              >
                التالي
              </Button>
            )}
        </div>
      )}

    </div>
  );
}
