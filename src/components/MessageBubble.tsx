import { Message } from "@/utils/chatParser";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  isSent: boolean;
  searchTerm?: string;
  isHighlighted?: boolean;
}

export function MessageBubble({ message, isSent, searchTerm, isHighlighted }: MessageBubbleProps) {
  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === term.toLowerCase() ? (
        <mark 
          key={index} 
          className={cn(
            "bg-yellow-300 dark:bg-yellow-600 rounded px-0.5",
            isHighlighted && "ring-2 ring-yellow-500"
          )}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className={cn("flex mb-2 px-4", isSent ? "justify-end" : "justify-start")}>
      <div 
        className={cn(
          "max-w-[65%] rounded-lg px-3 py-2 shadow-sm",
          isSent 
            ? "bg-[hsl(var(--bubble-sent))] text-white rounded-br-sm" 
            : "bg-[hsl(var(--bubble-received))] text-foreground rounded-bl-sm",
          "transition-all duration-200"
        )}
      >
        {!isSent && (
          <div className="text-xs font-semibold text-accent mb-1">
            {message.sender}
          </div>
        )}
        <div className="text-sm break-words whitespace-pre-wrap">
          {searchTerm ? highlightText(message.content, searchTerm) : message.content}
        </div>
        <div className={cn(
          "text-[10px] mt-1 text-right",
          isSent ? "text-white/70" : "text-muted-foreground"
        )}>
          {message.time}
        </div>
      </div>
    </div>
  );
}
