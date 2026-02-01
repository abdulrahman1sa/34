import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Copy, Check, Leaf } from "lucide-react";
import { useState } from "react";

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
  };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isBot = message.sender === "bot";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full mb-4 group",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      <div className={cn(
        "flex max-w-[85%] md:max-w-[70%] flex-col",
        isBot ? "items-start" : "items-end"
      )}>
        {/* Name Label */}
        <span className="text-[10px] text-zinc-500 mb-1 px-1 flex items-center gap-1">
          {isBot && <Leaf size={10} className="text-primary" />}
          {isBot ? "كوتش الصحة" : "أنت"}
        </span>

        {/* Bubble */}
        <div
          className={cn(
            "p-4 text-sm md:text-base leading-relaxed shadow-sm relative overflow-hidden",
            isBot 
              ? "glass bg-white text-zinc-800 rounded-2xl rounded-tr-sm border-l-4 border-l-primary" 
              : "bg-primary text-white rounded-2xl rounded-tl-sm shadow-md"
          )}
        >
          <div className="prose prose-sm md:prose-base prose-p:my-1 prose-ul:my-1 prose-li:my-0 text-right font-medium">
            <ReactMarkdown 
              components={{
                ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 my-2 opacity-90" {...props} />,
                li: ({node, ...props}) => <li className="opacity-90" {...props} />,
                strong: ({node, ...props}) => <strong className={isBot ? "text-primary font-bold" : "text-white font-bold"} {...props} />,
              }}
            >
              {message.text}
            </ReactMarkdown>
          </div>

          {/* Copy Button (Only for Bot) */}
          {isBot && (
            <button
              onClick={handleCopy}
              className="absolute bottom-2 left-2 text-zinc-400 hover:text-primary transition-colors p-1 opacity-0 group-hover:opacity-100"
              title="نسخ النص"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
          )}
        </div>
        
        {/* Timestamp */}
        <span className="text-[10px] text-zinc-400 mt-1 px-1">
          {message.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}