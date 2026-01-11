import { GraduationCap } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full py-4 px-6 bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-kerala-green flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">LBS College</h1>
            <p className="text-xs text-muted-foreground">Voice Assistant</p>
          </div>
        </div>

        {/* Malayalam text */}
        <div className="hidden md:block text-right">
          <p className="text-sm font-malayalam text-kerala-green font-medium">
            എൽ.ബി.എസ് എൻജിനീയറിംഗ് കോളേജ്
          </p>
          <p className="text-xs text-muted-foreground">Kasaragod, Kerala</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
