import React, { useRef, useState, useCallback } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { transcribeAudio } from '../services/speechApi';
import { convertBlobToBase64, getOptimalAudioConfig, requestMicrophonePermission } from '../utils/audioUtils';

interface VoiceInputProps {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  teluguMode: boolean;
  disabled: boolean;
  compact?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onResult,
  onError,
  teluguMode,
  disabled,
  compact = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    setIsListening(false);
    setRecordingTime(0);
  }, []);

  const processAudioRecording = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      const audioBase64 = await convertBlobToBase64(audioBlob);
      const audioConfig = getOptimalAudioConfig();
      
      const languageCode = teluguMode ? 'te-IN' : 'en-IN';
      
      const transcript = await transcribeAudio(
        audioBase64,
        languageCode,
        audioConfig.encoding,
        audioConfig.sampleRateHertz
      );
      
      if (transcript.trim()) {
        onResult(transcript);
      } else {
        throw new Error('No speech detected');
      }
      
    } catch (error) {
      console.error('Voice processing error:', error);
      
      let errorMessage = teluguMode 
        ? 'క్షమించండి, మీ మాటలు స్పష్టంగా వినిపించలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.'
        : 'Sorry, couldn\'t hear you properly. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('No speech detected')) {
          errorMessage = teluguMode 
            ? 'మాటలు వినిపించలేదు. దయచేసి మళ్లీ మాట్లాడండి.'
            : 'No speech detected. Please speak again.';
        } else if (error.message.includes('permission')) {
          errorMessage = teluguMode 
            ? 'మైక్రోఫోన్ అనుమతి అవసరం'
            : 'Microphone permission required';
        }
      }
      
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      
      const stream = await requestMicrophonePermission();
      streamRef.current = stream;

      const audioConfig = getOptimalAudioConfig();
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: audioConfig.mimeType
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: audioConfig.mimeType
        });
        
        if (audioBlob.size > 0) {
          await processAudioRecording(audioBlob);
        } else {
          onError(
            teluguMode 
              ? 'ఆడియో రికార్డ్ చేయబడలేదు'
              : 'No audio recorded'
          );
        }
        
        cleanup();
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        onError(
          teluguMode 
            ? 'రికార్డింగ్ లోపం'
            : 'Recording error'
        );
        cleanup();
      };

      mediaRecorder.start(100);
      setIsListening(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      recordingTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 10000);

    } catch (error) {
      console.error('Error starting recording:', error);
      
      let errorMessage = teluguMode 
        ? 'మైక్రోఫోన్ యాక్సెస్ విఫలమైంది'
        : 'Microphone access failed';
      
      if (error instanceof Error) {
        if (error.message.includes('permission denied')) {
          errorMessage = teluguMode 
            ? 'మైక్రోఫోన్ అనుమతి తిరస్కరించబడింది'
            : 'Microphone permission denied';
        }
      }
      
      onError(errorMessage);
      cleanup();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const isSupported = typeof MediaRecorder !== 'undefined' && 
                     navigator.mediaDevices && 
                     navigator.mediaDevices.getUserMedia;

  if (!isSupported) {
    return null;
  }

  const getButtonContent = () => {
    if (isProcessing) {
      return <Loader2 size={compact ? 20 : 24} className="animate-spin text-blue-600" />;
    }
    
    if (isListening) {
      return <Square size={compact ? 20 : 24} className="text-red-600" />;
    }
    
    return <Mic size={compact ? 20 : 24} />;
  };

  const getButtonTitle = () => {
    if (isProcessing) {
      return teluguMode ? 'మాటలను అర్థం చేసుకుంటున్నాను...' : 'Understanding your speech...';
    }
    
    if (isListening) {
      return teluguMode ? 'రికార్డింగ్ ఆపండి' : 'Stop recording';
    }
    
    return teluguMode ? 'తెలుగులో మాట్లాడండి' : 'Tap and speak in English';
  };

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const getCurrentLanguageInfo = () => {
    return {
      flag: teluguMode ? '🇮🇳' : '🇺🇸',
      name: teluguMode ? 'తెలుగు' : 'English',
      code: teluguMode ? 'TE' : 'EN'
    };
  };

  const languageInfo = getCurrentLanguageInfo();

  return (
    <div className="relative">
      {/* Language Indicator - Only show if not compact */}
      {!compact && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
            teluguMode 
              ? 'bg-orange-100 text-orange-700 border border-orange-200' 
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            <span>{languageInfo.flag}</span>
            <span>{languageInfo.code}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleRecording}
        disabled={disabled || isProcessing}
        className={`${compact ? 'p-2' : 'p-4'} rounded-xl transition-all duration-200 shadow-lg relative ${
          isListening
            ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
            : isProcessing
            ? 'bg-blue-100 text-blue-600'
            : 'bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700'
        } ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
        title={getButtonTitle()}
      >
        {getButtonContent()}
        
        {/* Active language indicator on button - Only show if not compact */}
        {!compact && !isListening && !isProcessing && (
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
            teluguMode 
              ? 'bg-orange-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            {languageInfo.code}
          </div>
        )}
      </button>
      
      {/* Recording indicator */}
      {isListening && (
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-2xl text-sm font-medium whitespace-nowrap shadow-lg z-10">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-base">
              🎤 {teluguMode 
                ? `తెలుగులో మాట్లాడండి... వింటున్నాను!` 
                : `Listening in English... Speak now!`
              }
            </span>
            <span className="text-sm opacity-80">{formatTime(recordingTime)}</span>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-500"></div>
        </div>
      )}
      
      {/* Processing indicator */}
      {isProcessing && (
        <div className={`absolute -top-16 left-1/2 transform -translate-x-1/2 text-white px-6 py-3 rounded-2xl text-sm font-medium whitespace-nowrap shadow-lg z-10 ${
          teluguMode ? 'bg-orange-500' : 'bg-blue-500'
        }`}>
          <div className="flex items-center space-x-3">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-base">
              {teluguMode 
                ? `తెలుగు మాటలను అర్థం చేసుకుంటున్నాను...` 
                : `Processing English speech...`
              }
            </span>
          </div>
          <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
            teluguMode ? 'border-t-orange-500' : 'border-t-blue-500'
          }`}></div>
        </div>
      )}
    </div>
  );
};