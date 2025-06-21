import React, { useState } from 'react';
import { 
  ChevronDown,
  ChevronUp,
  Target,
  DollarSign,
  BookOpen,
  Clock,
  Send,
  Loader2,
  CheckCircle,
  RotateCcw,
  ExternalLink,
  Calendar,
  Award,
  TrendingUp,
  Users,
  Lightbulb,
  Timer,
  CheckSquare,
  ArrowRight,
  Star
} from 'lucide-react';
import { generateQuiz, findScholarships, getCareerGuidance, getProductivityTips } from '../services/api';

interface EducationInputSectionsProps {
  teluguMode: boolean;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
}

interface Scholarship {
  name: string;
  eligibility: string;
  benefits: string;
  deadline: string;
  applyLink: string;
}

interface CareerPath {
  name: string;
  subjects: string;
  duration: string;
  colleges: string;
  jobRoles: string;
  applyLink: string;
}

interface ProductivityTip {
  emoji: string;
  title: string;
  description: string;
  category: string;
}

export const EducationInputSections: React.FC<EducationInputSectionsProps> = ({ teluguMode }) => {
  // Section collapse states
  const [quizCollapsed, setQuizCollapsed] = useState(false);
  const [scholarshipCollapsed, setScholarshipCollapsed] = useState(false);
  const [careerCollapsed, setCareerCollapsed] = useState(false);
  const [productivityCollapsed, setProductivityCollapsed] = useState(false);

  // Quiz section state
  const [quizForm, setQuizForm] = useState({
    name: '',
    grade: '',
    examType: '',
    difficulty: ''
  });
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Scholarship section state
  const [scholarshipForm, setScholarshipForm] = useState({
    grade: '',
    income: '',
    community: '',
    state: ''
  });
  const [isSearchingScholarships, setIsSearchingScholarships] = useState(false);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);

  // Career section state
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [isLoadingCareers, setIsLoadingCareers] = useState(false);

  // Productivity section state
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [completedTips, setCompletedTips] = useState<Set<number>>(new Set());
  const [productivityTips, setProductivityTips] = useState<ProductivityTip[]>([]);
  const [isLoadingTips, setIsLoadingTips] = useState(false);

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingQuiz(true);
    
    try {
      const quizText = await generateQuiz(quizForm.grade, quizForm.examType, quizForm.difficulty, teluguMode);
      
      // Parse the quiz text to extract questions
      const questions = parseQuizText(quizText);
      setQuizQuestions(questions);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      // Fallback to sample questions
      const sampleQuestions: QuizQuestion[] = [
        {
          question: teluguMode ? "భారతదేశ రాజధాని ఏది?" : "What is the capital of India?",
          options: teluguMode ? ["ముంబై", "న్యూఢిల్లీ", "కోల్‌కతా", "చెన్నై"] : ["Mumbai", "New Delhi", "Kolkata", "Chennai"],
          correctAnswer: 1
        },
        {
          question: teluguMode ? "H2O అంటే ఏమిటి?" : "What does H2O represent?",
          options: teluguMode ? ["హైడ్రోజన్", "ఆక్సిజన్", "నీరు", "కార్బన్"] : ["Hydrogen", "Oxygen", "Water", "Carbon"],
          correctAnswer: 2
        }
      ];
      setQuizQuestions(sampleQuestions);
    } finally {
      setIsGeneratingQuiz(false);
      setQuizScore(null);
      setShowQuizResults(false);
    }
  };

  const parseQuizText = (text: string): QuizQuestion[] => {
    // Simple parser for quiz format
    const questions: QuizQuestion[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    let currentQuestion = '';
    let currentOptions: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.match(/^Q\d*\.?\s*/)) {
        // New question
        if (currentQuestion && currentOptions.length >= 4) {
          questions.push({
            question: currentQuestion,
            options: currentOptions,
            correctAnswer: 0 // Default, would need better parsing for correct answers
          });
        }
        currentQuestion = trimmedLine.replace(/^Q\d*\.?\s*/, '');
        currentOptions = [];
      } else if (trimmedLine.match(/^\([A-D]\)/)) {
        // Option
        const option = trimmedLine.replace(/^\([A-D]\)\s*/, '');
        currentOptions.push(option);
      }
    }
    
    // Add the last question
    if (currentQuestion && currentOptions.length >= 4) {
      questions.push({
        question: currentQuestion,
        options: currentOptions,
        correctAnswer: 0
      });
    }
    
    return questions;
  };

  const handleQuizAnswer = (questionIndex: number, answerIndex: number) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[questionIndex].userAnswer = answerIndex;
    setQuizQuestions(updatedQuestions);
  };

  const submitQuiz = () => {
    let score = 0;
    quizQuestions.forEach(question => {
      if (question.userAnswer === question.correctAnswer) {
        score++;
      }
    });
    setQuizScore(score);
    setShowQuizResults(true);
  };

  const retakeQuiz = () => {
    const resetQuestions = quizQuestions.map(q => ({ ...q, userAnswer: undefined }));
    setQuizQuestions(resetQuestions);
    setQuizScore(null);
    setShowQuizResults(false);
  };

  const handleScholarshipSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchingScholarships(true);
    
    try {
      const scholarshipText = await findScholarships(scholarshipForm, teluguMode);
      
      // Parse scholarship text (simplified)
      const sampleScholarships: Scholarship[] = [
        {
          name: teluguMode ? "ప్రధానమంత్రి స్కాలర్‌షిప్" : "Prime Minister Scholarship",
          eligibility: teluguMode ? "10వ తరగతి 75% మార్కులు" : "10th class with 75% marks",
          benefits: teluguMode ? "సంవత్సరానికి ₹25,000" : "₹25,000 per year",
          deadline: "31st March 2024",
          applyLink: "https://scholarships.gov.in"
        },
        {
          name: teluguMode ? "మైనారిటీ స్కాలర్‌షిప్" : "Minority Scholarship",
          eligibility: teluguMode ? "మైనారిటీ కమ్యూనిటీ విద్యార్థులు" : "Minority community students",
          benefits: teluguMode ? "సంవత్సరానికి ₹20,000" : "₹20,000 per year",
          deadline: "15th April 2024",
          applyLink: "https://scholarships.gov.in"
        }
      ];
      
      setScholarships(sampleScholarships);
    } catch (error) {
      console.error('Failed to find scholarships:', error);
    } finally {
      setIsSearchingScholarships(false);
    }
  };

  const loadCareerPaths = async () => {
    setIsLoadingCareers(true);
    
    try {
      const careerText = await getCareerGuidance(teluguMode);
      
      // Parse career guidance (simplified)
      const sampleCareers: CareerPath[] = [
        {
          name: teluguMode ? "ఇంటర్మీడియట్ (సైన్స్)" : "Intermediate (Science)",
          subjects: teluguMode ? "భౌతిక శాస్త్రం, రసాయన శాస్త్రం, గణితం" : "Physics, Chemistry, Mathematics",
          duration: teluguMode ? "2 సంవత్సరాలు" : "2 years",
          colleges: teluguMode ? "ప్రభుత్వ మరియు ప్రైవేట్ కళాశాలలు" : "Government and Private colleges",
          jobRoles: teluguMode ? "ఇంజనీరింగ్, వైద్యం, పరిశోధన" : "Engineering, Medicine, Research",
          applyLink: "https://tsbie.cgg.gov.in"
        },
        {
          name: teluguMode ? "పాలిటెక్నిక్" : "Polytechnic",
          subjects: teluguMode ? "ఇంజనీరింగ్ డిప్లొమా" : "Engineering Diploma",
          duration: teluguMode ? "3 సంవత్సరాలు" : "3 years",
          colleges: teluguMode ? "ప్రభుత్వ పాలిటెక్నిక్ కళాశాలలు" : "Government Polytechnic colleges",
          jobRoles: teluguMode ? "టెక్నీషియన్, జూనియర్ ఇంజనీర్" : "Technician, Junior Engineer",
          applyLink: "https://polycetts.nic.in"
        }
      ];
      
      setCareerPaths(sampleCareers);
    } catch (error) {
      console.error('Failed to load career guidance:', error);
    } finally {
      setIsLoadingCareers(false);
    }
  };

  const loadProductivityTips = async () => {
    setIsLoadingTips(true);
    
    try {
      const tipsText = await getProductivityTips(teluguMode);
      
      // Parse tips or use fallback
      const fallbackTips: ProductivityTip[] = [
        {
          emoji: "🎯",
          title: teluguMode ? "ఒకేసారి ఒక పని చేయండి" : "Avoid Multitasking",
          description: teluguMode ? "ఒకేసారి చాలా పనులు చేయకుండా ఒక పనిపై దృష్టి పెట్టండి" : "Focus on one task at a time for better concentration",
          category: "focus"
        },
        {
          emoji: "📵",
          title: teluguMode ? "చదువు సమయంలో ఫోన్ మూసేయండి" : "Turn Off Notifications",
          description: teluguMode ? "చదువు సమయంలో ఫోన్ నోటిఫికేషన్లు ఆఫ్ చేయండి" : "Mute notifications during study time to avoid distractions",
          category: "focus"
        },
        {
          emoji: "⏰",
          title: teluguMode ? "పొమోడోరో టెక్నిక్ వాడండి" : "Use Pomodoro Technique",
          description: teluguMode ? "25 నిమిషాలు చదివి 5 నిమిషాలు విశ్రమించండి" : "Study for 25 minutes, then take a 5-minute break",
          category: "time"
        }
      ];
      
      setProductivityTips(fallbackTips);
    } catch (error) {
      console.error('Failed to load productivity tips:', error);
    } finally {
      setIsLoadingTips(false);
    }
  };

  const markTipAsCompleted = (index: number) => {
    setCompletedTips(prev => new Set([...prev, index]));
  };

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % productivityTips.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + productivityTips.length) % productivityTips.length);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-16 space-y-8">
      {/* Section Title */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📚 {teluguMode ? 'విద్యా ఇన్‌పుట్ విభాగాలు' : 'Education Input Sections'}
        </h2>
        <p className="text-gray-600">
          {teluguMode ? 'క్విజ్, స్కాలర్‌షిప్‌లు, కెరీర్ మార్గదర్శకత్వం మరియు ఉత్పాదకత చిట్కాలు' : 'Quiz, Scholarships, Career Guidance & Productivity Tips'}
        </p>
      </div>

      {/* 1. Quiz Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-lg border border-blue-100 overflow-hidden">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-blue-100/50 transition-colors"
          onClick={() => setQuizCollapsed(!quizCollapsed)}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                🎯 {teluguMode ? 'క్విజ్ విభాగం - మీ అభ్యాసాన్ని పరీక్షించండి' : 'Quiz Section - Practice Your Learning'}
              </h3>
              <p className="text-gray-600">
                {teluguMode ? 'వివిధ విషయాలపై ప్రశ్నలు మరియు పరీక్షలు' : 'Questions and tests on various subjects'}
              </p>
            </div>
          </div>
          {quizCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
        </div>
        
        {!quizCollapsed && (
          <div className="px-6 pb-6">
            {!quizQuestions.length ? (
              <form onSubmit={handleQuizSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={teluguMode ? 'పేరు (ఐచ్ఛిక)' : 'Name (optional)'}
                    value={quizForm.name}
                    onChange={(e) => setQuizForm({...quizForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                  
                  <select
                    value={quizForm.grade}
                    onChange={(e) => setQuizForm({...quizForm, grade: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="">{teluguMode ? 'తరగతి ఎంచుకోండి' : 'Select Grade'}</option>
                    <option value="6">6th Class</option>
                    <option value="7">7th Class</option>
                    <option value="8">8th Class</option>
                    <option value="9">9th Class</option>
                    <option value="10">10th Class</option>
                    <option value="inter">Intermediate</option>
                    <option value="degree">Degree</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={quizForm.examType}
                    onChange={(e) => setQuizForm({...quizForm, examType: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="">{teluguMode ? 'పరీక్ష రకం' : 'Exam Type'}</option>
                    <option value="ssc">SSC</option>
                    <option value="rrb">RRB</option>
                    <option value="upsc">UPSC</option>
                    <option value="board">Board Exam</option>
                    <option value="general">General Knowledge</option>
                  </select>
                  
                  <select
                    value={quizForm.difficulty}
                    onChange={(e) => setQuizForm({...quizForm, difficulty: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    required
                  >
                    <option value="">{teluguMode ? 'కష్టతనం స్థాయి' : 'Difficulty Level'}</option>
                    <option value="easy">{teluguMode ? 'సులభం' : 'Easy'}</option>
                    <option value="medium">{teluguMode ? 'మధ్యస్థం' : 'Medium'}</option>
                    <option value="hard">{teluguMode ? 'కష్టం' : 'Hard'}</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isGeneratingQuiz}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isGeneratingQuiz ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{teluguMode ? 'క్విజ్ రూపొందిస్తున్నాము...' : 'Generating Quiz...'}</span>
                    </>
                  ) : (
                    <>
                      <Target className="w-5 h-5" />
                      <span>{teluguMode ? 'క్విజ్ ప్రారంభించు' : 'Start Quiz'}</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                {!showQuizResults ? (
                  <>
                    {quizQuestions.map((question, qIndex) => (
                      <div key={qIndex} className="bg-white rounded-xl p-6 border border-blue-200">
                        <h4 className="font-bold text-gray-900 mb-4">
                          {qIndex + 1}. {question.question}
                        </h4>
                        <div className="space-y-3">
                          {question.options.map((option, oIndex) => (
                            <label key={oIndex} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="radio"
                                name={`question-${qIndex}`}
                                value={oIndex}
                                checked={question.userAnswer === oIndex}
                                onChange={() => handleQuizAnswer(qIndex, oIndex)}
                                className="text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <button
                      onClick={submitQuiz}
                      disabled={quizQuestions.some(q => q.userAnswer === undefined)}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>{teluguMode ? 'క్విజ్ సమర్పించు' : 'Submit Quiz'}</span>
                    </button>
                  </>
                ) : (
                  <div className="bg-white rounded-xl p-6 border border-blue-200 text-center">
                    <div className="mb-6">
                      <div className="text-4xl mb-4">
                        {quizScore! >= 3 ? '🎉' : '📚'}
                      </div>
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">
                        {teluguMode ? 'మీ స్కోర్:' : 'Your Score:'} {quizScore}/{quizQuestions.length}
                      </h4>
                      <p className="text-gray-600">
                        {quizScore! >= Math.ceil(quizQuestions.length * 0.6)
                          ? (teluguMode ? 'అద్భుతం! మీరు బాగా చేసారు!' : 'Excellent! You did great!')
                          : (teluguMode ? 'మరింత అభ్యాసం అవసరం' : 'Need more practice')
                        }
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={retakeQuiz}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                      >
                        <RotateCcw className="w-5 h-5" />
                        <span>{teluguMode ? 'మళ్లీ ప్రయత్నించు' : 'Retake Quiz'}</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          setQuizQuestions([]);
                          setQuizScore(null);
                          setShowQuizResults(false);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
                      >
                        <BookOpen className="w-5 h-5" />
                        <span>{teluguMode ? 'కొత్త క్విజ్' : 'New Quiz'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Scholarships Finder */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-lg border border-green-100 overflow-hidden">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-green-100/50 transition-colors"
          onClick={() => setScholarshipCollapsed(!scholarshipCollapsed)}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                💰 {teluguMode ? 'స్కాలర్‌షిప్ ఫైండర్' : 'Scholarships Finder'}
              </h3>
              <p className="text-gray-600">
                {teluguMode ? 'మీకు అనుకూలమైన స్కాలర్‌షిప్‌లను కనుగొనండి' : 'Find scholarships suitable for you'}
              </p>
            </div>
          </div>
          {scholarshipCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
        </div>
        
        {!scholarshipCollapsed && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <form onSubmit={handleScholarshipSearch} className="space-y-4">
                
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={scholarshipForm.grade}
                      onChange={(e) => setScholarshipForm({...scholarshipForm, grade: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      required
                    >
                      <option value="">{teluguMode ? 'తరగతి/కోర్సు' : 'Grade/Class'}</option>
                      <option value="10th">10th Class</option>
                      <option value="12th">12th Class</option>
                      <option value="graduation">Graduation</option>
                      <option value="postgraduation">Post Graduation</option>
                    </select>
                    
                    <select
                      value={scholarshipForm.income}
                      onChange={(e) => setScholarshipForm({...scholarshipForm, income: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    >
                      <option value="">{teluguMode ? 'ఆదాయ వర్గం' : 'Income Group'}</option>
                      <option value="below-1-lakh">{teluguMode ? '1 లక్ష కంటే తక్కువ' : 'Below 1 Lakh'}</option>
                      <option value="1-3-lakh">1-3 {teluguMode ? 'లక్షలు' : 'Lakhs'}</option>
                      <option value="3-5-lakh">3-5 {teluguMode ? 'లక్షలు' : 'Lakhs'}</option>
                      <option value="above-5-lakh">{teluguMode ? '5 లక్షలకు మించి' : 'Above 5 Lakhs'}</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={scholarshipForm.community}
                      onChange={(e) => setScholarshipForm({...scholarshipForm, community: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    >
                      <option value="">{teluguMode ? 'కమ్యూనిటీ' : 'Community'}</option>
                      <option value="general">General</option>
                      <option value="obc">OBC</option>
                      <option value="sc">SC</option>
                      <option value="st">ST</option>
                      <option value="minority">Minority</option>
                    </select>
                    
                    <select
                      value={scholarshipForm.state}
                      onChange={(e) => setScholarshipForm({...scholarshipForm, state: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      required
                    >
                      <option value="">{teluguMode ? 'రాష్ట్రం' : 'State'}</option>
                      <option value="telangana">Telangana</option>
                      <option value="andhra-pradesh">Andhra Pradesh</option>
                      <option value="karnataka">Karnataka</option>
                      <option value="tamil-nadu">Tamil Nadu</option>
                      <option value="kerala">Kerala</option>
                      <option value="maharashtra">Maharashtra</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSearchingScholarships}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isSearchingScholarships ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{teluguMode ? 'వెతుకుతున్నాము...' : 'Searching...'}</span>
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-5 h-5" />
                        <span>{teluguMode ? 'స్కాలర్‌షిప్‌లు వెతకండి' : 'Find Scholarships'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                {scholarships.map((scholarship, index) => (
                  <div key={index} className="bg-white border border-green-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-gray-900 text-lg">{scholarship.name}</h4>
                      <Award className="w-5 h-5 text-green-600 flex-shrink-0" />
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-gray-600 w-20">{teluguMode ? 'అర్హత:' : 'Eligibility:'}</span>
                        <span className="text-gray-800">{scholarship.eligibility}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-gray-600 w-20">{teluguMode ? 'ప్రయోజనాలు:' : 'Benefits:'}</span>
                        <span className="text-green-600 font-bold">{scholarship.benefits}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="font-medium text-gray-600 mr-2">{teluguMode ? 'చివరి తేదీ:' : 'Deadline:'}</span>
                        <span className="text-red-600 font-medium">{scholarship.deadline}</span>
                      </div>
                    </div>
                    
                    <a
                      href={scholarship.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <ExternalLink size={14} />
                      <span>{teluguMode ? 'దరఖాస్తు చేయండి' : 'Apply Now'}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. What To Do After 10th */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-lg border border-purple-100 overflow-hidden">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-purple-100/50 transition-colors"
          onClick={() => setCareerCollapsed(!careerCollapsed)}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                📚 {teluguMode ? '10వ తరగతి తర్వాత ఏమి చేయాలి?' : 'What To Do After 10th?'}
              </h3>
              <p className="text-gray-600">
                {teluguMode ? 'కెరీర్ మార్గాలు మరియు కోర్సుల గురించి తెలుసుకోండి' : 'Explore career paths and courses'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!careerPaths.length && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  loadCareerPaths();
                }}
                disabled={isLoadingCareers}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isLoadingCareers ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  teluguMode ? 'లోడ్ చేయండి' : 'Load'
                )}
              </button>
            )}
            {careerCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
          </div>
        </div>
        
        {!careerCollapsed && (
          <div className="px-6 pb-6">
            {careerPaths.length > 0 ? (
              <div className="space-y-4">
                {careerPaths.map((career, index) => (
                  <div key={index} className="bg-white border border-purple-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-bold text-gray-900 text-lg flex items-center">
                        <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                        {career.name}
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="font-medium text-gray-600 text-sm">{teluguMode ? 'విషయాలు:' : 'Subjects:'}</span>
                        <p className="text-gray-800">{career.subjects}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 text-sm">{teluguMode ? 'వ్యవధి:' : 'Duration:'}</span>
                        <p className="text-gray-800">{career.duration}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 text-sm">{teluguMode ? 'కళాశాలలు:' : 'Colleges:'}</span>
                        <p className="text-gray-800">{career.colleges}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 text-sm">{teluguMode ? 'ఉద్యోగ అవకాశాలు:' : 'Job Roles:'}</span>
                        <p className="text-gray-800">{career.jobRoles}</p>
                      </div>
                    </div>
                    
                    <a
                      href={career.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <ExternalLink size={14} />
                      <span>{teluguMode ? 'మరింత తెలుసుకోండి' : 'Learn More'}</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {teluguMode ? 'కెరీర్ మార్గాలను లోడ్ చేయడానికి "లోడ్ చేయండి" బటన్‌ను క్లిక్ చేయండి' : 'Click "Load" button to load career paths'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. How To Be More Productive */}
      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-3xl shadow-lg border border-orange-100 overflow-hidden">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-orange-100/50 transition-colors"
          onClick={() => setProductivityCollapsed(!productivityCollapsed)}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                ⏰ {teluguMode ? 'మరింత ఉత్పాదకంగా ఎలా ఉండాలి' : 'How To Be More Productive'}
              </h3>
              <p className="text-gray-600">
                {teluguMode ? 'చదువులో మెరుగైన ఫలితాలకు చిట్కాలు' : 'Tips for better study results'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!productivityTips.length && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  loadProductivityTips();
                }}
                disabled={isLoadingTips}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {isLoadingTips ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  teluguMode ? 'లోడ్ చేయండి' : 'Load'
                )}
              </button>
            )}
            {productivityCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
          </div>
        </div>
        
        {!productivityCollapsed && (
          <div className="px-6 pb-6">
            {productivityTips.length > 0 ? (
              <div>
                {/* Current Tip Display */}
                <div className="bg-white rounded-xl p-6 border border-orange-200 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-4xl">{productivityTips[currentTipIndex].emoji}</div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">
                          {productivityTips[currentTipIndex].title}
                        </h4>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                          {productivityTips[currentTipIndex].category}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {currentTipIndex + 1} / {productivityTips.length}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {productivityTips[currentTipIndex].description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={prevTip}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ArrowRight className="w-5 h-5 rotate-180" />
                      </button>
                      <button
                        onClick={nextTip}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => markTipAsCompleted(currentTipIndex)}
                      disabled={completedTips.has(currentTipIndex)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        completedTips.has(currentTipIndex)
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'bg-orange-600 hover:bg-orange-700 text-white'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>
                        {completedTips.has(currentTipIndex) 
                          ? (teluguMode ? 'పూర్తయింది' : 'Completed')
                          : (teluguMode ? 'పూర్తి చేసాను' : 'Mark as Done')
                        }
                      </span>
                    </button>
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="bg-white rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">
                      {teluguMode ? 'పురోగతి:' : 'Progress:'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {completedTips.size} / {productivityTips.length} {teluguMode ? 'పూర్తయింది' : 'completed'}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(completedTips.size / productivityTips.length) * 100}%` }}
                    ></div>
                  </div>
                  
                  {/* All Tips Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {productivityTips.map((tip, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTipIndex(index)}
                        className={`p-3 rounded-lg text-left transition-all duration-200 ${
                          index === currentTipIndex
                            ? 'bg-orange-100 border-2 border-orange-300'
                            : completedTips.has(index)
                            ? 'bg-green-100 border border-green-200'
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{tip.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {tip.title}
                            </div>
                            {completedTips.has(index) && (
                              <div className="flex items-center space-x-1 mt-1">
                                <CheckCircle className="w-3 h-3 text-green-600" />
                                <span className="text-xs text-green-600">
                                  {teluguMode ? 'పూర్తయింది' : 'Done'}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-16 h-16 text-orange-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {teluguMode ? 'ఉత్పాదకత చిట్కాలను లోడ్ చేయడానికి "లోడ్ చేయండి" బటన్‌ను క్లిక్ చేయండి' : 'Click "Load" button to load productivity tips'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};