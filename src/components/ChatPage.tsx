import React from 'react';
import { ArrowLeft, Languages, Volume2, VolumeX, Heart, Wheat, GraduationCap } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { ChatInput } from './ChatInput';
import { Message } from '../types/chat';

type AssistantMode = 'general' | 'farming' | 'health' | 'education' | 'news' | 'schemes';

interface ChatPageProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (text: string, image?: { file: File; base64: string; preview: string }) => void;
  onClearChat: () => void;
  onBackToHome: () => void;
  teluguMode: boolean;
  onToggleLanguage: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  assistantMode: AssistantMode;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  messages,
  isLoading,
  error,
  onSendMessage,
  onClearChat,
  onBackToHome,
  teluguMode,
  onToggleLanguage,
  voiceEnabled,
  onToggleVoice,
  assistantMode
}) => {
  const getModeInfo = () => {
    switch (assistantMode) {
      case 'farming':
        return {
          icon: Wheat,
          title: teluguMode ? '🌾 వ్యవసాయ నిపుణుడు సహాయకుడు' : '🌾 Farming Expert Assistant',
          bgColor: 'bg-green-600',
          textColor: 'text-white'
        };
      case 'health':
        return {
          icon: Heart,
          title: teluguMode ? '🩺 AI ఆరోగ్య సహాయకుడు' : '🩺 AI Health Assistant',
          bgColor: 'bg-red-600',
          textColor: 'text-white'
        };
      case 'education':
        return {
          icon: GraduationCap,
          title: teluguMode ? '📚 AI విద్యా గైడ్' : '📚 AI Education Guide',
          bgColor: 'bg-blue-600',
          textColor: 'text-white'
        };
      default:
        return {
          icon: Heart,
          title: teluguMode ? '💬 జీవమిత్ర' : '💬 Jeevamithra',
          bgColor: 'bg-blue-600',
          textColor: 'text-white'
        };
    }
  };

  const modeInfo = getModeInfo();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Header Bar */}
      <header className={`${modeInfo.bgColor} ${modeInfo.textColor} px-4 py-4 shadow-lg`}>
        <div className="flex items-center justify-between">
          {/* Left: Back button and Mode info */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToHome}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200"
              title={teluguMode ? 'హోమ్‌కు వెళ్లండి' : 'Back to Home'}
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            
            <div className="flex items-center space-x-3">
              <modeInfo.icon className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-lg font-bold">
                  {modeInfo.title}
                </h1>
                <p className="text-sm text-white/80">
                  {assistantMode === 'health' && (teluguMode ? 'వైద్య సలహా మరియు ఆరోగ్య చిట్కాలు' : 'Medical advice & health tips')}
                  {assistantMode === 'farming' && (teluguMode ? 'పంటలు, మట్టి మరియు వ్యవసాయ సలహా' : 'Crops, soil & farming advice')}
                  {assistantMode === 'education' && (teluguMode ? 'విద్యా మార్గదర్శకత్వం మరియు కెరీర్ సలహా' : 'Education guidance & career advice')}
                  {assistantMode === 'general' && (teluguMode ? 'మీ గ్రామ సహాయకుడు' : 'Your village assistant')}
                </p>
              </div>
            </div>
          </div>
          
          {/* Right: Controls */}
          <div className="flex items-center space-x-3">
            {/* Voice Toggle */}
            <button
              onClick={onToggleVoice}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
                voiceEnabled 
                  ? 'bg-white/20 text-white border border-white/30' 
                  : 'bg-white/10 text-white/60 border border-white/20 hover:bg-white/20'
              }`}
            >
              {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span className="text-sm font-medium hidden sm:inline">
                {teluguMode ? (voiceEnabled ? 'వాయిస్' : 'వాయిస్ ఆఫ్') : (voiceEnabled ? 'Voice' : 'Voice Off')}
              </span>
            </button>

            {/* Language Toggle */}
            <button
              onClick={onToggleLanguage}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
                teluguMode 
                  ? 'bg-orange-500/80 text-white border border-orange-400/50' 
                  : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
              }`}
            >
              <Languages size={16} />
              <span className="text-sm font-medium">
                {teluguMode ? 'తెలుగు' : 'English'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Chat Messages Area - Full height minus header and input */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface 
          messages={messages} 
          isLoading={isLoading} 
          error={error} 
          teluguMode={teluguMode}
          assistantMode={assistantMode}
        />
      </div>

      {/* Fixed Bottom Input Bar */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <ChatInput 
          onSendMessage={onSendMessage} 
          isLoading={isLoading} 
          onClearChat={onClearChat}
          teluguMode={teluguMode}
          assistantMode={assistantMode}
          isTopInput={false}
        />
      </div>
    </div>
  );
};