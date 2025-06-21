// Google Speech-to-Text API service for voice input transcription

const API_KEY = 'AIzaSyDXf4W88CpdbzRW_NSmR4d5wNWU2UThJ6Y';
const SPEECH_API_URL = `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`;

interface SpeechRequest {
  config: {
    encoding: string;
    sampleRateHertz: number;
    languageCode: string;
    enableAutomaticPunctuation: boolean;
    model: string;
  };
  audio: {
    content: string;
  };
}

interface SpeechResponse {
  results?: {
    alternatives: {
      transcript: string;
      confidence: number;
    }[];
  }[];
}

/**
 * Transcribes audio using Google Speech-to-Text API
 * @param audioBase64 - Base64 encoded audio data
 * @param languageCode - Language code (e.g., 'en-US', 'te-IN')
 * @param encoding - Audio encoding format
 * @param sampleRateHertz - Sample rate of the audio
 * @returns Promise<string> - Transcribed text
 */
export const transcribeAudio = async (
  audioBase64: string,
  languageCode: string = 'en-US',
  encoding: string = 'WEBM_OPUS',
  sampleRateHertz: number = 48000
): Promise<string> => {
  try {
    if (!audioBase64 || audioBase64.trim().length === 0) {
      throw new Error('No audio data provided for transcription');
    }

    console.log(`Transcribing audio: ${encoding} at ${sampleRateHertz}Hz in ${languageCode}`);

    const requestBody: SpeechRequest = {
      config: {
        encoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
        enableAutomaticPunctuation: true,
        model: 'latest_long' // Use latest model for better accuracy
      },
      audio: {
        content: audioBase64
      }
    };

    const response = await fetch(SPEECH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 400) {
        throw new Error('Invalid audio format or configuration');
      } else if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status === 403) {
        throw new Error('API quota exceeded or access denied');
      } else {
        throw new Error(errorData.error?.message || `Speech API Error: ${response.status} ${response.statusText}`);
      }
    }

    const data: SpeechResponse = await response.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error('No speech detected in audio');
    }

    // Get the transcript with highest confidence
    const result = data.results[0];
    if (!result.alternatives || result.alternatives.length === 0) {
      throw new Error('No transcription alternatives found');
    }

    const transcript = result.alternatives[0].transcript;
    const confidence = result.alternatives[0].confidence;

    console.log(`Transcription successful: "${transcript}" (confidence: ${confidence})`);
    
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Empty transcription result');
    }

    return transcript.trim();

  } catch (error) {
    console.error('Speech transcription error:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Failed to transcribe audio');
  }
};

/**
 * Checks if the Speech-to-Text API is available
 * @returns boolean
 */
export const isSpeechAPIAvailable = (): boolean => {
  return typeof fetch !== 'undefined' && !!API_KEY;
};

/**
 * Gets supported language codes for speech recognition
 * @returns string[] - Array of supported language codes
 */
export const getSupportedLanguages = (): string[] => {
  return [
    'en-US', // English (US)
    'en-IN', // English (India)
    'te-IN', // Telugu (India)
    'hi-IN', // Hindi (India)
    'ta-IN', // Tamil (India)
    'kn-IN', // Kannada (India)
    'ml-IN', // Malayalam (India)
    'bn-IN', // Bengali (India)
    'gu-IN', // Gujarati (India)
    'mr-IN', // Marathi (India)
    'pa-IN'  // Punjabi (India)
  ];
};

/**
 * Validates audio configuration for speech recognition
 * @param encoding - Audio encoding format
 * @param sampleRate - Sample rate in Hz
 * @returns boolean
 */
export const validateAudioConfig = (encoding: string, sampleRate: number): boolean => {
  const supportedEncodings = [
    'LINEAR16',
    'FLAC',
    'MULAW',
    'AMR',
    'AMR_WB',
    'OGG_OPUS',
    'SPEEX_WITH_HEADER_BYTE',
    'WEBM_OPUS',
    'MP3'
  ];

  const supportedSampleRates = [8000, 12000, 16000, 24000, 48000];

  return supportedEncodings.includes(encoding) && supportedSampleRates.includes(sampleRate);
};