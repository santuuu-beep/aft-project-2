import React, { useState, useEffect } from 'react';
import { Bot, Languages, Stethoscope, Volume2, VolumeX, Cloud, Loader2, Sparkles } from 'lucide-react';
import { isTTSAvailable, getTTSProviderInfo, isTTSLoading } from '../services/googleTTS';

interface HeaderProps {
  teluguMode: boolean;
  onToggleTeluguMode: () => void;
  voiceEnabled?: boolean;
  onToggleVoiceMode?: () => void;
  ttsProvider?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  teluguMode, 
  onToggleTeluguMode, 
  voiceEnabled = true,
  onToggleVoiceMode,
  ttsProvider = 'google'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<string>('');
  const [currentLanguage, setCurrentLanguage] = useState<string>('');
  
  const providerInfo = getTTSProviderInfo();
  
  // Listen for TTS status changes
  useEffect(() => {
    const handleTTSStatus = (event: CustomEvent) => {
      const { status, voice, language, isLoading: loading } = event.detail;
      setIsLoading(loading || false);
      if (voice) {
        setCurrentVoice(voice);
      }
      if (language) {
        setCurrentLanguage(language);
      }
    };

    window.addEventListener('tts-status-change', handleTTSStatus as EventListener);
    
    return () => {
      window.removeEventListener('tts-status-change', handleTTSStatus as EventListener);
    };
  }, []);
  
  const getProviderIcon = () => {
    if (isLoading) {
      return <Loader2 size={14} className="text-blue-600 animate-spin" />;
    }
    
    return (
      <div className="flex items-center space-x-1">
        <Cloud size={14} className="text-blue-600" />
        <Sparkles size={12} className="text-yellow-500" />
      </div>
    );
  };

  const getProviderText = () => {
    if (isLoading) {
      return teluguMode ? 'మాట్లాడుతోంది...' : 'Speaking...';
    }
    
    const currentVoiceDisplay = teluguMode ? 'తెలుగు' : 'English';
    return teluguMode ? `Google TTS (${currentVoiceDisplay})` : `Google TTS (${currentVoiceDisplay})`;
  };

  return (
    <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/50 px-4 py-4 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <span>{teluguMode ? 'AI వైద్య సహాయకుడు' : 'AI Medical Assistant'}</span>
              <Stethoscope className="w-5 h-5 text-green-600" />
            </h1>
            <div className="flex items-center space-x-3">
              <p className="text-sm text-gray-600">
                {teluguMode ? 'Google Gemini ద్వారా శక్తివంతం' : 'Powered by Google Gemini'}
              </p>
              {isTTSAvailable() && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {getProviderIcon()}
                    <span>{getProviderText()}</span>
                  </div>
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium border border-blue-200">
                    {teluguMode ? 'ప్రీమియం వాయిస్' : 'Premium Voice'}
                  </div>
                </div>
              )}
            </div>
            {currentVoice && currentLanguage && voiceEnabled && (
              <div className="text-xs text-gray-500 mt-1">
                {teluguMode ? 'వాయిస్:' : 'Voice:'} {currentVoice} ({currentLanguage})
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Voice Toggle Button */}
          {onToggleVoiceMode && isTTSAvailable() && (
            <button
              onClick={onToggleVoiceMode}
              disabled={isLoading}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
                voiceEnabled 
                  ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-2 border-blue-200' 
                  : 'bg-gray-100 text-gray-500 border-2 border-gray-200 hover:bg-gray-200'
              } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              title={voiceEnabled 
                ? (teluguMode ? 'Google TTS వాయిస్ ఆన్' : 'Google TTS Voice On')
                : (teluguMode ? 'వాయిస్ రెస్పాన్స్ ఆఫ్' : 'Voice Response Off')
              }
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : voiceEnabled ? (
                <Volume2 size={16} />
              ) : (
                <VolumeX size={16} />
              )}
              <span className="text-sm font-medium hidden sm:inline">
                {isLoading ? (
                  teluguMode ? 'మాట్లాడుతోంది...' : 'Speaking...'
                ) : voiceEnabled ? (
                  teluguMode ? 'Google వాయిస్' : 'Google Voice'
                ) : (
                  teluguMode ? 'వాయిస్ ఆఫ్' : 'Voice Off'
                )}
              </span>
              {voiceEnabled && !isLoading && (
                <div className="flex items-center space-x-1">
                  <Cloud size={12} className="text-blue-600" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" title="Google TTS Active" />
                </div>
              )}
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={onToggleTeluguMode}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
              teluguMode 
                ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-2 border-orange-200' 
                : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Languages size={16} />
            <span className="text-sm font-medium">
              {teluguMode ? 'తెలుగు మోడ్' : 'Telugu Mode'}
            </span>
            <span className="text-xs bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full">
              {teluguMode ? 'తెలుగు వాయిస్' : 'English Voice'}
            </span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
              {teluguMode ? 'వైద్య సేవ ఆన్‌లైన్' : 'Medical Service Online'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};