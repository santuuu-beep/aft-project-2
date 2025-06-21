import React from 'react';

interface LoadingBubbleProps {
  teluguMode: boolean;
}

export const LoadingBubble: React.FC<LoadingBubbleProps> = ({ teluguMode }) => {
  return (
    <div className="flex justify-start mb-4 animate-fadeIn">
      <div className="bg-white/90 backdrop-blur-sm text-gray-800 rounded-2xl rounded-bl-md border border-gray-100 px-4 py-3 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-xs text-gray-500">
            {teluguMode ? 'ఆలోచిస్తున్నాను...' : 'Thinking...'}
          </span>
        </div>
      </div>
    </div>
  );
};