import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

interface VoiceControlsProps {
  isEnabled: boolean;
  onToggle: () => void;
  isListening?: boolean;
  onListenToggle?: () => void;
}

export function VoiceControls({ isEnabled, onToggle, isListening, onListenToggle }: VoiceControlsProps) {
  return (
    <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm rounded-full p-1 border border-zinc-200/50 shadow-sm">
      <button 
        onClick={onToggle}
        className={`p-2 rounded-full transition-all ${isEnabled ? "text-primary bg-primary/10" : "text-zinc-400 hover:text-zinc-600"}`}
        title="تفعيل الرد الصوتي"
      >
        {isEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>
      
      <div className="w-px h-4 bg-zinc-200" />
      
      <button 
        onClick={onListenToggle}
        className={`p-2 rounded-full transition-all ${isListening ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30" : "text-zinc-400 hover:text-primary"}`}
        title="تحدث"
      >
        {isListening ? <Mic size={16} /> : <MicOff size={16} />}
      </button>
    </div>
  );
}