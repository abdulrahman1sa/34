import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { UserProfile, generateInsights } from "@/lib/bot-logic";

interface PredictiveInsightsProps {
  userProfile: UserProfile;
  onClose: () => void;
}

export function PredictiveInsights({ userProfile, onClose }: PredictiveInsightsProps) {
  const insights = generateInsights(userProfile, {}); // History mock

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-x-0 bottom-0 z-50 p-6 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pb-10"
    >
      <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6 cursor-pointer" onClick={onClose} />
      
      <h2 className="text-xl font-bold text-zinc-800 mb-6 flex items-center gap-2 px-2">
        <TrendingUp className="text-blue-500" />
        توقعات الأسبوع
      </h2>

      <div className="space-y-4">
        {insights.map((insight: any, idx) => (
          <div 
            key={idx} 
            className={`p-4 rounded-2xl border flex gap-3 ${
              insight.type === "warning" ? "bg-red-50 border-red-100 text-red-800" :
              insight.type === "tip" ? "bg-blue-50 border-blue-100 text-blue-800" :
              "bg-green-50 border-green-100 text-green-800"
            }`}
          >
            <div className="mt-0.5">
              {insight.type === "warning" && <AlertTriangle size={20} />}
              {insight.type === "tip" && <Lightbulb size={20} />}
              {insight.type === "success" && <TrendingUp size={20} />}
            </div>
            <p className="text-sm leading-relaxed font-bold">{insight.text}</p>
          </div>
        ))}
      </div>
      
      <button onClick={onClose} className="w-full mt-6 py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-colors">
        فهمت عليك 👍
      </button>
    </motion.div>
  );
}