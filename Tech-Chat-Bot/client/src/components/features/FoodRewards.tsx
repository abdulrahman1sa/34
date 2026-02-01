// client/src/components/features/FoodRewards.tsx

import { motion } from "framer-motion";
import { Lock, Utensils, Star, X } from "lucide-react";
import { FOOD_LEVELS, FoodReward } from "@/lib/bot-logic";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";

interface FoodRewardsProps {
  currentXP: number;
  unlockedMeals: string[];
  onClose: () => void;
  onUnlock: (mealId: string) => void;
}

export function FoodRewards({ currentXP, unlockedMeals, onClose, onUnlock }: FoodRewardsProps) {
  const [selectedMeal, setSelectedMeal] = useState<FoodReward | null>(null);

  // Check for new unlocks
  useEffect(() => {
    FOOD_LEVELS.forEach(level => {
      if (currentXP >= level.xpThreshold && !unlockedMeals.includes(level.id)) {
        onUnlock(level.id);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    });
  }, [currentXP, unlockedMeals, onUnlock]);

  const maxXP = Math.max(...FOOD_LEVELS.map(l => l.xpThreshold));
  const progressPercent = Math.min((currentXP / maxXP) * 100, 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-zinc-50 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 bg-white border-b border-zinc-100 flex justify-between items-center shadow-sm">
        <div>
          <h2 className="text-xl font-black text-zinc-800 flex items-center gap-2">
            مكافآتي الغذائية <Utensils className="text-orange-500" />
          </h2>
          <p className="text-sm text-zinc-500">اجمع نقاط لفتح وجبات صحية ولذيذة!</p>
        </div>
        <button onClick={onClose} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200">
          <X size={20} className="text-zinc-500" />
        </button>
      </div>

      {/* Main XP Bar */}
      <div className="bg-white p-6 pt-0 border-b border-zinc-100">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-bold text-orange-600">{currentXP} XP</span>
          <span className="text-xs text-zinc-400">الحد الأقصى {maxXP} XP</span>
        </div>
        <div className="h-6 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200 relative">
          <motion.div 
            className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
          />
          {/* Milestones on bar */}
          {FOOD_LEVELS.map((level) => {
            const pos = (level.xpThreshold / maxXP) * 100;
            const isUnlocked = currentXP >= level.xpThreshold;
            return (
              <div 
                key={level.id}
                className={`absolute top-0 h-full w-1 transition-colors ${isUnlocked ? 'bg-white/50' : 'bg-zinc-300'}`}
                style={{ right: `${100 - pos}%` }} // RTL support
              />
            );
          })}
        </div>
      </div>

      {/* Levels List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {FOOD_LEVELS.map((level) => {
          const isUnlocked = currentXP >= level.xpThreshold;
          
          return (
            <motion.div 
              key={level.id}
              onClick={() => isUnlocked && setSelectedMeal(level)}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                isUnlocked 
                  ? "bg-white border-orange-200 shadow-lg shadow-orange-500/10 cursor-pointer hover:scale-[1.02]" 
                  : "bg-zinc-100 border-zinc-200 opacity-80 grayscale"
              }`}
            >
              <div className="flex items-stretch">
                {/* Image/Icon Area */}
                <div className={`w-24 flex items-center justify-center text-4xl ${isUnlocked ? "bg-orange-50" : "bg-zinc-200"}`}>
                  {level.imageEmoji}
                </div>
                
                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold text-lg ${isUnlocked ? "text-zinc-800" : "text-zinc-500"}`}>
                      {level.levelName}
                    </h3>
                    {isUnlocked ? (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        مفتوح <Star size={10} fill="currentColor" />
                      </span>
                    ) : (
                      <span className="bg-zinc-200 text-zinc-500 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        مغلق <Lock size={10} /> {level.xpThreshold} XP
                      </span>
                    )}
                  </div>
                  
                  {isUnlocked ? (
                    <p className="text-xs text-orange-600 font-medium mt-1">اضغط لعرض البديل الصحي اللذيذ!</p>
                  ) : (
                    <p className="text-xs text-zinc-400 mt-1">اجمع {level.xpThreshold - currentXP} نقطة إضافية لفتح هذا المستوى</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Meal Detail Modal */}
      {selectedMeal && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="bg-orange-500 p-8 text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 mix-blend-overlay"></div>
               <div className="text-6xl mb-4 animate-bounce">{selectedMeal.imageEmoji}</div>
               <h3 className="text-2xl font-black text-white">{selectedMeal.healthyAlternative}</h3>
               <p className="text-orange-100 font-medium">{selectedMeal.calories} سعرة حرارية</p>
               <button onClick={() => setSelectedMeal(null)} className="absolute top-4 right-4 text-white/60 hover:text-white">
                 <X size={24} />
               </button>
            </div>
            <div className="p-6">
              <h4 className="font-bold text-zinc-700 mb-2">طريقة التحضير / الوصف:</h4>
              <p className="text-zinc-600 leading-relaxed text-sm mb-6">
                {selectedMeal.description}
              </p>
              <button 
                onClick={() => setSelectedMeal(null)}
                className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
              >
                رائع! 😍
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </motion.div>
  );
}