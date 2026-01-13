import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Process text for more natural TTS output
const preprocessTextForSpeech = (text: string, languageCode: string): string => {
  let processed = text;

  // Remove emojis for cleaner speech
  processed = processed.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu, '');

  // IMPORTANT: Remove English translations in parentheses to avoid repetition
  // e.g., "ഡോ. മുഹമ്മദ് ഷെക്കൂർ ടി (Dr. Mohammad Shekoor T)" -> "ഡോ. മുഹമ്മദ് ഷെക്കൂർ ടി"
  processed = processed.replace(/\s*\([A-Za-z0-9\s\.,'-]+\)/g, '');

  // Remove markdown formatting
  processed = processed.replace(/\*\*(.*?)\*\*/g, '$1');
  processed = processed.replace(/\*(.*?)\*/g, '$1');
  processed = processed.replace(/`(.*?)`/g, '$1');
  processed = processed.replace(/#+\s/g, '');

  // Clean up bullet points for speech
  processed = processed.replace(/^[-•]\s*/gm, '');
  processed = processed.replace(/^\d+\.\s*/gm, '');

  // Replace URLs with simple text
  processed = processed.replace(/https?:\/\/[^\s]+/g, '');

  // Clean up email addresses for speech
  processed = processed.replace(/(\w+)@(\w+)\.(\w+)/g, '$1 at $2 dot $3');

  // CRITICAL: Fix abbreviations BEFORE any other processing
  // These must come first to prevent "Dr." becoming "Dr ." 
  // English abbreviations
  processed = processed.replace(/\bDr\.\s*/gi, 'ഡോക്ടർ ');
  processed = processed.replace(/\bMr\.\s*/gi, 'മിസ്റ്റർ ');
  processed = processed.replace(/\bMs\.\s*/gi, 'മിസ് ');
  processed = processed.replace(/\bProf\.\s*/gi, 'പ്രൊഫസർ ');

  // Malayalam abbreviations (short forms)
  processed = processed.replace(/ഡോ\.\s*/g, 'ഡോക്ടർ ');
  processed = processed.replace(/പ്രൊഫ\.\s*/g, 'പ്രൊഫസർ ');

  // Technical abbreviations - expand for clarity
  processed = processed.replace(/\bB\.Tech\b/gi, 'ബി ടെക്');
  processed = processed.replace(/\bM\.Tech\b/gi, 'എം ടെക്');
  processed = processed.replace(/\bPh\.D\b/gi, 'പി എച്ച് ഡി');
  processed = processed.replace(/\bCSE\b/g, 'സി എസ് ഇ');
  processed = processed.replace(/\bECE\b/g, 'ഇ സി ഇ');
  processed = processed.replace(/\bEEE\b/g, 'ഇ ഇ ഇ');
  processed = processed.replace(/\bMCA\b/g, 'എം സി എ');
  processed = processed.replace(/\bKTU\b/g, 'കെ ടി യു');
  processed = processed.replace(/\bAICTE\b/g, 'എ ഐ സി ടി ഇ');
  processed = processed.replace(/\bLBS\b/g, 'എൽ ബി എസ്');
  processed = processed.replace(/\bNRI\b/g, 'എൻ ആർ ഐ');

  // Improve number pronunciation for Indian context
  processed = processed.replace(/₹\s*(\d+)/g, '$1 രൂപ');
  processed = processed.replace(/(\d+)\s*LPA/gi, '$1 ലക്ഷം പ്രതിവർഷം');
  processed = processed.replace(/(\d+)\s*lakh/gi, '$1 ലക്ഷം');
  processed = processed.replace(/(\d+)\s*crore/gi, '$1 കോടി');
  processed = processed.replace(/\bsq\.ft\b/gi, 'സ്ക്വയർ ഫീറ്റ്');
  processed = processed.replace(/\bkm\b/g, 'കിലോമീറ്റർ');

  // Phone number formatting for speech  
  processed = processed.replace(/\+91[-\s]?(\d{4,5})[-\s]?(\d{5,6})/g, 'പ്ലസ് 91 $1 $2');

  // Clean up punctuation - DON'T add extra periods
  processed = processed.replace(/\s*-\s*/g, ' ');
  processed = processed.replace(/\s*:\s*/g, ', ');
  processed = processed.replace(/\s*;\s*/g, ', ');

  // Clean up multiple spaces and newlines
  processed = processed.replace(/\n+/g, ' ');
  processed = processed.replace(/\s+/g, ' ');

  // Clean up multiple periods (prevents stammer)
  processed = processed.replace(/\.{2,}/g, '.');
  processed = processed.replace(/\.\s*\./g, '.');
  processed = processed.replace(/,\s*,/g, ',');

  // Trim and clean
  processed = processed.trim();

  // Ensure the text ends with proper punctuation
  if (processed && !processed.match(/[.!?]$/)) {
    processed += '.';
  }

  return processed;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLanguageCode = "ml-IN" } = await req.json();

    if (!text) {
      throw new Error('Text is required');
    }

    const SARVAM_API_KEY = Deno.env.get('SARVAM_API_KEY');
    if (!SARVAM_API_KEY) {
      throw new Error('SARVAM_API_KEY is not configured');
    }

    // Preprocess text for more natural speech
    const processedText = preprocessTextForSpeech(text, targetLanguageCode);

    console.log('Original text length:', text.length);
    console.log('Processed text for TTS:', processedText.substring(0, 150) + '...');

    // Using 'anushka' for natural voice as per Sarvam SDK
    const speaker = "anushka";

    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: [processedText],
        target_language_code: targetLanguageCode,
        speaker: speaker,
        pitch: 0,
        pace: 1, // Natural pace
        loudness: 1.5, // Slightly louder for clarity
        speech_sample_rate: 22050,
        enable_preprocessing: true, // Enable Sarvam's built-in preprocessing
        model: "bulbul:v2"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sarvam TTS error:', errorText);
      throw new Error(`Sarvam API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    console.log('Sarvam TTS response received successfully');

    // Sarvam returns base64 audio directly in the response
    const audioBase64 = data.audios?.[0];

    if (!audioBase64) {
      throw new Error('No audio data in response');
    }

    return new Response(
      JSON.stringify({
        audioContent: audioBase64,
        processedText: processedText.substring(0, 100) + '...'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('TTS error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
