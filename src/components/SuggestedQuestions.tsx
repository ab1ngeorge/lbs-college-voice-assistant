import { cn } from "@/lib/utils";
import { MessageCircle, MapPin, GraduationCap, DollarSign, Bus, Users, Sparkles } from "lucide-react";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

const SuggestedQuestions = ({ onSelect }: SuggestedQuestionsProps) => {
  const questionCategories = [
    {
      title: "📚 Academics",
      questions: [
        { text: "What courses are offered?", icon: GraduationCap },
        { text: "Tell me about placements", icon: Sparkles },
      ]
    },
    {
      title: "💰 Fees & Admission",
      questions: [
        { text: "Fee structure enthaanu?", icon: DollarSign, isManglish: true },
        { text: "SC/ST fee ethra?", icon: DollarSign, isManglish: true },
      ]
    },
    {
      title: "🚌 Transport",
      questions: [
        { text: "Bus routes enna okke und?", icon: Bus, isManglish: true },
        { text: "Kasaragod bus timing?", icon: Bus },
      ]
    },
    {
      title: "👥 Faculty & Clubs",
      questions: [
        { text: "CSE faculty list?", icon: Users },
        { text: "College clubs enthokkeyanu?", icon: Users, isManglish: true },
      ]
    },
    {
      title: "📍 Locations",
      questions: [
        { text: "Where is the library?", icon: MapPin },
        { text: "How to reach canteen?", icon: MapPin },
      ]
    },
  ];

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
        <MessageCircle className="h-4 w-4" />
        Try asking:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {questionCategories.map((category, idx) => (
          <div key={idx} className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">{category.title}</p>
            <div className="flex flex-col gap-1.5">
              {category.questions.map((q, i) => {
                const Icon = q.icon;
                return (
                  <button
                    key={i}
                    onClick={() => onSelect(q.text)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm text-left transition-all flex items-center gap-2",
                      "bg-card border border-border hover:border-kerala-green",
                      "hover:bg-kerala-green/5 hover:text-kerala-green",
                      "focus:outline-none focus:ring-2 focus:ring-kerala-green/30",
                      q.isManglish && "italic"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
                    <span className="truncate">{q.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
