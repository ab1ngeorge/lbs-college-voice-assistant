import { cn } from "@/lib/utils";
import { User, Bot, Volume2 } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  language?: "malayalam" | "manglish" | "english";
  onPlayAudio?: () => void;
  isPlaying?: boolean;
}

const ChatMessage = ({ role, content, language, onPlayAudio, isPlaying }: ChatMessageProps) => {
  const isUser = role === "user";
  
  const getLanguageBadge = () => {
    if (!language) return null;
    
    const labels = {
      malayalam: "മലയാളം",
      manglish: "Manglish",
      english: "English",
    };
    
    return (
      <span
        className={cn(
          "lang-badge",
          language === "malayalam" && "lang-malayalam",
          language === "manglish" && "lang-manglish",
          language === "english" && "lang-english"
        )}
      >
        {labels[language]}
      </span>
    );
  };

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          isUser
            ? "bg-kerala-gold text-white"
            : "bg-kerala-green text-white"
        )}
      >
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </div>

      {/* Message content */}
      <div
        className={cn(
          "flex-1 max-w-[80%]",
          isUser ? "text-right" : "text-left"
        )}
      >
        {/* Language badge */}
        {!isUser && language && (
          <div className="mb-2">{getLanguageBadge()}</div>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            "inline-block px-4 py-3 rounded-2xl",
            isUser
              ? "bg-kerala-gold text-white rounded-br-md"
              : "glass-card rounded-bl-md",
            language === "malayalam" && "font-malayalam"
          )}
        >
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </div>

        {/* Play audio button for assistant messages */}
        {!isUser && onPlayAudio && (
          <button
            onClick={onPlayAudio}
            className={cn(
              "mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
              "text-xs font-medium transition-colors",
              "bg-muted hover:bg-muted/80 text-muted-foreground",
              isPlaying && "bg-kerala-green text-white"
            )}
          >
            <Volume2 className="h-3.5 w-3.5" />
            {isPlaying ? "Playing..." : "Play"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
