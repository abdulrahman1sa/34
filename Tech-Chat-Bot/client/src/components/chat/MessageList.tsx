import { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: Array<{
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
  }>;
  isTyping: boolean;
}

export function MessageList({ messages, isTyping }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide w-full max-w-3xl mx-auto space-y-4">
      <div className="h-2" /> {/* Spacer */}
      
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isTyping && (
        <div className="flex justify-start w-full mb-4 animate-pulse">
          <div className="glass px-4 py-3 rounded-2xl rounded-tr-sm flex gap-1 items-center border-l-4 border-l-primary/40 bg-white">
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
          </div>
        </div>
      )}
      
      <div ref={bottomRef} className="h-4" />
    </div>
  );
}