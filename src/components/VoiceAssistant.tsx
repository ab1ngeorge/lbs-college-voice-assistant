import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import VoiceButton from "./VoiceButton";
import ChatMessage from "./ChatMessage";
import TextInput from "./TextInput";
import SuggestedQuestions from "./SuggestedQuestions";
import QuickCategories from "./QuickCategories";
import AudioWaveform from "./AudioWaveform";
import LocationPanel, { LocationResult } from "./LocationPanel";
import { Mic, Loader2, MapPin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  useGeolocation,
  searchCampusLocation,
  calculateDistance,
  getDirection,
  COLLEGE_COORDINATES,
  COLLEGE_MAPS_LINK,
} from "@/hooks/useGeolocation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  language?: "malayalam" | "manglish" | "english";
  locationName?: string;
  locationLink?: string;
}

type VoiceStatus = "idle" | "listening" | "processing" | "speaking";

// Detect if message is asking about location/navigation
const isLocationQuery = (text: string): boolean => {
  const locationKeywords = [
    'where is', 'where are', 'how to reach', 'how to find', 'location of',
    'navigate to', 'directions to', 'find the', 'take me to', 'go to',
    'reach the', 'get to', 'way to', 'path to', 'route to',
    'evide', 'evideyanu', 'evidunnu', 'എവിടെ', 'എങ്ങനെ', // Malayalam/Manglish
    // College location specific keywords
    'lbs location', 'college location', 'campus location',
    'lbs address', 'college address', 'campus address',
    'locate lbs', 'locate college', 'locate campus',
    'lbs college location', 'lbsce location',
  ];
  const lowerText = text.toLowerCase();
  return locationKeywords.some(keyword => lowerText.includes(keyword));
};

// Extract destination from query
const extractDestination = (text: string): string | null => {
  const result = searchCampusLocation(text);
  return result ? result.key : null;
};

const VoiceAssistant = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [isProcessing, setIsProcessing] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [pendingAudio, setPendingAudio] = useState<{ text: string; messageId: string; language?: "malayalam" | "manglish" | "english" } | null>(null);
  const [showLocationPanel, setShowLocationPanel] = useState(false);
  const [pendingLocationQuery, setPendingLocationQuery] = useState<string | null>(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentVoiceStatusRef = useRef<VoiceStatus>("idle");
  const isAudioPlayingRef = useRef<boolean>(false);
  // Persistent audio element for iOS - created once and reused
  const iosAudioRef = useRef<HTMLAudioElement | null>(null);

  const {
    getCurrentPosition,
  } = useGeolocation();

  // Detect iOS device and setup persistent audio element
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOSDevice(isIOS);
    console.log('iOS device detected:', isIOS);

    // Create persistent audio element for iOS
    // This element stays in the DOM and is reused for all audio playback
    if (isIOS && !iosAudioRef.current) {
      const audio = document.createElement('audio');

      // Critical iOS Safari attributes
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.setAttribute('x-webkit-airplay', 'allow');
      audio.setAttribute('preload', 'auto');

      // Audio settings
      audio.preload = 'auto';
      audio.volume = 1.0;
      audio.muted = false;

      // Add to DOM but hidden - iOS Safari requires elements to be in DOM
      audio.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;';
      document.body.appendChild(audio);
      iosAudioRef.current = audio;

      console.log('iOS: Persistent audio element created');
    }

    return () => {
      if (iosAudioRef.current) {
        iosAudioRef.current.pause();
        iosAudioRef.current.remove();
        iosAudioRef.current = null;
      }
    };
  }, []);

  // Keep ref in sync with state
  useEffect(() => {
    currentVoiceStatusRef.current = voiceStatus;
  }, [voiceStatus]);

  // Initialize AudioContext and unlock audio for iOS on first user interaction
  const initAudioContext = useCallback(() => {
    try {
      // Create or resume AudioContext
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
          console.log('AudioContext created');
        }
      }

      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          console.log('AudioContext resumed');
        });
      }

      // iOS audio unlock - play a silent sound to unlock audio playback
      // This must happen during a user gesture (tap/click)
      if (isIOSDevice && !audioUnlocked && iosAudioRef.current) {
        console.log('iOS: Attempting audio unlock...');
        const silentAudio = iosAudioRef.current;

        // Use a minimal valid WAV file (silence)
        // This is a 44-byte WAV header + 2 bytes of silence
        silentAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

        // First load the audio
        silentAudio.load();

        // Then try to play after a brief delay
        setTimeout(() => {
          silentAudio.play()
            .then(() => {
              setAudioUnlocked(true);
              console.log('iOS: Audio unlocked successfully!');
              // Immediately pause after unlocking
              silentAudio.pause();
              silentAudio.currentTime = 0;
            })
            .catch((e) => {
              console.log('iOS: Audio unlock attempt failed, will retry on next interaction:', e);
            });
        }, 50);
      }
    } catch (e) {
      console.log('AudioContext init error:', e);
    }
  }, [isIOSDevice, audioUnlocked]);

  // Stop audio helper with proper cleanup - handles iOS persistent element
  const stopAudio = useCallback(() => {
    // Handle iOS persistent audio element
    if (iosAudioRef.current) {
      try {
        iosAudioRef.current.pause();
        iosAudioRef.current.currentTime = 0;
        // Don't clear src on iOS element - just pause it
        iosAudioRef.current.onended = null;
        iosAudioRef.current.onerror = null;
        iosAudioRef.current.oncanplaythrough = null;
        iosAudioRef.current.onloadeddata = null;
      } catch (e) {
        console.log('iOS audio cleanup error:', e);
      }
    }

    // Handle regular audio element (non-iOS)
    if (audioRef.current && audioRef.current !== iosAudioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
        audioRef.current.load();
      } catch (e) {
        console.log('Audio cleanup error:', e);
      }
      audioRef.current = null;
    }

    isAudioPlayingRef.current = false;
    setVoiceStatus("idle");
    setPlayingMessageId(null);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [stopAudio]);

  // Initialize speech recognition with iOS-specific handling
  const initSpeechRecognition = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      toast({
        variant: "destructive",
        title: isIOSDevice ? "Voice not available on this iOS version" : "Browser not supported",
        description: isIOSDevice
          ? "Speech recognition requires iOS 14.5+ with Safari. Please use the text input instead."
          : "Please use Chrome, Edge, or Safari for voice input.",
      });
      return null;
    }

    try {
      const recognition = new SpeechRecognitionAPI();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 3; // Get more alternatives for better accuracy

      // Use Malayalam language for both iOS and other devices
      // iOS Safari 14.5+ supports Malayalam speech recognition
      // The recognition will also understand English when spoken
      recognition.lang = "ml-IN";

      console.log('Speech recognition initialized with language: ml-IN');

      return recognition;
    } catch (e) {
      console.error('Speech recognition init error:', e);
      toast({
        variant: "destructive",
        title: "Voice initialization failed",
        description: isIOSDevice
          ? "Could not start voice input on iOS. Please use the text input."
          : "Could not initialize speech recognition. Please try again.",
      });
      return null;
    }
  }, [toast, isIOSDevice]);

  // Play audio using Sarvam AI TTS - iOS compatible version using data URLs
  const playAudio = useCallback(async (text: string, messageId: string, language?: "malayalam" | "manglish" | "english", isAutoPlay = false) => {
    // Prevent multiple simultaneous plays
    if (isAudioPlayingRef.current && audioRef.current) {
      console.log('Audio already playing, stopping first');
      stopAudio();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      // Initialize audio context for mobile
      initAudioContext();

      isAudioPlayingRef.current = true;
      setPlayingMessageId(messageId);
      setVoiceStatus("speaking");

      // Determine language code for Sarvam
      const targetLanguageCode = language === "english" ? "en-IN" : "ml-IN";

      const { data, error } = await supabase.functions.invoke("sarvam-tts", {
        body: { text, targetLanguageCode },
      });

      if (error) {
        console.error('TTS invoke error:', error);
        throw error;
      }

      if (!data?.audioContent) {
        throw new Error("No audio data received");
      }

      // For iOS: Use data URL instead of blob URL - much more reliable on iOS Safari
      // Blob URLs have known issues on iOS Safari
      const audioDataUrl = `data:audio/wav;base64,${data.audioContent}`;

      // Also create blob URL as fallback for non-iOS
      let audioUrl: string;
      let usingDataUrl = false;

      if (isIOSDevice) {
        // iOS: Use data URL directly - more reliable
        audioUrl = audioDataUrl;
        usingDataUrl = true;
        console.log('iOS: Using data URL for audio');
      } else {
        // Non-iOS: Use blob URL (more memory efficient)
        const binaryString = atob(data.audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/wav' });
        audioUrl = URL.createObjectURL(blob);
        console.log('Non-iOS: Using blob URL for audio');
      }

      // Use the persistent iOS audio element if on iOS, otherwise create new
      let audio: HTMLAudioElement;
      if (isIOSDevice && iosAudioRef.current) {
        audio = iosAudioRef.current;
        // Reset any previous event handlers
        audio.onended = null;
        audio.onerror = null;
        audio.oncanplaythrough = null;
        audio.onloadeddata = null;
      } else {
        audio = new Audio();
        audio.preload = 'auto';
        // Set iOS-friendly attributes
        audio.setAttribute('playsinline', 'true');
        audio.setAttribute('webkit-playsinline', 'true');
      }

      // Set volume explicitly for iOS
      audio.volume = 1.0;
      audioRef.current = audio;

      const cleanup = () => {
        isAudioPlayingRef.current = false;
        setVoiceStatus("idle");
        setPlayingMessageId(null);
        // Don't null out iosAudioRef - it's persistent
        if (!isIOSDevice) {
          audioRef.current = null;
        }
        // Only revoke blob URLs, not data URLs
        if (!usingDataUrl && audioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(audioUrl);
        }
      };

      audio.onended = () => {
        console.log('Audio playback ended');
        cleanup();
      };

      audio.onerror = (e) => {
        console.error("Audio playback error:", e, audio.error);
        cleanup();
        if (!isAutoPlay) {
          toast({
            variant: "destructive",
            title: "Audio Error",
            description: isIOSDevice
              ? "Audio playback failed on iOS. Try tapping the play button again."
              : "Failed to play audio response. Please try again.",
          });
        }
      };

      // Set source
      audio.src = audioUrl;

      // Different loading strategy for iOS vs others
      if (isIOSDevice) {
        // iOS: Use loadeddata event which is more reliable
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            console.log('iOS audio load timeout');
            reject(new Error('Audio load timeout'));
          }, 15000); // Longer timeout for iOS

          const onLoaded = () => {
            clearTimeout(timeout);
            audio.onloadeddata = null;
            console.log('iOS: Audio loaded successfully');
            resolve();
          };

          const onError = () => {
            clearTimeout(timeout);
            console.log('iOS: Audio load error');
            reject(new Error('Audio load error'));
          };

          audio.onloadeddata = onLoaded;
          audio.onerror = onError;

          // For iOS, call load() after setting src
          audio.load();
        });
      } else {
        audio.load();
        // Small delay for non-iOS to ensure audio is ready
        await new Promise(resolve => setTimeout(resolve, 150));
      }

      // Try to play
      try {
        console.log('Attempting to play audio...');
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        console.log('Audio playing successfully');
      } catch (playError) {
        console.log("Autoplay blocked:", playError);
        // On mobile, if autoplay fails, store pending audio for manual play
        if (isAutoPlay) {
          setPendingAudio({ text, messageId, language });
          cleanup();
          toast({
            title: isIOSDevice ? "Tap to hear response" : "Tap to play audio",
            description: isIOSDevice
              ? "Tap the microphone button to hear the response. iOS requires user interaction for audio."
              : "Tap the speaker button to hear the response.",
          });
        } else {
          cleanup();
          throw playError;
        }
      }
    } catch (error) {
      console.error("TTS error:", error);
      isAudioPlayingRef.current = false;
      setVoiceStatus("idle");
      setPlayingMessageId(null);
      if (!isAutoPlay) {
        toast({
          variant: "destructive",
          title: "Audio Error",
          description: isIOSDevice
            ? "Audio failed on iOS. Please tap the play button to try again."
            : "Failed to play audio response. Please try again.",
        });
      }
    }
  }, [stopAudio, toast, initAudioContext, isIOSDevice]);

  // Play audio from pre-fetched base64 data (faster - no API call needed)
  const playAudioFromData = useCallback(async (audioContent: string, messageId: string, language?: "malayalam" | "manglish" | "english", isAutoPlay = false) => {
    // Prevent multiple simultaneous plays
    if (isAudioPlayingRef.current && audioRef.current) {
      console.log('Audio already playing, stopping first');
      stopAudio();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      // Initialize audio context for mobile
      initAudioContext();

      isAudioPlayingRef.current = true;
      setPlayingMessageId(messageId);
      setVoiceStatus("speaking");

      // For iOS: Use data URL instead of blob URL
      const audioDataUrl = `data:audio/wav;base64,${audioContent}`;

      let audioUrl: string;
      let usingDataUrl = false;

      if (isIOSDevice) {
        audioUrl = audioDataUrl;
        usingDataUrl = true;
      } else {
        // Non-iOS: Use blob URL (more memory efficient)
        const binaryString = atob(audioContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/wav' });
        audioUrl = URL.createObjectURL(blob);
      }

      // Use the persistent iOS audio element if on iOS
      let audio: HTMLAudioElement;
      if (isIOSDevice && iosAudioRef.current) {
        audio = iosAudioRef.current;
        audio.onended = null;
        audio.onerror = null;
        audio.oncanplaythrough = null;
        audio.onloadeddata = null;
      } else {
        audio = new Audio();
        audio.preload = 'auto';
        audio.setAttribute('playsinline', 'true');
        audio.setAttribute('webkit-playsinline', 'true');
      }

      audio.volume = 1.0;
      audioRef.current = audio;

      const cleanup = () => {
        isAudioPlayingRef.current = false;
        setVoiceStatus("idle");
        setPlayingMessageId(null);
        if (!isIOSDevice) {
          audioRef.current = null;
        }
        if (!usingDataUrl && audioUrl.startsWith('blob:')) {
          URL.revokeObjectURL(audioUrl);
        }
      };

      audio.onended = () => {
        console.log('Audio playback ended');
        cleanup();
      };

      audio.onerror = (e) => {
        console.error("Audio playback error:", e, audio.error);
        cleanup();
        if (!isAutoPlay) {
          toast({
            variant: "destructive",
            title: "Audio Error",
            description: isIOSDevice
              ? "Audio playback failed. Try tapping the play button."
              : "Failed to play audio. Please try again.",
          });
        }
      };

      audio.src = audioUrl;
      audio.load();

      // Small delay to ensure audio is ready
      await new Promise(resolve => setTimeout(resolve, 50));

      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
        console.log('Audio playing successfully (pre-fetched)');
      } catch (playError) {
        console.log("Autoplay blocked:", playError);
        if (isAutoPlay) {
          setPendingAudio({ text: '', messageId, language });
          cleanup();
          toast({
            title: isIOSDevice ? "Tap to hear response" : "Tap to play audio",
            description: "Tap the speaker button to hear the response.",
          });
        } else {
          cleanup();
          throw playError;
        }
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      isAudioPlayingRef.current = false;
      setVoiceStatus("idle");
      setPlayingMessageId(null);
    }
  }, [stopAudio, toast, initAudioContext, isIOSDevice]);

  // Handle sending message to AI
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    setVoiceStatus("processing");

    try {
      // Check if this is a location query
      if (isLocationQuery(text)) {
        const destinationKey = extractDestination(text);

        // Get the destination location from campus locations
        const destResult = destinationKey ? searchCampusLocation(destinationKey) : null;
        const destLocation = destResult?.location || {
          name: 'LBS College of Engineering (Main Entrance)',
          coordinates: COLLEGE_COORDINATES,
          description: 'Main campus',
          mapsLink: COLLEGE_MAPS_LINK
        };

        // Try to get user location for distance calculation
        try {
          const userCoords = await getCurrentPosition();

          const distance = calculateDistance(
            userCoords.latitude,
            userCoords.longitude,
            destLocation.coordinates.latitude,
            destLocation.coordinates.longitude
          );

          const direction = getDirection(
            userCoords.latitude,
            userCoords.longitude,
            destLocation.coordinates.latitude,
            destLocation.coordinates.longitude
          );

          const distanceText = distance < 1
            ? `${Math.round(distance * 1000)} meters`
            : `${distance.toFixed(1)} kilometers`;

          const navigationResponse = `${destLocation.name} is approximately ${distanceText} to the ${direction} from your current location. You can use the button below to get turn by turn directions in Google Maps.`;

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `📍 ${navigationResponse}`,
            language: "english",
            locationName: destLocation.name,
            locationLink: destLocation.mapsLink,
          };

          setMessages((prev) => [...prev, assistantMessage]);

          // Speak the directions
          playAudio(navigationResponse, assistantMessage.id, "english", true);

          setVoiceStatus("idle");
          setIsProcessing(false);
          return;
        } catch (locationError) {
          console.log('Location not available, showing maps button');

          // Even without user location, provide the maps button
          const navigationResponse = `Here's information about ${destLocation.name}. ${destLocation.description}. Click the button below to open Google Maps. Enable location services for better navigation.`;

          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `📍 ${navigationResponse}`,
            language: "english",
            locationName: destLocation.name,
            locationLink: destLocation.mapsLink,
          };

          setMessages((prev) => [...prev, assistantMessage]);
          playAudio(navigationResponse, assistantMessage.id, "english", true);

          setVoiceStatus("idle");
          setIsProcessing(false);
          return;
        }
      }

      // Prepare conversation history for context
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke("college-chat", {
        body: {
          message: text,
          conversationHistory
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        language: data.detectedLanguage,
      };

      // Start TTS fetch immediately - don't await, let it load in background
      // This makes the text appear instantly while audio loads
      const loadAndPlayAudio = async () => {
        try {
          const targetLanguageCode = data.detectedLanguage === "english" ? "en-IN" : "ml-IN";
          const { data: ttsData, error: ttsError } = await supabase.functions.invoke("sarvam-tts", {
            body: { text: data.response, targetLanguageCode },
          });
          if (ttsError) throw ttsError;
          if (ttsData?.audioContent) {
            // Play the audio when ready
            playAudioFromData(ttsData.audioContent, assistantMessage.id, data.detectedLanguage, true);
          }
        } catch (e) {
          console.error('TTS error:', e);
        }
      };

      // Start audio loading in background (non-blocking)
      loadAndPlayAudio();

      // Update UI with message immediately - no waiting for TTS
      setMessages((prev) => [...prev, assistantMessage]);
      setVoiceStatus("idle");
      setIsProcessing(false);

    } catch (error) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get response. Please try again.",
      });
      setVoiceStatus("idle");
    } finally {
      setIsProcessing(false);
    }
  }, [messages, isProcessing, toast, getCurrentPosition]);

  // Handle location result from panel
  const handleLocationResult = useCallback((result: LocationResult) => {
    const navigationResponse = result.spokenDirections;

    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `📍 ${navigationResponse}`,
      language: "english",
      locationName: result.destination.name,
      locationLink: result.googleMapsUrl,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Speak the directions
    playAudio(navigationResponse, assistantMessage.id, "english", true);

    setShowLocationPanel(false);
    setPendingLocationQuery(null);
  }, [playAudio]);

  // Handle voice button click
  const handleVoiceClick = useCallback(() => {
    // Initialize audio context on user gesture (critical for mobile)
    initAudioContext();

    if (voiceStatus === "listening") {
      // Stop listening
      recognitionRef.current?.stop();
      setVoiceStatus("idle");
      return;
    }

    if (voiceStatus === "speaking") {
      // Stop audio playback
      stopAudio();
      return;
    }

    if (voiceStatus === "processing") {
      return;
    }

    // If there's pending audio from failed autoplay, play it now
    if (pendingAudio) {
      playAudio(pendingAudio.text, pendingAudio.messageId, pendingAudio.language, false);
      setPendingAudio(null);
      return;
    }

    // Start listening
    const recognition = initSpeechRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setVoiceStatus("listening");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        sendMessage(transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setVoiceStatus("idle");

      // iOS-specific error handling
      if (event.error === "not-allowed") {
        toast({
          variant: "destructive",
          title: "Microphone Permission Required",
          description: isIOSDevice
            ? "Please allow microphone access in iOS Settings > Safari > Microphone."
            : "Please allow microphone access to use voice input.",
        });
      } else if (event.error === "network") {
        toast({
          variant: "destructive",
          title: "Network Error",
          description: "Speech recognition requires an internet connection.",
        });
      } else if (event.error === "language-not-supported") {
        toast({
          variant: "destructive",
          title: "Language Not Supported",
          description: isIOSDevice
            ? "Malayalam voice input may require adding Malayalam keyboard in iOS Settings > General > Keyboard > Keyboards."
            : "Malayalam language is not supported on this device. Please try English or use text input.",
        });
      } else if (event.error === "service-not-allowed" || event.error === "audio-capture") {
        toast({
          variant: "destructive",
          title: "Service Unavailable",
          description: isIOSDevice
            ? "Speech recognition is not available on this iOS device. Please use text input."
            : "Speech recognition service is not available. Please try again.",
        });
      } else if (event.error !== "aborted" && event.error !== "no-speech") {
        toast({
          variant: "destructive",
          title: "Voice Error",
          description: isIOSDevice
            ? "Voice input failed on iOS. Ensure Malayalam keyboard is installed or try English. Use text input as fallback."
            : "Could not recognize speech. Please try again.",
        });
      }
    };

    recognition.onend = () => {
      // Use ref to check current status since state might be stale
      if (currentVoiceStatusRef.current === "listening") {
        setVoiceStatus("idle");
      }
    };

    // Try to start recognition with iOS error handling
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
      setVoiceStatus("idle");
      toast({
        variant: "destructive",
        title: "Voice Error",
        description: isIOSDevice
          ? "Could not start voice input on iOS. Please use the text input below."
          : "Could not start voice input. Please try again.",
      });
    }
  }, [voiceStatus, initSpeechRecognition, sendMessage, toast, stopAudio, initAudioContext, pendingAudio, playAudio, isIOSDevice]);

  // Handle suggested question selection
  const handleQuestionSelect = (question: string) => {
    sendMessage(question);
  };

  // Handle quick category selection
  const handleCategorySelect = (_category: string, question: string) => {
    sendMessage(question);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto">
      {/* Chat messages area */}
      <ScrollArea className="flex-1 px-4 py-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-12">
            {/* Welcome illustration */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-kerala-green/10 flex items-center justify-center animate-float">
                <div className="w-24 h-24 rounded-full bg-kerala-green/20 flex items-center justify-center">
                  <Mic className="w-12 h-12 text-kerala-green" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-kerala-gold flex items-center justify-center shadow-gold">
                <span className="text-white text-lg">🎓</span>
              </div>
            </div>

            {/* Welcome text */}
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">
                Welcome to LBS College Assistant
              </h2>
              <p className="text-muted-foreground max-w-md">
                Ask me anything about LBS College of Engineering in English, Malayalam, or Manglish!
              </p>
              <p className="text-sm font-malayalam text-kerala-green">
                മലയാളത്തിൽ ചോദിക്കാം
              </p>
            </div>

            {/* Quick category buttons */}
            <QuickCategories onCategorySelect={handleCategorySelect} />

            {/* Suggested questions */}
            <SuggestedQuestions onSelect={handleQuestionSelect} />
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                language={message.language}
                onPlayAudio={
                  message.role === "assistant"
                    ? () => playAudio(message.content, message.id, message.language)
                    : undefined
                }
                isPlaying={playingMessageId === message.id}
                locationName={message.locationName}
                locationLink={message.locationLink}
              />
            ))}

            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}

            {/* Location Panel */}
            {showLocationPanel && (
              <div className="mt-4">
                <LocationPanel
                  onLocationResult={handleLocationResult}
                  destinationKey={pendingLocationQuery || undefined}
                />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Voice status indicator */}
      {voiceStatus === "listening" && (
        <div className="flex items-center justify-center gap-2 py-2 text-kerala-gold">
          <AudioWaveform isActive variant="listening" />
          <span className="text-sm font-medium">Listening...</span>
        </div>
      )}

      {voiceStatus === "speaking" && (
        <div className="flex items-center justify-center gap-2 py-2 text-kerala-green">
          <AudioWaveform isActive variant="speaking" />
          <span className="text-sm font-medium">Speaking...</span>
        </div>
      )}

      {/* Pending audio indicator */}
      {pendingAudio && voiceStatus === "idle" && (
        <div className="flex items-center justify-center gap-2 py-2 text-kerala-gold">
          <span className="text-sm font-medium">🔊 Tap the mic to play audio response</span>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          {/* Action buttons row */}
          <div className="flex items-center gap-3">
            {/* Voice button */}
            <VoiceButton
              status={voiceStatus}
              onClick={handleVoiceClick}
              disabled={isProcessing}
            />

            {/* Location button */}
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-kerala-green text-kerala-green hover:bg-kerala-green/10"
              onClick={() => setShowLocationPanel(!showLocationPanel)}
            >
              <MapPin className="h-5 w-5" />
            </Button>
          </div>

          {/* Status text */}
          <p className="text-sm text-muted-foreground">
            {voiceStatus === "idle" && !pendingAudio && "Tap to speak or find a location"}
            {voiceStatus === "idle" && pendingAudio && "Tap to play audio response"}
            {voiceStatus === "listening" && "Listening... tap to stop"}
            {voiceStatus === "speaking" && "Playing... tap to stop"}
            {voiceStatus === "processing" && "Processing..."}
          </p>

          {/* Text input fallback */}
          <div className="w-full max-w-md">
            <TextInput
              onSend={sendMessage}
              disabled={isProcessing || voiceStatus === "listening"}
              placeholder="Or type your question here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
