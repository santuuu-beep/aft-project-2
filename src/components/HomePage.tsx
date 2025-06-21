import React from 'react';
import { 
  Heart, 
  Wheat, 
  Languages,
  Volume2,
  VolumeX,
  Users,
  GraduationCap
} from 'lucide-react';

type AssistantMode = 'general' | 'farming' | 'health' | 'education' | 'news' | 'schemes';

interface HomePageProps {
  onStartChat: (mode?: AssistantMode) => void;
  teluguMode: boolean;
  onToggleLanguage: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartChat,
  teluguMode,
  onToggleLanguage,
  voiceEnabled,
  onToggleVoice
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {teluguMode ? 'జీవమిత్ర' : 'Jeevamithra'}
              </h1>
              <p className="text-sm text-gray-600">
                {teluguMode ? 'మీ గ్రామ సహాయకుడు' : 'Your Village Assistant'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Voice Toggle */}
            <button
              onClick={onToggleVoice}
              className={`flex items-center space-x-2 px-3 py-2 rounded-full transition-all duration-200 ${
                voiceEnabled 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
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
                  ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
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

      {/* Main Content - Centered Mode Cards */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {teluguMode 
                ? 'మీకు ఎలా సహాయం చేయాలి?' 
                : 'How can I help you?'
              }
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {teluguMode 
                ? 'మూడు ప్రత్యేక AI సహాయకులలో ఒకరిని ఎంచుకోండి'
                : 'Choose one of our three specialized AI assistants'
              }
            </p>
          </div>

          {/* Three Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Health Care Mode */}
            <button
              onClick={() => onStartChat('health')}
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {teluguMode ? 'ఆరోగ్య సంరక్షణ' : 'Health Care'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {teluguMode 
                    ? 'లక్షణాలు, మందుల సలహా మరియు ఆరోగ్యంగా ఉండటానికి సహాయం పొందండి.'
                    : 'Get help for symptoms, medicine advice, and staying healthy.'
                  }
                </p>
              </div>
            </button>

            {/* Farming Mode */}
            <button
              onClick={() => onStartChat('farming')}
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Wheat className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {teluguMode ? 'వ్యవసాయ సహాయం' : 'Farming Help'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {teluguMode 
                    ? 'పంటలు, కీటకాలు, మట్టి, నీటిపారుదల లేదా దిగుబడి ఎలా మెరుగుపరచాలో అడగండి.'
                    : 'Ask about crops, pests, soil, irrigation, or how to improve your yield.'
                  }
                </p>
              </div>
            </button>

            {/* Education Mode */}
            <button
              onClick={() => onStartChat('education')}
              className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {teluguMode ? 'విద్యా సహాయం' : 'Education Guide'}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {teluguMode 
                    ? 'పాఠశాల విషయాలు, పరీక్షలు, స్కాలర్‌షిప్‌లు మరియు కెరీర్ గైడెన్స్ పొందండి.'
                    : 'Get help with school subjects, exams, scholarships, and career guidance.'
                  }
                </p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};