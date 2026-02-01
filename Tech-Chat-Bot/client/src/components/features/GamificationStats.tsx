import { motion } from "framer-motion";
import { Award, Zap, Star } from "lucide-react";
import { calculateLevel, getLevelTitle } from "@/lib/bot-logic";

interface GamificationStatsProps {
  points: number;
  streak: number;
  onClose: () => void;
}

export function GamificationStats({ points, streak, onClose }: GamificationStatsProps) {
  const level = calculateLevel(points);
  const title = getLevelTitle(level);
  const progressToNext = (points % 100);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-x-4 top-20 z-40 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-yellow-100"
      onClick={onClose}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center border-2 border-yellow-400 shadow-sm">
            <span className="text-2xl">👑</span>
          </div>
          <div>
            <h3 className="font-bold text-zinc-800 text-lg">{title}</h3>
            <p className="text-sm text-zinc-500 font-medium">المستوى {level}</p>
          </div>
        </div>
        <div className="text-center bg-orange-50 px-4 py-2 rounded-xl border border-orange-100">
          <p className="text-xs text-orange-400 font-bold mb-0.5">صامل</p>
          <p className="text-xl font-black text-orange-500 flex items-center justify-center gap-1">
            {streak} <Zap size={16} fill="currentColor" />
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-4 bg-zinc-100 rounded-full overflow-hidden mb-2">
        <motion.div 
          className="absolute top-0 right-0 h-full bg-gradient-to-l from-yellow-400 to-orange-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressToNext}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-zinc-400 px-1 font-medium">
        <span>{points} نقطة</span>
        <span>باقي {100 - progressToNext} للمستوى الجاي</span>
      </div>

      {/* Weekly Challenge */}
      <div className="mt-6 pt-4 border-t border-dashed border-zinc-200">
        <h4 className="text-sm font-bold text-zinc-700 mb-3 flex items-center gap-1">
          <Star size={16} className="text-purple-500" fill="currentColor" /> تحدي الأسبوع
        </h4>
        <div className="flex items-center justify-between bg-purple-50 p-4 rounded-xl border border-purple-100">
          <span className="text-sm text-purple-900 font-bold">مشيك يوصل 50 ألف؟</span>
          <span className="text-xs bg-white px-3 py-1.5 rounded-lg text-purple-600 font-bold shadow-sm">+500 نقطة</span>
        </div>
      </div>
    </motion.div>
  );
}