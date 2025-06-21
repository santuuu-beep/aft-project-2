import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, RotateCcw, Mic } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import { VoiceInput } from './VoiceInput';

type AssistantMode = 'general' | 'farming' | 'health' | 'news' | 'schemes';

interface ChatInputProps {
  onSendMessage: (text: string, image?: { file: File; base64: string; preview: string }) => void;
  isLoading: boolean;
  onClearChat: () => void;
  teluguMode: boolean;
  assistantMode?: AssistantMode;
  isTopInput?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  onClearChat, 
  teluguMode,
  assistantMode = 'general',
  isTopInput = false
}) => {
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    base64: string;
    preview: string;
  } | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!message.trim() && !selectedImage) || isLoading) return;
    
    onSendMessage(message, selectedImage || undefined);
    setMessage('');
    setSelectedImage(null);
    setShowImageUpload(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageSelect = (file: File, base64: string, preview: string) => {
    setSelectedImage({ file, base64, preview });
    setShowImageUpload(false);
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    if (selectedImage?.preview) {
      URL.revokeObjectURL(selectedImage.preview);
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setMessage(transcript);
    
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleVoiceError = (error: string) => {
    console.error('Voice input error:', error);
  };

  useEffect(() => {
    if (textareaRef.current && !isTopInput) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message, isTopInput]);

  const getPlaceholder = () => {
    switch (assistantMode) {
      case 'farming':
        return teluguMode 
          ? 'వ్యవసాయ ప్రశ్న అడగండి...'
          : 'Ask a farming question...';
      case 'health':
        return teluguMode 
          ? 'ఆరోగ్య ప్రశ్న అడగండి...'
          : 'Ask a health question...';
      default:
        return teluguMode 
          ? 'మీ ప్రశ్న టైప్ చేయండి...'
          : 'Type your message...';
    }
  };

  // For top input (mode pages), return the large search bar
  if (isTopInput) {
    return (
      <div className="w-full">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <div className="relative">
            <input
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={getPlaceholder()}
              className={`w-full px-6 py-4 pr-24 text-lg border-2 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent bg-white shadow-lg transition-all duration-200 ${
                assistantMode === 'farming' 
                  ? 'border-green-300 focus:ring-green-500'
                  : assistantMode === 'health'
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
              disabled={isLoading}
            />
            
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
              <VoiceInput
                onResult={handleVoiceResult}
                onError={handleVoiceError}
                teluguMode={teluguMode}
                disabled={isLoading}
                compact={true}
              />
            </div>
            
            <button
              type="submit"
              disabled={!message.trim() || isLoading}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-3 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                assistantMode === 'farming'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                  : assistantMode === 'health'
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Bottom chat input (messaging app style)
  return (
    <div className="p-4">
      {/* Image Upload Preview */}
      {showImageUpload && (
        <div className="mb-4">
          <ImageUpload
            onImageSelect={handleImageSelect}
            selectedImage={selectedImage?.preview || null}
            onImageRemove={handleImageRemove}
            teluguMode={teluguMode}
          />
        </div>
      )}
      
      {selectedImage && !showImageUpload && (
        <div className="mb-4">
          <ImageUpload
            onImageSelect={handleImageSelect}
            selectedImage={selectedImage.preview}
            onImageRemove={handleImageRemove}
            teluguMode={teluguMode}
          />
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => setShowImageUpload(!showImageUpload)}
          className="flex-shrink-0 p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
          disabled={isLoading}
          title={teluguMode ? 'చిత్రం అప్‌లోడ్ చేయండి' : 'Upload image'}
        >
          <Paperclip size={20} />
        </button>
        
        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholder()}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-base"
            rows={1}
            disabled={isLoading}
            style={{ maxHeight: '120px' }}
          />
          
          {/* Voice Input Button inside text area */}
          <div className="absolute right-3 bottom-3">
            <VoiceInput
              onResult={handleVoiceResult}
              onError={handleVoiceError}
              teluguMode={teluguMode}
              disabled={isLoading}
              compact={true}
            />
          </div>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!message.trim() && !selectedImage) || isLoading}
          className={`flex-shrink-0 p-3 rounded-full transition-all duration-200 shadow-lg ${
            (!message.trim() && !selectedImage) || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : assistantMode === 'farming'
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : assistantMode === 'health'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};