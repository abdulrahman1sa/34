import { motion } from "framer-motion";

interface QuickActionsProps {
  onSelect: (text: string) => void;
  options?: string[];
}

const DEFAULT_ACTIONS = [
  "وش آكل اليوم؟",
  "كم سعرات الكبسة؟",
  "طلعت لي كرش",
  "جيعان وش تقترح؟",
  "أنشئ جدول أسبوعي"
];

export function QuickActions({ onSelect, options }: QuickActionsProps) {
  const actionsToShow = options && options.length > 0 ? options : DEFAULT_ACTIONS;

  return (
    <div className="w-full overflow-x-auto scrollbar-hide pb-3 px-4 max-w-3xl mx-auto">
      <div className="flex gap-2 w-max">
        {actionsToShow.map((action, index) => (
          <motion.button
            key={action}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(action)}
            className="px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-zinc-700 border border-zinc-200 whitespace-nowrap hover:bg-primary hover:text-white hover:border-primary shadow-sm hover:shadow-md active:scale-95 transition-all duration-300"
          >
            {action}
          </motion.button>
        ))}
      </div>
    </div>
  );
}