import { cn } from "@/lib/utils";

interface AudioWaveformProps {
  isActive: boolean;
  variant?: "listening" | "speaking";
}

const AudioWaveform = ({ isActive, variant = "listening" }: AudioWaveformProps) => {
  const barCount = 7;
  
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {Array.from({ length: barCount }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 rounded-full transition-all duration-150",
            variant === "listening" ? "bg-kerala-gold" : "bg-kerala-green",
            isActive ? "wave-bar" : "h-2"
          )}
          style={{
            height: isActive ? `${Math.random() * 20 + 10}px` : "8px",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

export default AudioWaveform;
