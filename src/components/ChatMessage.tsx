import { cn } from "@/lib/utils";
import { User, Bot, Volume2, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  language?: "malayalam" | "manglish" | "english";
  onPlayAudio?: () => void;
  isPlaying?: boolean;
  locationName?: string;
  locationLink?: string;
}

const ChatMessage = ({ role, content, language, onPlayAudio, isPlaying, locationName, locationLink }: ChatMessageProps) => {
  const isUser = role === "user";

  // Convert URLs in text to clickable links
  const renderContentWithLinks = (text: string) => {
    // Regex to match URLs (http, https, and maps.app.goo.gl links)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        // Reset regex lastIndex
        urlRegex.lastIndex = 0;
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-kerala-green hover:text-kerala-green/80 underline inline-flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            {part.length > 40 ? part.substring(0, 40) + '...' : part}
            <ExternalLink className="h-3 w-3 inline" />
          </a>
        );
      }
      return part;
    });
  };

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
            {renderContentWithLinks(content)}
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

        {/* Google Maps button for location-related responses */}
        {!isUser && locationLink && (
          <Button
            onClick={() => window.open(locationLink, '_blank')}
            className="mt-2 bg-kerala-green hover:bg-kerala-green/90 text-white"
            size="sm"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Open Google Maps
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
