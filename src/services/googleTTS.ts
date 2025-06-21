// Google Cloud Text-to-Speech API service with Telugu and English voice support

const API_KEY = 'AIzaSyDXf4W88CpdbzRW_NSmR4d5wNWU2UThJ6Y';
const TTS_API_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;

interface TTSRequest {
  input: {
    text: string;
  };
  voice: {
    languageCode: string;
    name: string;
  };
  audioConfig: {
    audioEncoding: string;
  };
}

interface TTSResponse {
  audioContent: string;
}

interface SpeechResult {
  success: boolean;
  voiceUsed?: string;
  language?: string;
  error?: string;
}

class GoogleTTSService {
  private audioCache: Map<string, string> = new Map();
  private isPlaying: boolean = false;
  private currentAudio: HTMLAudioElement | null = null;

  private generateCacheKey(text: string, language: string): string {
    return `${language}:${text.substring(0, 100)}`;
  }

  private cleanTextForTTS(text: string): string {
    return text
      .replace(/[⚠️🚨🔊🎯✅📦🧠🔧🖥️💬🔒📜🌐🎤🎵🔍🆘📄🤝🔄]/g, '') // Remove emojis
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
      .replace(/`(.*?)`/g, '$1') // Remove code blocks
      .replace(/#{1,6}\s/g, '') // Remove markdown headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links, keep text
      .replace(/\n{2,}/g, '. ') // Replace multiple newlines with periods
      .replace(/\n/g, ' ') // Replace single newlines with spaces
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  private getVoiceConfig(teluguMode: boolean) {
    if (teluguMode) {
      return {
        languageCode: "te-IN",
        name: "te-IN-Standard-A"
      };
    } else {
      return {
        languageCode: "en-IN",
        name: "en-IN-Wavenet-D"
      };
    }
  }

  private dispatchStatusEvent(status: string, isLoading: boolean = false, voice?: string, language?: string): void {
    const event = new CustomEvent('tts-status-change', {
      detail: { status, isLoading, voice, language }
    });
    window.dispatchEvent(event);
  }

  public async synthesizeSpeech(text: string, teluguMode: boolean = false): Promise<string> {
    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for speech synthesis');
    }

    const cleanedText = this.cleanTextForTTS(text);
    
    if (cleanedText.length === 0) {
      throw new Error('No speakable text found after cleaning');
    }

    const voiceConfig = this.getVoiceConfig(teluguMode);
    const language = teluguMode ? 'Telugu' : 'English';
    
    // Check cache first
    const cacheKey = this.generateCacheKey(cleanedText, voiceConfig.languageCode);
    if (this.audioCache.has(cacheKey)) {
      console.log(`Using cached TTS audio for ${language}`);
      return this.audioCache.get(cacheKey)!;
    }

    this.dispatchStatusEvent('synthesizing', true, voiceConfig.name, language);

    try {
      console.log(`Requesting Google TTS for ${language}: "${cleanedText.substring(0, 50)}..."`);

      const requestBody: TTSRequest = {
        input: {
          text: cleanedText
        },
        voice: voiceConfig,
        audioConfig: {
          audioEncoding: "MP3"
        }
      };

      const response = await fetch(TTS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `TTS API Error: ${response.status} ${response.statusText}`);
      }

      const data: TTSResponse = await response.json();
      
      if (!data.audioContent) {
        throw new Error('No audio content received from TTS API');
      }

      // Create audio URL from base64 data
      const audioUrl = `data:audio/mp3;base64,${data.audioContent}`;
      
      // Cache the result (with size limit)
      if (this.audioCache.size > 50) {
        const firstKey = this.audioCache.keys().next().value;
        this.audioCache.delete(firstKey);
      }
      
      this.audioCache.set(cacheKey, audioUrl);
      
      console.log(`TTS Success: Generated ${language} audio using ${voiceConfig.name}`);
      this.dispatchStatusEvent('ready', false, voiceConfig.name, language);
      
      return audioUrl;

    } catch (error) {
      console.error(`Google TTS Error for ${language}:`, error);
      this.dispatchStatusEvent('error', false);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error(`Failed to synthesize ${language} speech with Google TTS`);
    }
  }

  public async playAudio(audioUrl: string, voiceName: string, language: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop current audio if playing
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }

      if (this.isPlaying) {
        console.log('Audio already playing, stopping previous...');
        this.isPlaying = false;
      }

      const audio = new Audio(audioUrl);
      
      audio.oncanplaythrough = () => {
        console.log(`${language} TTS audio ready to play`);
      };
      
      audio.onended = () => {
        console.log(`${language} TTS audio playback completed`);
        // Only clear if this is still the current audio
        if (this.currentAudio === audio) {
          this.isPlaying = false;
          this.currentAudio = null;
          this.dispatchStatusEvent('ended', false, voiceName, language);
        }
        resolve();
      };
      
      audio.onerror = (error) => {
        console.error(`${language} TTS audio playback failed:`, error);
        // Only clear if this is still the current audio
        if (this.currentAudio === audio) {
          this.isPlaying = false;
          this.currentAudio = null;
          this.dispatchStatusEvent('error', false);
        }
        reject(new Error(`${language} audio playback failed`));
      };
      
      // Start playback
      audio.play().then(() => {
        // Only set as current audio after play() succeeds
        this.currentAudio = audio;
        this.isPlaying = true;
        this.dispatchStatusEvent('playing', false, voiceName, language);
      }).catch(error => {
        console.error(`Failed to start ${language} TTS audio playback:`, error);
        this.isPlaying = false;
        this.dispatchStatusEvent('error', false);
        reject(new Error(`Failed to start ${language} audio playback`));
      });
    });
  }

  public async speakText(text: string, teluguMode: boolean = false): Promise<SpeechResult> {
    try {
      const voiceConfig = this.getVoiceConfig(teluguMode);
      const language = teluguMode ? 'Telugu' : 'English';
      
      const audioUrl = await this.synthesizeSpeech(text, teluguMode);
      await this.playAudio(audioUrl, voiceConfig.name, language);
      
      return {
        success: true,
        voiceUsed: voiceConfig.name,
        language: language
      };
    } catch (error) {
      console.error('TTS speak text failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  public stopCurrentAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isPlaying = false;
    this.dispatchStatusEvent('stopped', false);
  }

  public isAvailable(): boolean {
    return true; // Always available with API key
  }

  public isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  public clearCache(): void {
    this.audioCache.clear();
    console.log('TTS cache cleared');
  }

  public getCacheSize(): number {
    return this.audioCache.size;
  }

  public getProviderInfo(): {
    provider: string;
    quality: string;
    teluguVoice: string;
    englishVoice: string;
    features: string[];
  } {
    return {
      provider: 'Google Cloud TTS',
      quality: 'High',
      teluguVoice: 'te-IN-Standard-A',
      englishVoice: 'en-IN-Wavenet-D',
      features: [
        'Telugu voice synthesis',
        'Indian English voice',
        'MP3 audio encoding',
        'Direct API integration',
        'Audio caching',
        'Language-aware voice selection'
      ]
    };
  }
}

// Create singleton instance
const googleTTSService = new GoogleTTSService();

// Export main functions
export const speakText = async (text: string, teluguMode: boolean = false): Promise<SpeechResult> => {
  return googleTTSService.speakText(text, teluguMode);
};

export const synthesizeAudio = async (text: string, teluguMode: boolean = false): Promise<string> => {
  return googleTTSService.synthesizeSpeech(text, teluguMode);
};

export const stopAudio = (): void => {
  googleTTSService.stopCurrentAudio();
};

export const isTTSAvailable = (): boolean => {
  return googleTTSService.isAvailable();
};

export const isTTSLoading = (): boolean => {
  return googleTTSService.isCurrentlyPlaying();
};

export const getTTSProviderInfo = () => {
  return googleTTSService.getProviderInfo();
};

export const clearTTSCache = (): void => {
  googleTTSService.clearCache();
};

export const getTTSCacheSize = (): number => {
  return googleTTSService.getCacheSize();
};

export default googleTTSService;