import Header from "@/components/Header";
import VoiceAssistant from "@/components/VoiceAssistant";

const Index = () => {
  return (
    <div className="min-h-screen bg-background hero-gradient kerala-pattern">
      <Header />
      <main className="container px-4">
        <VoiceAssistant />
      </main>
    </div>
  );
};

export default Index;
