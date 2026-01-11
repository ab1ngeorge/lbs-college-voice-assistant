import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

interface LanguageIndicatorProps {
  detectedLanguage: "malayalam" | "manglish" | "english" | null;
}

const LanguageIndicator = ({ detectedLanguage }: LanguageIndicatorProps) => {
  if (!detectedLanguage) return null;

  const languages = {
    malayalam: { label: "മലയാളം", sublabel: "Malayalam", color: "bg-kerala-green" },
    manglish: { label: "Manglish", sublabel: "Malayalam in English", color: "bg-kerala-gold" },
    english: { label: "English", sublabel: "English", color: "bg-secondary border border-border" },
  };

  const lang = languages[detectedLanguage];

  return (
    <div className="flex items-center gap-2 text-sm">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <span className="text-muted-foreground">Detected:</span>
      <span
        className={cn(
          "px-2 py-0.5 rounded-full text-xs font-medium",
          lang.color,
          detectedLanguage !== "english" && "text-white"
        )}
      >
        {lang.label}
      </span>
    </div>
  );
};

export default LanguageIndicator;
