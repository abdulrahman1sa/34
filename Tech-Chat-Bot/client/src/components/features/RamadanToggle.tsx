import { Moon, Sun } from "lucide-react";
import { UserProfile } from "@/lib/bot-logic";

interface RamadanToggleProps {
  isRamadan?: boolean;
  onToggle: (val: boolean) => void;
}

export function RamadanToggle({ isRamadan, onToggle }: RamadanToggleProps) {
  return (
    <button
      onClick={() => onToggle(!isRamadan)}
      className={`
        relative px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-300 border
        ${isRamadan 
          ? "bg-purple-900 text-white border-purple-700 shadow-purple-900/20 shadow-lg" 
          : "bg-white text-zinc-600 border-zinc-200 hover:border-orange-200 hover:bg-orange-50"}
      `}
    >
      {isRamadan ? <Moon size={16} className="text-yellow-400" /> : <Sun size={16} className="text-orange-400" />}
      <span className="text-xs font-bold">{isRamadan ? "وضع رمضان" : "الوضع العادي"}</span>
      
      {/* Status Dot */}
      <span className={`w-2 h-2 rounded-full ${isRamadan ? "bg-green-400" : "bg-zinc-300"}`} />
    </button>
  );
}