import { motion } from "framer-motion";
import { Share2, X } from "lucide-react";
import { MEAL_PLANS, UserProfile, calculateCalories } from "@/lib/bot-logic";

interface WeeklyPlanProps {
  userProfile: UserProfile;
  onClose: () => void;
}

export function WeeklyPlan({ userProfile, onClose }: WeeklyPlanProps) {
  const mode = userProfile.isRamadan ? "ramadan" : "standard";
  const goal = userProfile.goal || "maintenance";
  const planData = MEAL_PLANS[mode][goal];
  const calories = calculateCalories(userProfile) + (goal === "weight_loss" ? -500 : goal === "muscle_gain" ? 300 : 0);

  const days = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

  const handleShare = () => {
    // Generate simple text representation
    let text = `📅 *${planData.title}*\n\n`;
    text += `🔥 سعراتك: ${calories}\n`;
    text += `👤 الهدف: ${goal === "weight_loss" ? "تنشيف" : "تضخيم"}\n\n`;
    planData.meals.forEach((m: { name: string; items: string[] }) => {
      text += `🍳 *${m.name}:* ${m.items.join(", ")}\n`;
    });
    
    navigator.clipboard.writeText(text);
    alert("نسخت الجدول، ارسله لخويك!");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
    >
      <div className="bg-white w-full max-w-lg max-h-[85vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-emerald-50 border-b border-emerald-100 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-emerald-900">{planData.title}</h2>
            <p className="text-sm text-emerald-600 mt-1">
              {calories} سعرة حرارية • {userProfile.isRamadan ? "نظام صيام" : "نظام عادي"}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Plan Cards */}
          <div className="space-y-4">
             {planData.meals.map((meal: { name: string; items: string[] }, idx: number) => (
               <div key={idx} className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm">
                 <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-primary block"></span>
                   {meal.name}
                 </h3>
                 <ul className="space-y-2">
                   {meal.items.map((item: string, i: number) => (
                     <li key={i} className="text-sm text-zinc-600 flex items-start gap-2">
                       <span className="text-zinc-300">•</span>
                       {item}
                     </li>
                   ))}
                 </ul>
               </div>
             ))}
          </div>

          {/* Weekly Schedule Preview (Simplified) */}
          <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
            <h3 className="font-bold text-zinc-700 mb-3">جدولك الأسبوعي</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {days.map((day, i) => (
                <div key={i} className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center text-xs border ${i === 0 ? "bg-primary text-white border-primary" : "bg-white text-zinc-500 border-zinc-200"}`}>
                  <span className="font-bold">{day}</span>
                  <span className="opacity-70 mt-1">يوم {i+1}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-400 mt-2 text-center">النظام ثابت، بس نوع في البروتين (دجاج/سمك/لحم) بنفس الكمية.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 bg-white flex gap-3">
          <button onClick={handleShare} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
            <Share2 size={18} />
            انسخ الجدول
          </button>
        </div>
      </div>
    </motion.div>
  );
}