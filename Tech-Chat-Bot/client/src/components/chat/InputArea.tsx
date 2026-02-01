import { SendHorizontal, Camera } from "lucide-react";
import { useState, KeyboardEvent } from "react";

interface InputAreaProps {
  onSend: (text: string) => void;
  onCameraClick: () => void;
  disabled?: boolean;
}

export function InputArea({ onSend, onCameraClick, disabled }: InputAreaProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="p-4 glass-card border-t border-zinc-100 w-full max-w-3xl mx-auto rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
      <div className="relative flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اسأل أي شيء... مثل: جيعان، كم سعرات؟ طلعت لي كرش؟"
          disabled={disabled}
          className="w-full bg-white border border-zinc-200 text-zinc-800 placeholder:text-zinc-400 rounded-2xl py-4 pr-4 pl-24 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-right shadow-inner"
          dir="rtl"
        />
        
        {/* Buttons Group */}
        <div className="absolute left-2 flex items-center gap-1">
          <button
            onClick={onCameraClick}
            disabled={disabled}
            className="p-2.5 bg-zinc-100 text-zinc-500 rounded-xl hover:bg-zinc-200 hover:text-zinc-800 transition-all active:scale-95"
            title="صور وجبتك"
          >
            <Camera size={20} />
          </button>
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className="p-2.5 bg-primary text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:bg-zinc-200 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <SendHorizontal size={20} className={document.dir === 'rtl' ? "rotate-180" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
}