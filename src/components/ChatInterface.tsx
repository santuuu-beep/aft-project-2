import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { LoadingBubble } from './LoadingBubble';
import { Message } from '../types/chat';
import { 
  Heart, 
  Wheat, 
  AlertCircle,
  Sparkles,
  Shield,
  Stethoscope,
  GraduationCap,
  BookOpen
} from 'lucide-react';

type AssistantMode = 'general' | 'farming' | 'health' | 'education' | 'news' | 'schemes';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  teluguMode: boolean;
  voiceError?: string | null;
  assistantMode?: AssistantMode;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  isLoading, 
  error, 
  teluguMode,
  voiceError,
  assistantMode = 'general'
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const getEmptyStateContent = () => {
    switch (assistantMode) {
      case 'farming':
        return {
          icon: Wheat,
          title: teluguMode ? 'వ్యవసాయ నిపుణుడితో మాట్లాడండి' : 'Talk to Your Farming Expert',
          description: teluguMode 
            ? 'పంటలు, మట్టి, కీటకాలు, నీటిపారుదల మరియు దిగుబడి గురించి అడగండి'
            : 'Ask about crops, soil, pests, irrigation, and yield optimization',
          bgColor: 'from-green-50 to-emerald-50',
          iconColor: 'text-green-600'
        };
      case 'health':
        return {
          icon: Stethoscope,
          title: teluguMode ? 'ఆరోగ్య నిపుణుడితో మాట్లాడండి' : 'Talk to Your Health Expert',
          description: teluguMode 
            ? 'లక్షణాలు, మందులు, చికిత్సలు మరియు ఆరోగ్య చిట్కాల గురించి అడగండి'
            : 'Ask about symptoms, medicines, treatments, and health tips',
          bgColor: 'from-red-50 to-pink-50',
          iconColor: 'text-red-600'
        };
      case 'education':
        return {
          icon: BookOpen,
          title: teluguMode ? 'విద్యా గైడ్‌తో మాట్లాడండి' : 'Talk to Your Education Guide',
          description: teluguMode 
            ? 'పాఠశాల విషయాలు, పరీక్షలు, స్కాలర్‌షిప్‌లు మరియు కెరీర్ గైడెన్స్ గురించి అడగండి'
            : 'Ask about school subjects, exams, scholarships, and career guidance',
          bgColor: 'from-blue-50 to-indigo-50',
          iconColor: 'text-blue-600'
        };
      default:
        return {
          icon: Heart,
          title: teluguMode ? 'జీవమిత్రతో మాట్లాడండి' : 'Talk to Jeevamithra',
          description: teluguMode 
            ? 'ఏదైనా ప్రశ్న అడగండి - ఆరోగ్యం, వ్యవసాయం లేదా రోజువారీ సందేహాలు'
            : 'Ask any question - health, farming, or daily doubts',
          bgColor: 'from-blue-50 to-indigo-50',
          iconColor: 'text-blue-600'
        };
    }
  };

  const emptyState = getEmptyStateContent();

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Voice Error Banner */}
      {voiceError && (
        <div className="p-4">
          <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 max-w-md mx-auto">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0" />
              <p className="text-sm text-orange-700 font-medium">{voiceError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {messages.length === 0 && (
        <div className="h-full flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className={`w-20 h-20 bg-gradient-to-br ${emptyState.bgColor} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
              <emptyState.icon className={`w-10 h-10 ${emptyState.iconColor}`} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {emptyState.title}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              {emptyState.description}
            </p>
            
            {/* Expert Ready Indicator */}
            {assistantMode === 'health' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Stethoscope className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-bold text-red-800">
                    {teluguMode ? 'వైద్య నిపుణుడు సిద్ధం' : 'Medical Expert Ready'}
                  </span>
                </div>
                <p className="text-xs text-red-700">
                  {teluguMode 
                    ? 'వృత్తిపరమైన వైద్య సలహా, మందుల సమాచారం మరియు ఆరోగ్య చిట్కాలు'
                    : 'Professional medical advice, medicine info, and health tips'
                  }
                </p>
              </div>
            )}

            {assistantMode === 'farming' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Wheat className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-bold text-green-800">
                    {teluguMode ? 'వ్యవసాయ నిపుణుడు సిద్ధం' : 'Farming Expert Ready'}
                  </span>
                </div>
                <p className="text-xs text-green-700">
                  {teluguMode 
                    ? 'అనుభవజ్ఞుడైన రైతు మరియు వ్యవసాయ నిపుణుడు సలహా'
                    : 'Experienced farmer and agricultural expert advice'
                  }
                </p>
              </div>
            )}

            {assistantMode === 'education' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-bold text-blue-800">
                    {teluguMode ? 'విద్యా నిపుణుడు సిద్ధం' : 'Education Expert Ready'}
                  </span>
                </div>
                <p className="text-xs text-blue-700">
                  {teluguMode 
                    ? 'పాఠశాల విషయాలు, పరీక్షలు మరియు కెరీర్ గైడెన్స్ నిపుణుడు'
                    : 'School subjects, exams, and career guidance expert'
                  }
                </p>
              </div>
            )}

            {/* Trust Indicators */}
            <div className="flex justify-center items-center space-x-3 flex-wrap">
              <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full border border-gray-200 text-xs">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span className="text-gray-700 font-medium">
                  {teluguMode ? 'AI సహాయకుడు' : 'AI Assistant'}
                </span>
              </div>
              <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full border border-gray-200 text-xs">
                <Shield className="w-3 h-3 text-green-600" />
                <span className="text-gray-700 font-medium">
                  {teluguMode ? 'విశ్వసనీయం' : 'Trusted'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat Messages */}
      {messages.length > 0 && (
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} teluguMode={teluguMode} />
          ))}
          
          {isLoading && <LoadingBubble teluguMode={teluguMode} />}
          
          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 max-w-md">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};