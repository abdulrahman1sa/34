import { motion } from "framer-motion";
import { CheckSquare, Copy, X } from "lucide-react";
import { generateGroceryList, UserProfile } from "@/lib/bot-logic";

interface GroceryListProps {
  userProfile: UserProfile;
  onClose: () => void;
}

export function GroceryList({ userProfile, onClose }: GroceryListProps) {
  const mode = userProfile.isRamadan ? "ramadan" : "standard";
  const goal = userProfile.goal || "maintenance";
  const list = generateGroceryList(goal, userProfile.isRamadan || false);

  const handleCopy = () => {
    let text = "🛒 *مقاضي الأسبوع*\n\n";
    Object.entries(list).forEach(([category, items]: [string, any]) => {
      text += `*${category}*:\n${items.join("، ")}\n\n`;
    });
    navigator.clipboard.writeText(text);
    alert("تم نسخ المقاضي!");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-4 bg-black/20 backdrop-blur-sm"
    >
      <div className="bg-white w-full max-w-lg h-[80vh] md:h-auto md:max-h-[80vh] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-blue-900">المقاضي</h2>
          <button onClick={onClose} className="p-2 bg-white rounded-full hover:bg-blue-100 text-zinc-400 hover:text-blue-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.entries(list).map(([category, items]: [string, any], idx) => (
            <div key={idx}>
              <h3 className="text-sm font-bold text-zinc-400 mb-3 px-2 uppercase tracking-wider">{category}</h3>
              <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
                {items.map((item: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-4 border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors">
                    <div className="w-5 h-5 rounded border border-zinc-300 flex items-center justify-center">
                      {/* Checkbox visual */}
                    </div>
                    <span className="text-zinc-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 bg-white">
          <button onClick={handleCopy} className="w-full py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
            <Copy size={18} />
            انسخ القائمة
          </button>
        </div>
      </div>
    </motion.div>
  );
}