import { Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  status: "idle" | "listening" | "processing" | "speaking";
  onClick: () => void;
  disabled?: boolean;
}

const VoiceButton = ({ status, onClick, disabled }: VoiceButtonProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case "listening":
        return "bg-kerala-gold voice-listening border-kerala-gold";
      case "processing":
        return "bg-kerala-green-light animate-pulse border-kerala-green";
      case "speaking":
        return "bg-kerala-green voice-speaking border-kerala-green";
      default:
        return "bg-kerala-green hover:bg-kerala-green-light border-kerala-green voice-pulse";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "listening":
        return <Mic className="h-10 w-10 text-white animate-pulse" />;
      case "processing":
        return (
          <div className="flex gap-1 items-end h-10">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-1.5 bg-white rounded-full wave-bar"
                style={{ height: `${Math.random() * 20 + 15}px` }}
              />
            ))}
          </div>
        );
      case "speaking":
        return <Volume2 className="h-10 w-10 text-white" />;
      default:
        return <Mic className="h-10 w-10 text-white" />;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || status === "processing"}
      className={cn(
        "relative w-28 h-28 rounded-full flex items-center justify-center",
        "border-4 transition-all duration-300 ease-out",
        "focus:outline-none focus:ring-4 focus:ring-kerala-gold/30",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        getStatusStyles()
      )}
    >
      {/* Outer glow ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-full",
          status === "listening" && "animate-ping bg-kerala-gold/20",
          status === "speaking" && "animate-pulse bg-kerala-green/20"
        )}
      />
      
      {/* Inner content */}
      <div className="relative z-10">{getIcon()}</div>
    </button>
  );
};

export default VoiceButton;
