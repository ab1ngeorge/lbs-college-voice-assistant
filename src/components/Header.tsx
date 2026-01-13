import { GraduationCap, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <header className="w-full py-3 px-4 md:px-6 bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Logo and title */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-kerala-green flex items-center justify-center shadow-md">
            <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-semibold text-foreground">LBS College</h1>
            <p className="text-[10px] md:text-xs text-muted-foreground">Voice Assistant</p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Malayalam text - hidden on mobile */}
          <div className="hidden md:block text-right">
            <p className="text-sm font-malayalam text-kerala-green font-medium">
              എൽ.ബി.എസ് എൻജിനീയറിംഗ് കോളേജ്
            </p>
            <p className="text-xs text-muted-foreground">Kasaragod, Kerala</p>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-full transition-all",
              "bg-muted hover:bg-muted/80",
              "focus:outline-none focus:ring-2 focus:ring-kerala-green/30"
            )}
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-kerala-gold" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
