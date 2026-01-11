import { useState } from "react";
import { Send, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

interface TextInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const TextInput = ({ onSend, disabled, placeholder }: TextInputProps) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-card border border-border focus-within:border-kerala-green transition-colors">
        <Keyboard className="h-5 w-5 text-muted-foreground ml-2" />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          placeholder={placeholder || "Type your question here..."}
          className={cn(
            "flex-1 bg-transparent text-sm md:text-base",
            "placeholder:text-muted-foreground",
            "focus:outline-none disabled:opacity-50"
          )}
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className={cn(
            "p-2 rounded-xl transition-all",
            "bg-kerala-green text-white",
            "hover:bg-kerala-green-light",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "focus:outline-none focus:ring-2 focus:ring-kerala-green/30"
          )}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
};

export default TextInput;
