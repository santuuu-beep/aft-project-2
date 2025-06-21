import React, { useState } from 'react';
import { Message } from '../types/chat';
import { formatTimestamp } from '../utils/fileUtils';
import { Users, User, Volume2, VolumeX, Loader2, Sparkles } from 'lucide-react';
import { speakText, isTTSAvailable } from '../services/googleTTS';

interface MessageBubbleProps {
  message: Message;
  teluguMode?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, teluguMode = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);

  const handleVoiceReplay = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setPlayError(null);
    
    try {
      const result = await speakText(message.content, teluguMode);
      
      if (!result.success) {
        setPlayError(result.error || 'Voice replay failed');
        setTimeout(() => setPlayError(null), 3000);
      }
    } catch (error) {
      console.error('Voice replay failed:', error);
      const errorMessage = teluguMode ? 'వాయిస్ రీప్లే విఫలమైంది' : 'Voice replay failed';
      setPlayError(errorMessage);
      
      setTimeout(() => setPlayError(null), 3000);
    } finally {
      setIsPlaying(false);
    }
  };

  const getVoiceIcon = () => {
    if (isPlaying) {
      return <Loader2 size={16} className="animate-spin" />;
    }
    
    if (playError) {
      return <VolumeX size={16} />;
    }
    
    return <Volume2 size={16} />;
  };

  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fadeIn`}>
      <div className={`flex items-start space-x-4 max-w-2xl ${
        message.isUser ? 'flex-row-reverse space-x-reverse' : ''
      }`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
          message.isUser 
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
            : 'bg-gradient-to-br from-green-500 to-blue-600'
        }`}>
          {message.isUser ? (
            <User size={20} className="text-white" />
          ) : (
            <Users size={20} className="text-white" />
          )}
        </div>
        
        {/* Message Content */}
        <div className={`px-6 py-4 rounded-3xl shadow-sm relative ${
          message.isUser 
            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-lg' 
            : 'bg-white/95 backdrop-blur-sm text-gray-800 rounded-bl-lg border border-gray-100'
        }`}>
          {message.image && (
            <div className="mb-4">
              <img 
                src={message.image} 
                alt="Uploaded" 
                className="rounded-2xl max-w-full h-auto shadow-sm"
              />
            </div>
          )}
          <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
          
          {/* Enhanced Voice Replay Button - Only for bot messages */}
          {!message.isUser && isTTSAvailable() && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200/30">
              <div className="text-xs text-gray-500">
                {formatTimestamp(message.timestamp)}
              </div>
              
              <div className="flex items-center space-x-3">
                {playError && (
                  <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
                    {teluguMode ? 'వాయిస్ లేదు' : 'Voice error'}
                  </span>
                )}
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Sparkles size={12} className="text-blue-500" />
                    <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-2 py-1 rounded-full border border-blue-200 font-medium">
                      {teluguMode ? 'జీవమిత్ర వాయిస్' : 'Jeevamithra Voice'}
                    </span>
                  </div>
                  <button
                    onClick={handleVoiceReplay}
                    disabled={isPlaying}
                    className={`p-2 rounded-full transition-all duration-200 ${
                      isPlaying
                        ? 'bg-blue-100 text-blue-600 cursor-not-allowed' 
                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                    }`}
                    title={
                      isPlaying
                        ? (teluguMode ? 'ప్లే అవుతోంది...' : 'Playing...')
                        : (teluguMode ? 'వాయిస్ రీప్లే' : 'Replay voice')
                    }
                  >
                    {getVoiceIcon()}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Timestamp for user messages */}
          {message.isUser && (
            <div className="text-xs mt-3 text-blue-100">
              {formatTimestamp(message.timestamp)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};