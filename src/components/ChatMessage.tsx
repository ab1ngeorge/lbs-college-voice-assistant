import { useState } from "react";
import { cn } from "@/lib/utils";
import { User, Bot, Volume2, MapPin, ExternalLink, Copy, Check } from "lucide-react";
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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Convert URLs in text to clickable links
  const renderContentWithLinks = (text: string) => {
    // Regex to match URLs (http, https, and maps.app.goo.gl links)
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      // Use a fresh regex test to avoid lastIndex state issues with global regex
      if (/^https?:\/\/[^\s]+$/i.test(part)) {
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
          "flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm",
          isUser
            ? "bg-kerala-gold text-white"
            : "bg-kerala-green text-white"
        )}
      >
        {isUser ? <User className="h-4 w-4 md:h-5 md:w-5" /> : <Bot className="h-4 w-4 md:h-5 md:w-5" />}
      </div>

      {/* Message content */}
      <div
        className={cn(
          "flex-1 max-w-[85%] md:max-w-[80%]",
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

        {/* Action buttons for assistant messages */}
        {!isUser && (
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {/* Play audio button */}
            {onPlayAudio && (
              <button
                onClick={onPlayAudio}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                  "text-xs font-medium transition-colors",
                  "bg-muted hover:bg-muted/80 text-muted-foreground",
                  isPlaying && "bg-kerala-green text-white"
                )}
              >
                <Volume2 className="h-3.5 w-3.5" />
                {isPlaying ? "Playing..." : "Play"}
              </button>
            )}

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                "text-xs font-medium transition-colors",
                "bg-muted hover:bg-muted/80 text-muted-foreground",
                copied && "bg-green-500 text-white"
              )}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
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
