import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase/config';
import { useAuth } from './hooks/useAuth';
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

function App() {
  const { user, userProfile, loading, setUserProfile } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [assistantMode, setAssistantMode] = useState<AssistantMode>('general');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teluguMode, setTeluguMode] = useLocalStorage('teluguMode', false);
  const [voiceEnabled, setVoiceEnabled] = useLocalStorage('voiceEnabled', true);
  const [pendingUserMessage, setPendingUserMessage] = useState<string>('');
  const [showProfile, setShowProfile] = useState(false);

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
  if (!user || !userProfile) {
    return <AuthScreen teluguMode={teluguMode} />;
  }

  // Add welcome message when entering chat with mode-specific content
  useEffect(() => {
    if ((currentPage === 'health-chat' || currentPage === 'farming-chat' || currentPage === 'education-chat') && messages.length === 0) {
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
      
      // If there's a pending user message, add it and get AI response
      if (pendingUserMessage.trim()) {
        const userMessage: Message = {
          id: 'user-initial',
          content: pendingUserMessage,
          isUser: true,
          timestamp: new Date(),
        };
        initialMessages.push(userMessage);
        setMessages(initialMessages);
        
        // Get AI response for the user message
        handleInitialMessage(pendingUserMessage);
        setPendingUserMessage('');
      } else {
        setMessages(initialMessages);
        
        // Speak welcome message if voice is enabled
        if (voiceEnabled && isTTSAvailable()) {
          setTimeout(() => {
            speakText(welcomeMessage.content, teluguMode).catch(console.log);
          }, 1000);
        }
      }
    }
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

      setMessages(prev => [...prev, botMessage]);

      // Auto-speak response if voice is enabled
      if (voiceEnabled && response.trim() && isTTSAvailable()) {
        setTimeout(() => {
          speakText(response, teluguMode).catch(console.log);
        }, 800);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        (teluguMode ? 'ఏదో తప్పు జరిగింది. మళ్లీ ప్రయత్నించండి.' : 'Something went wrong. Please try again.');
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

    setMessages(prev => [...prev, userMessage]);
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

      setMessages(prev => [...prev, botMessage]);

      // Auto-speak response if voice is enabled
      if (voiceEnabled && response.trim() && isTTSAvailable()) {
        setTimeout(() => {
          speakText(response, teluguMode).catch(console.log);
        }, 800);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
        (teluguMode ? 'ఏదో తప్పు జరిగింది. మళ్లీ ప్రయత్నించండి.' : 'Something went wrong. Please try again.');
      setError(errorMessage);
      
      // Remove the user message if the API call failed
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    
    // Re-add welcome message
    setTimeout(() => {
      const welcomeMessage: Message = {
        id: 'welcome-' + Date.now(),
        content: teluguMode 
          ? 'చాట్ క్లియర్ అయ్యింది. మళ్లీ ప్రారంభిద్దాం!'
          : 'Chat cleared. Let\'s start fresh!',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }, 100);
  };

  // Navigate to mode input page
  const navigateToModeInput = (mode: AssistantMode) => {
    setAssistantMode(mode);
    if (mode === 'health') {
      setCurrentPage('health-input');
    } else if (mode === 'farming') {
      setCurrentPage('farming-input');
    } else if (mode === 'education') {
      setCurrentPage('education-input');
    }
  };

  // Navigate directly to chat with mode
  const navigateToChat = async (mode: AssistantMode, userMessage?: string) => {
    setAssistantMode(mode);
    setMessages([]); // Clear existing messages
    
    if (userMessage) {
      setPendingUserMessage(userMessage);
    }
    
    // Navigate to mode-specific chat page
    if (mode === 'health') {
      setCurrentPage('health-chat');
    } else if (mode === 'farming') {
      setCurrentPage('farming-chat');
    } else if (mode === 'education') {
      setCurrentPage('education-chat');
    }
  };

  // Handle message submission from mode input pages
  const handleModeSubmit = (text: string, mode: AssistantMode) => {
    // Show loading transition
    setIsLoading(true);
    
    // Simulate brief loading for smooth transition
    setTimeout(() => {
      setIsLoading(false);
      navigateToChat(mode, text);
    }, 1000);
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    setAssistantMode('general');
    setMessages([]);
    setError(null);
    setPendingUserMessage('');
    setShowProfile(false);
  };

  const toggleLanguage = () => {
    setTeluguMode(!teluguMode);
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // If showing profile, render profile section
  if (showProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header with back button and logout */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setShowProfile(false)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span>← {teluguMode ? 'వెనుకకు' : 'Back'}</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors"
            >
              <LogOut size={16} />
              <span>{teluguMode ? 'లాగ్ అవుట్' : 'Logout'}</span>
            </button>
          </div>
        </header>

        <main className="px-6 py-8">
          <ProfileSection 
            userProfile={userProfile} 
            setUserProfile={setUserProfile}
            teluguMode={teluguMode} 
          />
        </main>
      </div>
    );
  }

  // Render appropriate page
  if (currentPage === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <HomePage 
          onStartChat={navigateToModeInput}
          teluguMode={teluguMode}
          onToggleLanguage={toggleLanguage}
          voiceEnabled={voiceEnabled}
          onToggleVoice={toggleVoice}
        />
        
        {/* Profile and Logout buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
          <button
            onClick={() => setShowProfile(true)}
            className="w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            title={teluguMode ? 'నా ప్రొఫైల్' : 'My Profile'}
          >
            👤
          </button>
          
          <button
            onClick={handleLogout}
            className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            title={teluguMode ? 'లాగ్ అవుట్' : 'Logout'}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (currentPage === 'health-input' || currentPage === 'farming-input' || currentPage === 'education-input') {
    return (
      <ModeInputPage
        mode={assistantMode}
        teluguMode={teluguMode}
        onToggleLanguage={toggleLanguage}
        voiceEnabled={voiceEnabled}
        onToggleVoice={toggleVoice}
        onSubmit={handleModeSubmit}
        onBackToHome={navigateToHome}
        isLoading={isLoading}
      />
    );
  }

  // Chat pages (health-chat, farming-chat, or education-chat)
  return (
    <ChatPage
      messages={messages}
      isLoading={isLoading}
      error={error}
      onSendMessage={handleSendMessage}
      onClearChat={handleClearChat}
      onBackToHome={navigateToHome}
      teluguMode={teluguMode}
      onToggleLanguage={toggleLanguage}
      voiceEnabled={voiceEnabled}
      onToggleVoice={toggleVoice}
      assistantMode={assistantMode}
    />
  );
}

export default App;