import { useCallback, useRef, useState } from "react";

interface UseSpeechSynthesisReturn {
  speak: (text: string, language?: "malayalam" | "manglish" | "english") => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

export const useSpeechSynthesis = (): UseSpeechSynthesisReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const getVoice = useCallback((language: string) => {
    const voices = window.speechSynthesis.getVoices();
    
    // Try to find appropriate voice based on language
    if (language === "malayalam") {
      // Look for Malayalam or Indian English voices
      const malayalamVoice = voices.find(v => v.lang.includes("ml"));
      if (malayalamVoice) return malayalamVoice;
      
      const indianVoice = voices.find(v => v.lang.includes("en-IN"));
      if (indianVoice) return indianVoice;
    }
    
    // For English and Manglish, use English voice
    const englishVoice = voices.find(v => v.lang.includes("en-US") || v.lang.includes("en-GB"));
    if (englishVoice) return englishVoice;
    
    // Fallback to first available voice
    return voices[0] || null;
  }, []);

  const speak = useCallback((text: string, language: "malayalam" | "manglish" | "english" = "english") => {
    if (!isSupported) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Set voice based on language
    const voice = getVoice(language);
    if (voice) {
      utterance.voice = voice;
    }

    // Adjust speech parameters
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [isSupported, getVoice]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported };
};
