import React, { useState, useEffect } from 'react';
import { AuthScreen } from './components/auth/AuthScreen';
import { ProfileSection } from './components/profile/ProfileSection';
import { HomePage } from './components/HomePage';
import { ChatPage } from './components/ChatPage';
import { ModeInputPage } from './components/ModeInputPage';
import { Message } from './types/chat';
import { sendMessage } from './services/api';
import { useLocalStorage } from './hooks/useLocalStorage';
import { speakText, isTTSAvailable } from './services/googleTTS';
import { LogOut, Loader2 } from 'lucide-react';

type Page = 'home' | 'health-input' | 'farming-input' | 'education-input' | 'health-chat' | 'farming-chat' | 'education-chat';
type AssistantMode = 'general' | 'farming' | 'health' | 'education' | 'news' | 'schemes';

type UserProfile = {
  fullName: string;
  email: string;
  // Add other profile fields if needed
};

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [assistantMode, setAssistantMode] = useState<AssistantMode>('general');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teluguMode, setTeluguMode] = useLocalStorage('teluguMode', false);
  const [voiceEnabled, setVoiceEnabled] = useLocalStorage('voiceEnabled', true);
  const [pendingUserMessage, setPendingUserMessage] = useState<string>('');
  const [showProfile, setShowProfile] = useState(false);

  // Load userProfile from localStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
    setLoading(false);
  }, []);

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            {teluguMode ? 'లోడ్ అవుతోంది...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Show auth screen if not logged in
  if (!userProfile) {
    return (
      <AuthScreen
        teluguMode={teluguMode}
        onLogin={(profile: UserProfile) => {
          localStorage.setItem('userProfile', JSON.stringify(profile));
          setUserProfile(profile);
        }}
      />
    );
  }

  // Add welcome message when entering chat with mode-specific content
  useEffect(() => {
    if (
      (currentPage === 'health-chat' ||
        currentPage === 'farming-chat' ||
        currentPage === 'education-chat') &&
      messages.length === 0
    ) {
      const getModeWelcomeMessage = () => {
        switch (assistantMode) {
          case 'farming':
            return teluguMode
              ? `🌾 నమస్కారం ${userProfile.fullName}! నేను మీ AI వ్యవసాయ సహాయకుడిని. పంటలు, మట్టి, కీటకాలు, నీటిపారుదల మరియు దిగుబడి ఎలా పెంచాలో నన్ను అడగండి.`
              : `🌾 Hello ${userProfile.fullName}! I'm your AI Farming Assistant. Ask me anything about crops, soil, pests, irrigation, and how to increase yield.`;
          case 'health':
            return teluguMode
              ? `👩‍⚕️ నమస్కారం ${userProfile.fullName}! నేను మీ AI ఆరోగ్య సహాయకుడిని. లక్షణాలు, మందులు, చికిత్సలు మరియు ఆరోగ్యంగా ఎలా ఉండాలో నేను మీకు సహాయం చేయగలను.`
              : `👩‍⚕️ Hello ${userProfile.fullName}! I'm your AI Health Assistant. I can help you with symptoms, medicines, treatments, and how to stay healthy.`;
          case 'education':
            return teluguMode
              ? `📚 నమస్కారం ${userProfile.fullName}! నేను మీ AI విద్యా గైడ్‌ని. పాఠశాల విషయాలు, పరీక్షలు, స్కాలర్‌షిప్‌లు మరియు కెరీర్ గైడెన్స్‌లో నేను మీకు సహాయం చేయగలను.`
              : `📚 Hello ${userProfile.fullName}! I'm your AI Education Guide. I can help you with school subjects, exams, scholarships, and career guidance.`;
          default:
            return teluguMode
              ? `నమస్కారం ${userProfile.fullName}! నేను జీవమిత్ర. మీకు ఆరోగ్యం, వ్యవసాయం లేదా ఏదైనా సందేహాలు ఉంటే అడగండి.`
              : `Namaste ${userProfile.fullName}! I am Jeevamithra, your village assistant. Ask me about health, farming, or any daily questions.`;
        }
      };

      const welcomeMessage: Message = {
        id: 'welcome',
        content: getModeWelcomeMessage(),
        isUser: false,
        timestamp: new Date(),
      };

      const initialMessages = [welcomeMessage];

      if (pendingUserMessage.trim()) {
        const userMessage: Message = {
          id: 'user-initial',
          content: pendingUserMessage,
          isUser: true,
          timestamp: new Date(),
        };
        initialMessages.push(userMessage);
        setMessages(initialMessages);

        handleInitialMessage(pendingUserMessage);
        setPendingUserMessage('');
      } else {
        setMessages(initialMessages);

        if (voiceEnabled && isTTSAvailable()) {
          setTimeout(() => {
            speakText(welcomeMessage.content, teluguMode).catch(console.log);
          }, 1000);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, teluguMode, voiceEnabled, messages.length, assistantMode, pendingUserMessage, userProfile.fullName]);

  const handleInitialMessage = async (text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessage(text, undefined, teluguMode, assistantMode);

      const botMessage: Message = {
        id: 'bot-initial',
        content: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      if (voiceEnabled && response.trim() && isTTSAvailable()) {
        setTimeout(() => {
          speakText(response, teluguMode).catch(console.log);
        }, 800);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : teluguMode
          ? 'ఏదో తప్పు జరిగింది. మళ్లీ ప్రయత్నించండి.'
          : 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (
    text: string,
    image?: { file: File; base64: string; preview: string }
  ) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: text || (teluguMode ? 'ఈ చిత్రాన్ని చూడండి' : 'Please look at this image'),
      isUser: true,
      timestamp: new Date(),
      image: image?.preview,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessage(text, image?.base64, teluguMode, assistantMode);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      if (voiceEnabled && response.trim() && isTTSAvailable()) {
        setTimeout(() => {
          speakText(response, teluguMode).catch(console.log);
        }, 800);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : teluguMode
          ? 'ఏదో తప్పు జరిగింది. మళ్లీ ప్రయత్నించండి.'
          : 'Something went wrong. Please try again.';
      setError(errorMessage);

      // Remove user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);

    setTimeout(() => {
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now(),
        content: teluguMode ? 'చాట్ క్లియర్ అయ్యింది. మళ్లీ ప్రారంభిద్దాం!' : "Chat cleared. Let's start fresh!",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);

      if (voiceEnabled && isTTSAvailable()) {
        speakText(welcomeMessage.content, teluguMode).catch(console.log);
      }
    }, 100);
  };

  // Render the main app UI depending on the currentPage
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <header className="flex items-center justify-between p-4 bg-white shadow">
        <h1 className="text-xl font-bold text-indigo-700">Jeevamithra</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="text-indigo-600 hover:text-indigo-900"
            aria-label="Toggle Profile"
          >
            Profile
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('userProfile');
              setUserProfile(null);
            }}
            className="flex items-center space-x-1 text-red-600 hover:text-red-900"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
            <span>{teluguMode ? 'లాగ్ అవుట్' : 'Logout'}</span>
          </button>
        </div>
      </header>

      {showProfile && userProfile && (
        <ProfileSection
          userProfile={userProfile}
          teluguMode={teluguMode}
          onClose={() => setShowProfile(false)}
          onUpdateProfile={(updatedProfile) => {
            setUserProfile(updatedProfile);
            localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
          }}
        />
      )}

      <main className="flex-1 overflow-auto p-4">
        {currentPage === 'home' && (
          <HomePage
            teluguMode={teluguMode}
            onSelectMode={(mode: AssistantMode) => {
              setAssistantMode(mode);
              if (mode === 'health') setCurrentPage('health-input');
              else if (mode === 'farming') setCurrentPage('farming-input');
              else if (mode === 'education') setCurrentPage('education-input');
              else setCurrentPage('home');
            }}
          />
        )}

        {(currentPage === 'health-input' ||
          currentPage === 'farming-input' ||
          currentPage === 'education-input') && (
          <ModeInputPage
            teluguMode={teluguMode}
            assistantMode={assistantMode}
            onSubmit={(message) => {
              // Move to chat page and set initial user message
              if (assistantMode === 'health') setCurrentPage('health-chat');
              else if (assistantMode === 'farming') setCurrentPage('farming-chat');
              else if (assistantMode === 'education') setCurrentPage('education-chat');

              setPendingUserMessage(message);
              setMessages([]);
            }}
            onBack={() => setCurrentPage('home')}
          />
        )}

        {(currentPage === 'health-chat' ||
          currentPage === 'farming-chat' ||
          currentPage === 'education-chat') && (
          <ChatPage
            teluguMode={teluguMode}
            messages={messages}
            isLoading={isLoading}
            error={error}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            onBack={() => {
              setCurrentPage('home');
              setMessages([]);
              setError(null);
            }}
            voiceEnabled={voiceEnabled}
            onToggleVoice={() => setVoiceEnabled((prev) => !prev)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
