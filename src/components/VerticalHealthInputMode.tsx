import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Stethoscope,
  AlertTriangle,
  Brain,
  Send,
  Loader2,
  User,
  Calendar,
  Target,
  Activity,
  Clock,
  Utensils,
  Heart,
  Zap,
  Shield,
  Droplets,
  Apple,
  Moon,
  Flame,
  MapPin,
  Phone,
  Star,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Upload,
  X
} from 'lucide-react';
import { generateWorkoutPlan, analyzeNutrition } from '../services/api';

interface VerticalHealthInputModeProps {
  teluguMode: boolean;
}

interface ExerciseFormData {
  fullName: string;
  age: string;
  biologicalSex: string;
  currentWeight: string;
  targetWeight: string;
  height: string;
  medicalIssues: string;
  allergies: string;
  fitnessGoal: string;
  timeframe: string;
  dailyRoutine: string;
  postureIssues: string[];
  activityLevel: string;
  foodPreference: string;
  culturalRestrictions: string;
  workoutTime: string;
  equipment: string[];
}

interface Hospital {
  name: string;
  address: string;
  rating: number;
  distance: string;
  phone: string;
}

interface FirstAidSlide {
  title: string;
  emoji: string;
  instructions: string[];
}

interface HealthFlashCard {
  emoji: string;
  title: string;
  description: string;
  category: string;
}

interface EmergencyCondition {
  emoji: string;
  title: string;
  instructions: string[];
}

export const VerticalHealthInputMode: React.FC<VerticalHealthInputModeProps> = ({ teluguMode }) => {
  // Section collapse states
  const [exerciseCollapsed, setExerciseCollapsed] = useState(false);
  const [doctorCollapsed, setDoctorCollapsed] = useState(false);
  const [emergencyCollapsed, setEmergencyCollapsed] = useState(false);
  const [nutritionCollapsed, setNutritionCollapsed] = useState(false);
  const [flashCardsCollapsed, setFlashCardsCollapsed] = useState(false);

  // Exercise form state
  const [exerciseForm, setExerciseForm] = useState<ExerciseFormData>({
    fullName: '',
    age: '',
    biologicalSex: '',
    currentWeight: '',
    targetWeight: '',
    height: '',
    medicalIssues: '',
    allergies: '',
    fitnessGoal: '',
    timeframe: '',
    dailyRoutine: '',
    postureIssues: [],
    activityLevel: '',
    foodPreference: '',
    culturalRestrictions: '',
    workoutTime: '',
    equipment: []
  });
  
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false);
  const [workoutPlan, setWorkoutPlan] = useState<string | null>(null);
  
  // Doctor assist state
  const [symptoms, setSymptoms] = useState('');
  const [isSearchingHospitals, setIsSearchingHospitals] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  
  // Emergency state
  const [showEmergencyGrid, setShowEmergencyGrid] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyCondition | null>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  
  // Nutrition state
  const [foodItem, setFoodItem] = useState('');
  const [portionSize, setPortionSize] = useState('');
  const [nutritionInfo, setNutritionInfo] = useState<string | null>(null);
  const [isAnalyzingNutrition, setIsAnalyzingNutrition] = useState(false);
  
  // Flash cards state
  const [currentFlashCard, setCurrentFlashCard] = useState(0);
  const [isFlashCardAutoScroll, setIsFlashCardAutoScroll] = useState(true);

  // Emergency conditions data
  const emergencyConditions: EmergencyCondition[] = [
    {
      emoji: "🐍",
      title: "Snake Bite",
      instructions: [
        "Tie a cloth above the bite (not tight)",
        "Keep the person still",
        "Do NOT suck or cut the wound",
        "Go to hospital immediately"
      ]
    },
    {
      emoji: "❤️",
      title: "Heart Attack",
      instructions: [
        "Chest pain, sweating symptoms",
        "Make person rest immediately",
        "Give aspirin if available",
        "Loosen clothes",
        "Reach hospital within 1 hour"
      ]
    },
    {
      emoji: "🧠",
      title: "Stroke",
      instructions: [
        "Face drooping, slurred speech",
        "Lay person on their side",
        "Don't give food or water",
        "Reach hospital within 3 hours"
      ]
    },
    {
      emoji: "⚡",
      title: "Seizure / Fit",
      instructions: [
        "Person shaking, foam in mouth",
        "Turn to side position",
        "Remove sharp objects nearby",
        "Don't put anything in mouth",
        "Go to hospital after seizure stops"
      ]
    },
    {
      emoji: "🔌",
      title: "Electric Shock",
      instructions: [
        "Switch off power source first",
        "Separate person with wooden stick",
        "Give CPR if needed",
        "Go to hospital immediately"
      ]
    },
    {
      emoji: "🌬️",
      title: "Asthma Attack",
      instructions: [
        "Difficulty breathing symptoms",
        "Help person sit upright",
        "Use inhaler if available",
        "Loosen tight clothes",
        "Go to hospital if no relief"
      ]
    },
    {
      emoji: "🔥",
      title: "Burn",
      instructions: [
        "Wash with cold water for 10 minutes",
        "Don't apply oil or toothpaste",
        "Cover with clean cloth",
        "Go to hospital for severe burns"
      ]
    },
    {
      emoji: "🌊",
      title: "Drowning",
      instructions: [
        "Remove wet clothes",
        "Clear airway of water",
        "Give CPR if unconscious",
        "Go to hospital even if conscious"
      ]
    },
    {
      emoji: "☠️",
      title: "Poisoning",
      instructions: [
        "Don't give food or milk",
        "Take the poison container along",
        "Go to hospital immediately",
        "Call poison control if available"
      ]
    },
    {
      emoji: "🐕",
      title: "Dog Bite",
      instructions: [
        "Wash wound with soap and water",
        "Don't tie the wound tightly",
        "Get anti-rabies injection within 24 hours",
        "Consult doctor immediately"
      ]
    },
    {
      emoji: "🤒",
      title: "High Fever",
      instructions: [
        "Apply wet cloth to cool body",
        "Give paracetamol as per age",
        "Provide plenty of fluids",
        "See doctor if fever persists >2 days"
      ]
    },
    {
      emoji: "💦",
      title: "Severe Diarrhea",
      instructions: [
        "Give ORS after each loose motion",
        "Provide plenty of fluids",
        "Avoid spicy food",
        "See doctor if continues >1 day"
      ]
    },
    {
      emoji: "🤮",
      title: "Continuous Vomiting",
      instructions: [
        "Give small sips of water/ORS",
        "No heavy food",
        "Let person rest",
        "Go to doctor if vomiting continues"
      ]
    },
    {
      emoji: "🦴",
      title: "Bone Fracture",
      instructions: [
        "Don't move the injured limb",
        "Make splint with stick and cloth",
        "Support the injured area",
        "Go to hospital immediately"
      ]
    },
    {
      emoji: "👃",
      title: "Nose Bleeding",
      instructions: [
        "Lean head forward",
        "Pinch nose for 10 minutes",
        "Apply cold cloth on head",
        "See doctor if bleeding continues"
      ]
    },
    {
      emoji: "👁️",
      title: "Eye Injury",
      instructions: [
        "Don't rub the injured eye",
        "Rinse with clean water",
        "Cover eye with clean cloth",
        "Visit eye doctor immediately"
      ]
    },
    {
      emoji: "😵",
      title: "Fainting",
      instructions: [
        "Lay person down flat",
        "Raise legs slightly",
        "Loosen tight clothes",
        "Sprinkle water on face",
        "See doctor if not awake in 2 minutes"
      ]
    },
    {
      emoji: "🩸",
      title: "Heavy Bleeding",
      instructions: [
        "Press wound with clean cloth",
        "Tie cloth above wound if on limb",
        "Keep injured area raised",
        "Go to hospital immediately"
      ]
    },
    {
      emoji: "🌞",
      title: "Heat Stroke",
      instructions: [
        "Move person to shade",
        "Apply wet cloth on body",
        "Give fluids if conscious",
        "Go to hospital if not better"
      ]
    },
    {
      emoji: "😰",
      title: "Food Choking",
      instructions: [
        "Bend person forward",
        "Hit back firmly 5 times",
        "Use Heimlich maneuver if trained",
        "Rush to clinic immediately"
      ]
    }
  ];

  // Health flash cards data
  const healthFlashCards: HealthFlashCard[] = [
    { emoji: "💧", title: "Drink Water", description: "8 glasses daily for better health", category: "hydration" },
    { emoji: "🚶", title: "Daily Walk", description: "30 minutes walking improves heart health", category: "exercise" },
    { emoji: "🥗", title: "Eat Vegetables", description: "5 servings of fruits & vegetables daily", category: "nutrition" },
    { emoji: "😴", title: "Good Sleep", description: "7-8 hours sleep for body recovery", category: "rest" },
    { emoji: "🧘", title: "Reduce Stress", description: "Meditation helps mental wellness", category: "mental" },
    { emoji: "🦷", title: "Brush Teeth", description: "Twice daily prevents dental problems", category: "hygiene" },
    { emoji: "🌞", title: "Vitamin D", description: "15 minutes sunlight for strong bones", category: "vitamins" },
    { emoji: "🚭", title: "No Smoking", description: "Quit smoking for healthy lungs", category: "habits" },
    { emoji: "🍎", title: "Healthy Snacks", description: "Choose fruits over processed foods", category: "nutrition" },
    { emoji: "💪", title: "Stay Active", description: "Regular exercise boosts immunity", category: "exercise" },
    { emoji: "🧴", title: "Hand Hygiene", description: "Wash hands frequently to prevent illness", category: "hygiene" },
    { emoji: "📱", title: "Screen Time", description: "Limit screen time for better sleep", category: "habits" },
    { emoji: "🫁", title: "Deep Breathing", description: "Practice breathing exercises daily", category: "mental" },
    { emoji: "🥛", title: "Calcium Rich", description: "Milk and dairy for strong bones", category: "nutrition" },
    { emoji: "⚖️", title: "Healthy Weight", description: "Maintain BMI between 18.5-24.9", category: "fitness" }
  ];

  // Auto-scroll flash cards
  useEffect(() => {
    if (isFlashCardAutoScroll) {
      const interval = setInterval(() => {
        setCurrentFlashCard(prev => (prev + 1) % healthFlashCards.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isFlashCardAutoScroll, healthFlashCards.length]);

  const handleExerciseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingWorkout(true);
    
    try {
      const plan = await generateWorkoutPlan(exerciseForm, teluguMode);
      setWorkoutPlan(plan);
    } catch (error) {
      console.error('Failed to generate workout plan:', error);
      setWorkoutPlan(teluguMode ? 'వర్కౌట్ ప్లాన్ రూపొందించడంలో విఫలమైంది' : 'Failed to generate workout plan');
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  const handleFindHospitals = async () => {
    setIsSearchingHospitals(true);
    
    // Simulate hospital search
    setTimeout(() => {
      setHospitals([
        {
          name: "Apollo Hospital",
          address: "Jubilee Hills, Hyderabad",
          rating: 4.8,
          distance: "2.3 km",
          phone: "+91-40-23607777"
        },
        {
          name: "KIMS Hospital",
          address: "Kondapur, Hyderabad", 
          rating: 4.6,
          distance: "3.1 km",
          phone: "+91-40-44885555"
        },
        {
          name: "Care Hospital",
          address: "Banjara Hills, Hyderabad",
          rating: 4.7,
          distance: "4.2 km", 
          phone: "+91-40-61165000"
        }
      ]);
      setIsSearchingHospitals(false);
    }, 2000);
  };

  const handleNutritionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzingNutrition(true);
    
    try {
      const analysis = await analyzeNutrition(foodItem, portionSize, teluguMode);
      setNutritionInfo(analysis);
    } catch (error) {
      console.error('Failed to analyze nutrition:', error);
      setNutritionInfo(teluguMode ? 'పోషకాహార విశ్లేషణ విఫలమైంది' : 'Failed to analyze nutrition');
    } finally {
      setIsAnalyzingNutrition(false);
    }
  };

  const handleEmergencySelect = (condition: EmergencyCondition) => {
    setSelectedEmergency(condition);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-16 space-y-8">
      {/* Section Title */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🏥 {teluguMode ? 'ఆరోగ్య ఇన్‌పుట్ మోడ్' : 'Health Input Mode'}
        </h2>
        <p className="text-gray-600">
          {teluguMode ? 'వ్యాయామం, వైద్యులు మరియు అత్యవసర సహాయం' : 'Exercise, Doctors & Emergency Help'}
        </p>
      </div>

      {/* 1. Exercise Assistant Section */}
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-3xl shadow-lg border border-pink-100 overflow-hidden">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-pink-100/50 transition-colors"
          onClick={() => setExerciseCollapsed(!exerciseCollapsed)}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                🏋️ {teluguMode ? 'వ్యాయామ సహాయకుడు' : 'Exercise Assistant'}
              </h3>
              <p className="text-gray-600">
                {teluguMode ? 'వ్యక్తిగతీకరించిన వర్కౌట్ ప్లాన్ పొందండి' : 'Get personalized workout plan'}
              </p>
            </div>
          </div>
          {exerciseCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
        </div>
        
        {!exerciseCollapsed && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Exercise Form */}
              <div className="space-y-4">
                <form onSubmit={handleExerciseSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder={teluguMode ? 'పూర్తి పేరు (ఐచ్ఛిక)' : 'Full Name (optional)'}
                        value={exerciseForm.fullName}
                        onChange={(e) => setExerciseForm({...exerciseForm, fullName: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        placeholder={teluguMode ? 'వయస్సు' : 'Age'}
                        value={exerciseForm.age}
                        onChange={(e) => setExerciseForm({...exerciseForm, age: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {teluguMode ? 'లింగం' : 'Biological Sex'}
                    </label>
                    <div className="flex space-x-4">
                      {['Male', 'Female', 'Other'].map((sex) => (
                        <label key={sex} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="biologicalSex"
                            value={sex}
                            checked={exerciseForm.biologicalSex === sex}
                            onChange={(e) => setExerciseForm({...exerciseForm, biologicalSex: e.target.value})}
                            className="text-pink-600 focus:ring-pink-500"
                          />
                          <span className="text-sm text-gray-700">{sex}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="relative">
                      <Activity className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        placeholder={teluguMode ? 'ప్రస్తుత బరువు (kg)' : 'Current Weight (kg)'}
                        value={exerciseForm.currentWeight}
                        onChange={(e) => setExerciseForm({...exerciseForm, currentWeight: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                      />
                    </div>
                    <div className="relative">
                      <Target className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        placeholder={teluguMode ? 'లక్ష్య బరువు (kg)' : 'Target Weight (kg)'}
                        value={exerciseForm.targetWeight}
                        onChange={(e) => setExerciseForm({...exerciseForm, targetWeight: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                      />
                    </div>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        placeholder={teluguMode ? 'ఎత్తు (cm)' : 'Height (cm)'}
                        value={exerciseForm.height}
                        onChange={(e) => setExerciseForm({...exerciseForm, height: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={exerciseForm.fitnessGoal}
                      onChange={(e) => setExerciseForm({...exerciseForm, fitnessGoal: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                    >
                      <option value="">{teluguMode ? 'ఫిట్‌నెస్ లక్ష్యం' : 'Fitness Goal'}</option>
                      <option value="weight-loss">{teluguMode ? 'బరువు తగ్గింపు' : 'Weight Loss'}</option>
                      <option value="muscle-gain">{teluguMode ? 'కండరాల పెరుగుదల' : 'Muscle Gain'}</option>
                      <option value="general-fitness">{teluguMode ? 'సాధారణ ఫిట్‌నెస్' : 'General Fitness'}</option>
                    </select>
                    
                    <select
                      value={exerciseForm.activityLevel}
                      onChange={(e) => setExerciseForm({...exerciseForm, activityLevel: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                    >
                      <option value="">{teluguMode ? 'కార్యాచరణ స్థాయి' : 'Activity Level'}</option>
                      <option value="sedentary">{teluguMode ? 'నిష్క్రియ' : 'Sedentary'}</option>
                      <option value="moderate">{teluguMode ? 'మధ్యస్థ' : 'Moderate'}</option>
                      <option value="active">{teluguMode ? 'చురుకైన' : 'Active'}</option>
                    </select>
                  </div>

                  <textarea
                    placeholder={teluguMode ? 'వైద్య సమస్యలు (ఏవైనా ఉంటే)' : 'Medical Issues (if any)'}
                    value={exerciseForm.medicalIssues}
                    onChange={(e) => setExerciseForm({...exerciseForm, medicalIssues: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                    rows={3}
                  />

                  <button
                    type="submit"
                    disabled={isGeneratingWorkout}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isGeneratingWorkout ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{teluguMode ? 'రూపొందిస్తున్నాము...' : 'Generating...'}</span>
                      </>
                    ) : (
                      <>
                        <Target className="w-5 h-5" />
                        <span>{teluguMode ? 'వర్కౌట్ ప్లాన్ రూపొందించు' : 'Generate Workout Plan'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Workout Plan Display */}
              <div>
                {workoutPlan && (
                  <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-6 border border-pink-200">
                    <h4 className="font-bold text-pink-800 mb-4 flex items-center">
                      <Dumbbell className="w-5 h-5 mr-2" />
                      {teluguMode ? 'మీ వ్యాయామ ప్రణాళిక' : 'Your Workout Plan'}
                    </h4>
                    <div className="text-sm text-pink-700 whitespace-pre-wrap leading-relaxed">
                      {workoutPlan}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Doctor Nearby Finder Section */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl shadow-lg border border-blue-100 overflow-hidden">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-blue-100/50 transition-colors"
          onClick={() => setDoctorCollapsed(!doctorCollapsed)}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                👨‍⚕️ {teluguMode ? 'వైద్య సహాయం' : 'Doctor Nearby Finder'}
              </h3>
              <p className="text-gray-600">
                {teluguMode ? 'సమీప ఆసుపత్రులను కనుగొనండి' : 'Find nearby hospitals'}
              </p>
            </div>
          </div>
          {doctorCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
        </div>
        
        {!doctorCollapsed && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <textarea
                  placeholder={teluguMode ? 'మీరు అనుభవిస్తున్న లక్షణాలు లేదా ఆరోగ్య సమస్యలు ఏమిటి?' : 'What symptoms or health issues are you experiencing?'}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  rows={4}
                />
                
                <button
                  onClick={handleFindHospitals}
                  disabled={isSearchingHospitals || !symptoms.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isSearchingHospitals ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{teluguMode ? 'వెతుకుతున్నాము...' : 'Searching...'}</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5" />
                      <span>{teluguMode ? 'సమీప ఆసుపత్రులను కనుగొనండి' : 'Find Nearby Hospitals'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-4">
                {hospitals.map((hospital, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{hospital.name}</h4>
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star size={16} fill="currentColor" />
                        <span className="text-sm font-medium text-gray-700">{hospital.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{hospital.address}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-600 font-medium">📍 {hospital.distance}</span>
                      <a
                        href={`tel:${hospital.phone}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                      >
                        <Phone size={14} />
                        <span>{teluguMode ? 'కాల్' : 'Call'}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Emergency First Aid Center */}
      <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl shadow-lg border border-red-100 overflow-hidden">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-red-100/50 transition-colors"
          onClick={() => setEmergencyCollapsed(!emergencyCollapsed)}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                🚨 {teluguMode ? 'అత్యవసర ప్రథమ చికిత్స' : 'Emergency First Aid Center'}
              </h3>
              <p className="text-gray-600">
                {teluguMode ? '20 అత్యవసర పరిస్థితుల సహాయం' : '20 emergency conditions help'}
              </p>
            </div>
          </div>
          {emergencyCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
        </div>
        
        {!emergencyCollapsed && (
          <div className="px-6 pb-6">
            {!showEmergencyGrid && !selectedEmergency && (
              <div className="text-center">
                <button
                  onClick={() => setShowEmergencyGrid(true)}
                  className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-bold py-6 px-12 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse"
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-8 h-8" />
                    <span className="text-xl">
                      {teluguMode ? '🚨 అత్యవసర సహాయం' : '🚨 EMERGENCY HELP'}
                    </span>
                  </div>
                </button>
              </div>
            )}

            {showEmergencyGrid && !selectedEmergency && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg font-bold text-red-800">
                    {teluguMode ? 'అత్యవసర పరిస్థితిని ఎంచుకోండి:' : 'Select Emergency Condition:'}
                  </h4>
                  <button
                    onClick={() => setShowEmergencyGrid(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {emergencyConditions.map((condition, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmergencySelect(condition)}
                      className="bg-white hover:bg-red-50 border border-red-200 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md hover:scale-105"
                    >
                      <div className="text-3xl mb-2">{condition.emoji}</div>
                      <div className="text-sm font-medium text-gray-900">{condition.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedEmergency && (
              <div className="bg-white rounded-xl p-6 border border-red-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl">{selectedEmergency.emoji}</div>
                    <h4 className="text-xl font-bold text-red-800">{selectedEmergency.title}</h4>
                  </div>
                  <button
                    onClick={() => setSelectedEmergency(null)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedEmergency.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-red-800 font-medium">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Food Nutrition Checker */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-lg border border-green-100 overflow-hidden">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-green-100/50 transition-colors"
          onClick={() => setNutritionCollapsed(!nutritionCollapsed)}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Apple className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                🍱 {teluguMode ? 'ఆహార పోషకాహార తనిఖీ' : 'Food Nutrition Checker'}
              </h3>
              <p className="text-gray-600">
                {teluguMode ? 'కేలరీలు మరియు పోషకాలను తనిఖీ చేయండి' : 'Check calories and nutrients'}
              </p>
            </div>
          </div>
          {nutritionCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
        </div>
        
        {!nutritionCollapsed && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <form onSubmit={handleNutritionSubmit} className="space-y-4">
                  <div className="relative">
                    <Utensils className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={teluguMode ? 'ఆహార పదార్థం (ఉదా: 2 రోటీలు మరియు దాల్)' : 'Food Item (e.g., 2 rotis and dal)'}
                      value={foodItem}
                      onChange={(e) => setFoodItem(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    />
                  </div>
                  
                  <div className="relative">
                    <Activity className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder={teluguMode ? 'భాగం పరిమాణం లేదా పరిమాణం' : 'Portion Size or Quantity'}
                      value={portionSize}
                      onChange={(e) => setPortionSize(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAnalyzingNutrition || !foodItem.trim()}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isAnalyzingNutrition ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{teluguMode ? 'విశ్లేషిస్తున్నాము...' : 'Analyzing...'}</span>
                      </>
                    ) : (
                      <>
                        <Apple className="w-5 h-5" />
                        <span>{teluguMode ? 'పోషకాహార విశ్లేషణ' : 'Analyze Nutrition'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div>
                {nutritionInfo && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <h4 className="font-bold text-green-800 mb-4 flex items-center">
                      <Apple className="w-5 h-5 mr-2" />
                      {teluguMode ? 'పోషకాహార విశ్లేషణ' : 'Nutrition Analysis'}
                    </h4>
                    <div className="text-sm text-green-700 whitespace-pre-wrap leading-relaxed">
                      {nutritionInfo}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Health Flash Cards */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl shadow-lg border border-purple-100 overflow-hidden">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-purple-100/50 transition-colors"
          onClick={() => setFlashCardsCollapsed(!flashCardsCollapsed)}
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                💡 {teluguMode ? 'ఆరోగ్య ఫ్లాష్ కార్డులు' : 'Health Flash Cards'}
              </h3>
              <p className="text-gray-600">
                {teluguMode ? 'రోజువారీ ఆరోగ్య చిట్కాలు' : 'Daily health tips'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFlashCardAutoScroll(!isFlashCardAutoScroll);
              }}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isFlashCardAutoScroll ? <Pause size={16} /> : <Play size={16} />}
            </button>
            {flashCardsCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
          </div>
        </div>
        
        {!flashCardsCollapsed && (
          <div className="px-6 pb-6">
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {healthFlashCards.map((card, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 w-64 bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-all duration-300 ${
                    index === currentFlashCard ? 'ring-2 ring-purple-500 scale-105' : 'border-gray-200'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-4">{card.emoji}</div>
                    <h4 className="font-bold text-gray-900 mb-3">{card.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{card.description}</p>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      card.category === 'nutrition' ? 'bg-green-100 text-green-800' :
                      card.category === 'exercise' ? 'bg-blue-100 text-blue-800' :
                      card.category === 'mental' ? 'bg-purple-100 text-purple-800' :
                      card.category === 'hygiene' ? 'bg-cyan-100 text-cyan-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {card.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};