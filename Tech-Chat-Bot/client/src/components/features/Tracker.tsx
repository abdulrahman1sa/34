import { motion } from "framer-motion";
import { Plus, Minus, Droplets, Footprints, Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { DAILY_TARGETS } from "@/lib/bot-logic";

export function Tracker() {
  const [water, setWater] = useState(0);
  const [steps, setSteps] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("health-tracker");
    if (saved) {
      const data = JSON.parse(saved);
      // Simple daily reset logic
      const lastDate = new Date(data.date).toDateString();
      const today = new Date().toDateString();
      
      if (lastDate === today) {
        setWater(data.water);
        setSteps(data.steps);
      } else {
        // New day, reset but keep streak if consecutive
        // (Simplified streak logic for demo)
        setWater(0);
        setSteps(0);
      }
      setStreak(data.streak || 0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("health-tracker", JSON.stringify({
      water,
      steps,
      streak,
      date: new Date().toISOString()
    }));
  }, [water, steps, streak]);

  const addWater = () => setWater(prev => Math.min(prev + 1, 20));
  const removeWater = () => setWater(prev => Math.max(prev - 1, 0));
  
  const addSteps = () => setSteps(prev => Math.min(prev + 500, 20000));
  
  const waterProgress = (water / DAILY_TARGETS.water) * 100;
  const stepsProgress = (steps / DAILY_TARGETS.steps) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white rounded-3xl shadow-sm border border-zinc-100 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-zinc-800 flex items-center gap-2">
          <Trophy size={18} className="text-yellow-500" />
          متابع النشاط
        </h3>
        <span className="text-xs font-medium px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full border border-yellow-100">
          🔥 {streak} أيام متواصلة
        </span>
      </div>

      {/* Water Tracker */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-zinc-500">
          <span className="flex items-center gap-1"><Droplets size={14} className="text-blue-500" /> الماء</span>
          <span>{water} / {DAILY_TARGETS.water} كوب</span>
        </div>
        <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${waterProgress}%` }}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={removeWater} className="p-1 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600">
            <Minus size={16} />
          </button>
          <button onClick={addWater} className="p-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200">
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Steps Tracker */}
      <div className="space-y-2 pt-2 border-t border-zinc-50">
        <div className="flex justify-between text-sm text-zinc-500">
          <span className="flex items-center gap-1"><Footprints size={14} className="text-emerald-500" /> الخطوات</span>
          <span>{steps} / {DAILY_TARGETS.steps} خطوة</span>
        </div>
        <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-emerald-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${stepsProgress}%` }}
          />
        </div>
        <div className="flex justify-end gap-2">
           <button onClick={addSteps} className="px-3 py-1 text-xs rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200">
            +500 خطوة
          </button>
        </div>
      </div>
    </motion.div>
  );
}