import { motion } from "framer-motion";
import { Crown, CheckCircle2, X } from "lucide-react";

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  isPro: boolean;
}

export function ProModal({ isOpen, onClose, onUpgrade, isPro }: ProModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-zinc-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-yellow-500/20"
      >
        <div className="bg-gradient-to-b from-yellow-500 to-yellow-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-white opacity-10 mix-blend-overlay"></div>
          <Crown size={48} className="text-white mx-auto mb-4 drop-shadow-md" />
          <h2 className="text-2xl font-black text-white mb-1">عضوية VIP</h2>
          <p className="text-yellow-100 text-sm font-medium">أطلق العنان لقدراتك الكاملة</p>
          <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <ul className="space-y-3">
            {[
              "جداول غذائية مفصلة بدقة 100%",
              "تصدير الملفات (PDF)",
              "تحليل إصابات متقدم",
              "بدون إعلانات"
            ].map((feat, i) => (
              <li key={i} className="flex items-center gap-3 text-zinc-300 text-sm font-medium">
                <CheckCircle2 size={16} className="text-yellow-500" />
                {feat}
              </li>
            ))}
          </ul>

          <button 
            onClick={() => { onUpgrade(); onClose(); }}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${
              isPro 
              ? "bg-zinc-800 text-zinc-500 cursor-default"
              : "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:scale-[1.02] hover:shadow-yellow-500/20"
            }`}
            disabled={isPro}
          >
            {isPro ? "أنت مشترك بالفعل" : "اشترك الآن (مجاناً للتجربة)"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}