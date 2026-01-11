import { cn } from "@/lib/utils";
import { MessageCircle, MapPin } from "lucide-react";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

const SuggestedQuestions = ({ onSelect }: SuggestedQuestionsProps) => {
  const questions = [
    { text: "What courses are offered?", lang: "english", icon: false },
    { text: "Where is the library?", lang: "english", icon: true },
    { text: "College facilities enthu okke und?", lang: "manglish", icon: false },
    { text: "Tell me about placements", lang: "english", icon: false },
    { text: "How to reach the canteen?", lang: "english", icon: true },
    { text: "Fee structure enthaanu?", lang: "manglish", icon: false },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        Try asking:
      </p>
      <div className="flex flex-wrap gap-2">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q.text)}
            className={cn(
              "px-3 py-2 rounded-full text-sm transition-all flex items-center gap-1.5",
              "border border-border hover:border-kerala-green",
              "hover:bg-kerala-green/5 hover:text-kerala-green",
              "focus:outline-none focus:ring-2 focus:ring-kerala-green/30",
              q.lang === "malayalam" && "font-malayalam"
            )}
          >
            {q.icon && <MapPin className="h-3 w-3" />}
            {q.text}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
