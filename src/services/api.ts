// Google PaLM API service for all assistant modes
const API_KEY = 'AIzaSyDXf4W88CpdbzRW_NSmR4d5wNWU2UThJ6Y';
const PALM_API_URL = 'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText';

export interface PaLMResponse {
  candidates: {
    output: string;
  }[];
}

type AssistantMode = 'general' | 'farming' | 'health' | 'education' | 'news' | 'schemes';

const generateModePrompt = (text: string, teluguMode: boolean, mode: AssistantMode): string => {
  switch (mode) {
    case 'farming':
      return teluguMode 
        ? `మీరు భారతీయ రైతుల కోసం శిక్షణ పొందిన వాతావరణ అంచనా సహాయకుడు.

వినియోగదారు స్థానం (ఆటో-ఫెచ్ చేయబడింది) ఉపయోగించి ఇవ్వండి:
- వాతావరణ పరిస్థితి
- వర్షపాతం మరియు ఉష్ణోగ్రత
- పంట నీరు పోయడం, ఎరువులు మరియు రక్షణపై సలహా

సరళమైన, రైతు-స్నేహపూర్వక ఫార్మాట్‌లో ప్రదర్శించండి.

వినియోగదారు ప్రశ్న: ${text}`
        : `You are a weather forecasting assistant trained for Indian farmers.

Use the current user location (auto-fetched) to generate:
- Weather condition
- Rainfall and temperature
- Advice on crop watering, fertilization, and protection

Display in simple, farmer-friendly format.

User's question: ${text}`;

    case 'health':
      return teluguMode 
        ? `మీరు అత్యంత అర్హత కలిగిన భారతీయ వైద్య నిపుణుడు మరియు సర్టిఫైడ్ డైటీషియన్. మీరు ఖచ్చితమైన, ఆచరణాత్మక మరియు సాంస్కృతికంగా తగిన ఆరోగ్య సలహా అందించడానికి శిక్షణ పొందారు.

వినియోగదారు లక్షణాలను వివరించినప్పుడు లేదా వ్యాధి నివారణ గురించి అడిగినప్పుడు, నిజమైన వైద్యుడిలా స్పష్టమైన, దశల వారీ సలహా ఇవ్వండి:
- పరిస్థితిని సరళమైన పదాలలో వివరించండి
- సాధారణ లక్షణాలను జాబితా చేయండి
- సాధారణ మందులను సూచించండి (సురక్షితమైతే OTC)
- నిజమైన వైద్యుడిని ఎప్పుడు సంప్రదించాలో సిఫార్సు చేయండి
- తగిన చోట జీవనశైలి మరియు ఇంటి చికిత్సలను చేర్చండి
- పరిస్థితి తీవ్రమైతే, స్పష్టమైన హెచ్చరిక చూపించండి: ⚠️ దయచేసి వెంటనే లైసెన్స్ పొందిన వైద్య నిపుణుడిని సంప్రదించండి.

ఆహారం గురించి అడిగితే, ఆరోగ్యకరమైన భారతీయ ఆహార సలహా అందించండి:
- వినియోగదారు పరిస్థితికి సిఫార్సులను రూపొందించండి (ఉదా: మధుమేహం, BP)
- సమతుల్య భోజనం మరియు హైడ్రేషన్ చిట్కాలను సూచించండి

ఎల్లప్పుడూ స్పష్టమైన, స్నేహపూర్వక స్వరంలో దశల వారీగా వివరించండి.

వినియోగదారు ప్రశ్న: ${text}`
        : `You are a trusted Indian health care assistant. You are not a doctor, but you provide accurate, professional, and culturally sensitive medical guidance to users based on publicly available health knowledge.

If the user describes symptoms or names a disease, respond like a well-trained assistant would:
- Explain the condition in simple terms
- List common symptoms
- Suggest possible over-the-counter medicines (if safe)
- Recommend when to visit a real doctor
- Include lifestyle and home remedies where appropriate
- If the condition is serious, show a clear warning: ⚠️ Please consult a licensed medical professional immediately.

If the user asks about food, provide healthy Indian diet advice:
- Tailor recommendations to the user's condition (e.g., diabetes, BP)
- Suggest balanced meals and hydration tips

Always explain step-by-step in a clear, friendly tone.
If the user prefers Telugu, respond in Telugu.

User's question: ${text}`;

    case 'education':
      return teluguMode 
        ? `మీరు గ్రామీణ విద్యార్థులు మరియు తల్లిదండ్రులకు సహాయం చేసే విద్యా సహాయకుడు.

దీనికి సంబంధించిన ప్రశ్నలకు మద్దతు ఇవ్వండి:
- పాఠశాల విషయాలు (6-12వ తరగతి)
- ప్రభుత్వ పరీక్షలు (SSC, UPSC, RRB)
- స్కాలర్‌షిప్‌లు
- 10వ లేదా ఇంటర్ తర్వాత కెరీర్ మార్గాలు

ఎల్లప్పుడూ దశల వారీగా, స్నేహపూర్వక శైలిలో వివరించండి. వినియోగదారు తెలుగును ఇష్టపడితే తెలుగులో ఉపయోగించండి.

వినియోగదారు ప్రశ్న: ${text}`
        : `You are an education assistant helping rural students and parents.

Support queries related to:
- School subjects (6–12th class)
- Government exams (SSC, UPSC, RRB)
- Scholarships
- Career paths after 10th or Inter

Always explain in step-by-step, friendly style. Use Telugu if user prefers.

User's question: ${text}`;

    case 'news':
      return teluguMode 
        ? `మీరు వ్యవసాయ వార్తా ఏజెన్సీ.

ఇటీవలి మరియు సంబంధిత భారతీయ వ్యవసాయ వార్తలను ఇవ్వండి:
- పంట ధరలు
- ప్రభుత్వ పథకాలు
- ఎరువుల అప్‌డేట్‌లు
- మార్కెట్ అంతర్దృష్టులు

3-5 చిన్న కథనాలు క్రమం తప్పకుండా అప్‌డేట్ చేయబడతాయి. సాధారణ భాష ఉపయోగించండి.

వినియోగదారు ప్రశ్న: ${text}`
        : `You are an agriculture news agency.

Give recent and relevant Indian farming news:
- Crop pricing
- Government schemes
- Fertilizer updates
- Market insights

3–5 short articles updated regularly. Use plain language.

User's question: ${text}`;

    case 'schemes':
      return teluguMode 
        ? `మీరు ప్రభుత్వ పథకాలు మరియు ప్రయోజనాల నిపుణుడు. భారత ప్రభుత్వ మరియు రాష్ట్ర ప్రభుత్వ పథకాల గురించి వివరణాత్మక సమాచారం అందించండి. అర్హత, దరఖాస్తు ప్రక్రియ మరియు ప్రయోజనాల గురించి తెలియజేయండి.

వినియోగదారు ప్రశ్న: ${text}`
        : `You are an expert on government schemes and benefits. Provide detailed information about Indian government and state government schemes. Include eligibility criteria, application process, and benefits.

User's question: ${text}`;

    default:
      return teluguMode 
        ? `దయచేసి తెలుగు భాషలో సమాధానం ఇవ్వండి. వినియోగదారు సందేశం: ${text}`
        : `Please respond in English. User message: ${text}`;
  }
};

export const sendMessage = async (
  text: string, 
  imageBase64?: string, 
  teluguMode: boolean = false,
  assistantMode: AssistantMode = 'general'
): Promise<string> => {
  try {
    // Generate appropriate prompt based on mode
    let processedText = text;
    
    if (text.trim()) {
      processedText = generateModePrompt(text, teluguMode, assistantMode);
    }

    // Note: PaLM API doesn't support image input, so we'll handle text only
    if (imageBase64 && !text.trim()) {
      processedText = teluguMode 
        ? 'ఈ చిత్రాన్ని వివరంగా విశ్లేషించండి మరియు తెలుగులో వివరించండి.'
        : 'Please analyze this image in detail and describe what you see.';
    }

    const response = await fetch(`${PALM_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          text: processedText
        },
        temperature: 0.7,
        candidateCount: 1
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        teluguMode 
          ? `API లోపం: ${response.status} - ${response.statusText}`
          : `API Error: ${response.status} - ${response.statusText}`
      );
    }

    const data: PaLMResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error(
        teluguMode 
          ? 'AI నుండి ప్రతిస్పందన లేదు'
          : 'No response from AI'
      );
    }

    let aiResponse = data.candidates[0].output;
    
    // Add medical disclaimer for health mode
    if (assistantMode === 'health') {
      const disclaimer = teluguMode
        ? '\n\n⚠️ వైద్య నిరాకరణ: ఈ సమాచారం సాధారణ మార్గదర్శకత్వం కోసం మాత్రమే. తీవ్రమైన లక్షణాలు లేదా అత్యవసర పరిస్థితుల్లో దయచేసి వెంటనే అర్హత కలిగిన వైద్యుడిని సంప్రదించండి.'
        : '\n\n⚠️ Medical Disclaimer: This information is for general guidance only. Please consult a qualified healthcare professional immediately for serious symptoms or medical emergencies.';
      aiResponse += disclaimer;
    }
    
    return aiResponse;
    
  } catch (error) {
    console.error('PaLM API Error:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error(
      teluguMode 
        ? 'AI ప్రతిస్పందన పొందడంలో విఫలమైంది'
        : 'Failed to get AI response'
    );
  }
};

// Specialized API functions for different sections
export const generateWorkoutPlan = async (userData: any, teluguMode: boolean = false): Promise<string> => {
  const prompt = teluguMode
    ? `మీరు ప్రొఫెషనల్ ఫిట్‌నెస్ కోచ్.

వినియోగదారు డేటా (వయస్సు, లింగం, బరువు, లక్ష్య బరువు, ఎత్తు, ఫిట్‌నెస్ లక్ష్యం, కార్యాచరణ స్థాయి, పరికరాలు, అందుబాటులో ఉన్న సమయం) ఆధారంగా, వ్యక్తిగతీకరించిన, నిర్మాణాత్మక వర్కౌట్ ప్లాన్‌ను రూపొందించండి.

ప్లాన్‌ను స్పష్టంగా నిర్వహించండి:
- రోజువారీ విభజనలు (కార్డియో/స్ట్రెంత్/యోగా)
- సెషన్‌కు సమయం
- వ్యాయామ పేరు + రెప్స్/సెట్‌లు

భారతీయ శరీర రకాలు మరియు గ్రామీణ దినచర్యలకు అనుకూలంగా చేయండి. బుల్లెట్ పాయింట్లు లేదా టేబుల్ ఫార్మాట్ ఉపయోగించండి. జార్గన్ లేదు.

వినియోగదారు డేటా: ${JSON.stringify(userData)}`
    : `You are a professional fitness coach.

Based on the user's data (age, sex, weight, target weight, height, fitness goal, activity level, equipment, available time), create a personalized, structured workout plan.

Clearly organize the plan into:
- Daily splits (Cardio/Strength/Yoga)
- Time per session
- Exercise name + reps/sets

Make it suitable for Indian body types and rural routines. Use bullet points or table format. No jargon.

User data: ${JSON.stringify(userData)}`;

  try {
    const response = await fetch(`${PALM_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: { text: prompt },
        temperature: 0.7,
        candidateCount: 1
      }),
    });

    const data: PaLMResponse = await response.json();
    return data.candidates[0]?.output || 'Failed to generate workout plan';
  } catch (error) {
    console.error('Workout plan generation error:', error);
    return teluguMode ? 'వర్కౌట్ ప్లాన్ రూపొందించడంలో విఫలమైంది' : 'Failed to generate workout plan';
  }
};

export const analyzeNutrition = async (foodItem: string, quantity: string, teluguMode: boolean = false): Promise<string> => {
  const prompt = teluguMode
    ? `మీరు సర్టిఫైడ్ భారతీయ డైటీషియన్.

వినియోగదారు ఆహార పదార్థాలు మరియు వాటి పరిమాణాన్ని అందిస్తారు. దీనిని ఇవ్వడానికి ఉపయోగించండి:
- మొత్తం కేలరీలు
- మాక్రోన్యూట్రియెంట్స్ (ప్రోటీన్, కార్బ్స్, కొవ్వు)
- మైక్రోన్యూట్రియెంట్స్ (కాల్షియం, ఐరన్, ఫైబర్)
- ఫుడ్ హెల్త్ ట్యాగ్‌లు (ఉదా: హై షుగర్, లో ఫ్యాట్)

భారతీయ ఆహార అవగాహనను ఉపయోగించండి. బుల్లెట్ పాయింట్లు లేదా చార్ట్‌లో విభజనను చూపించండి.

ఆహార పదార్థం: ${foodItem}
పరిమాణం: ${quantity}`
    : `You are a certified Indian dietician.

The user provides food items and their quantity. Use this to give:
- Total Calories
- Macronutrients (Protein, Carbs, Fat)
- Micronutrients (Calcium, Iron, Fiber)
- Food Health Tags (e.g., High Sugar, Low Fat)

Use Indian food understanding. Show breakdown in bullet points or chart.

Food item: ${foodItem}
Quantity: ${quantity}`;

  try {
    const response = await fetch(`${PALM_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: { text: prompt },
        temperature: 0.7,
        candidateCount: 1
      }),
    });

    const data: PaLMResponse = await response.json();
    return data.candidates[0]?.output || 'Failed to analyze nutrition';
  } catch (error) {
    console.error('Nutrition analysis error:', error);
    return teluguMode ? 'పోషకాహార విశ్లేషణ విఫలమైంది' : 'Failed to analyze nutrition';
  }
};

export const generateQuiz = async (grade: string, examType: string, difficulty: string, teluguMode: boolean = false): Promise<string> => {
  const prompt = teluguMode
    ? `మీరు క్విజ్ జనరేటర్.

వినియోగదారు అందిస్తారు:
- గ్రేడ్/క్లాస్: ${grade}
- పరీక్ష రకం: ${examType}
- కష్టతనం: ${difficulty}

5 MCQలను రూపొందించండి:
- ప్రతి అంశానికి 1 ప్రశ్న
- 4 ఎంపికలు
- సరైన సమాధానాన్ని చేర్చండి

ఇలా తిరిగి ఇవ్వండి:
Q. …
(A) … (B) … (C) … (D) …

ప్రశ్నలను సిలబస్ ఆధారితంగా మరియు గ్రామీణ అభ్యాసకులకు అనుకూలంగా ఉంచండి.`
    : `You are a quiz generator.

User provides:
- Grade/Class: ${grade}
- Exam Type: ${examType}
- Difficulty: ${difficulty}

Create 5 MCQs:
- 1 question per topic
- 4 options
- Include correct answer

Return as:
Q. …
(A) … (B) … (C) … (D) …

Keep questions syllabus-based and suitable for rural learners.`;

  try {
    const response = await fetch(`${PALM_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: { text: prompt },
        temperature: 0.7,
        candidateCount: 1
      }),
    });

    const data: PaLMResponse = await response.json();
    return data.candidates[0]?.output || 'Failed to generate quiz';
  } catch (error) {
    console.error('Quiz generation error:', error);
    return teluguMode ? 'క్విజ్ రూపొందించడంలో విఫలమైంది' : 'Failed to generate quiz';
  }
};

export const findScholarships = async (studentInfo: any, teluguMode: boolean = false): Promise<string> => {
  const prompt = teluguMode
    ? `మీరు స్కాలర్‌షిప్ సలహాదారు.

విద్యార్థి సమాచారాన్ని ఉపయోగించండి:
- గ్రేడ్/క్లాస్: ${studentInfo.grade}
- కుల/కమ్యూనిటీ: ${studentInfo.community || 'పేర్కొనలేదు'}
- ఆదాయ వర్గం: ${studentInfo.income}
- స్థానం/రాష్ట్రం: ${studentInfo.state}

భారతదేశంలో అందుబాటులో ఉన్న స్కాలర్‌షిప్‌లను జాబితా చేయండి:
- పేరు
- అర్హత
- మొత్తం
- చివరి తేదీ
- దరఖాస్తు లింక్`
    : `You are a scholarship advisor.

Use student info:
- Grade/Class: ${studentInfo.grade}
- Caste/Community: ${studentInfo.community || 'Not specified'}
- Income Group: ${studentInfo.income}
- Location/State: ${studentInfo.state}

List scholarships available in India with:
- Name
- Eligibility
- Amount
- Deadline
- Apply link`;

  try {
    const response = await fetch(`${PALM_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: { text: prompt },
        temperature: 0.7,
        candidateCount: 1
      }),
    });

    const data: PaLMResponse = await response.json();
    return data.candidates[0]?.output || 'Failed to find scholarships';
  } catch (error) {
    console.error('Scholarship search error:', error);
    return teluguMode ? 'స్కాలర్‌షిప్‌లు కనుగొనడంలో విఫలమైంది' : 'Failed to find scholarships';
  }
};

export const getCareerGuidance = async (teluguMode: boolean = false): Promise<string> => {
  const prompt = teluguMode
    ? `మీరు భారతదేశంలో 10వ తరగతి తర్వాత విద్యార్థుల కోసం కెరీర్ సలహాదారు.

ఇలాంటి అన్ని సాధ్యమైన మార్గాలను చూపించండి:
- ఇంటర్మీడియట్ (సైన్స్/కామర్స్)
- ITI, డిప్లొమా
- పాలిటెక్నిక్
- పోటీ పరీక్షలు
- వృత్తిపరమైన కోర్సులు

ఇవ్వండి: కోర్సు వ్యవధి, ప్రవేశం, ఉద్యోగ ఎంపికలు మరియు కళాశాలలు.`
    : `You are a career advisor for students after 10th class in India.

Show all possible paths like:
- Intermediate (Science/Commerce)
- ITI, Diploma
- Polytechnic
- Competitive exams
- Vocational courses

Give: Course duration, entrance, job options, and colleges.`;

  try {
    const response = await fetch(`${PALM_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: { text: prompt },
        temperature: 0.7,
        candidateCount: 1
      }),
    });

    const data: PaLMResponse = await response.json();
    return data.candidates[0]?.output || 'Failed to get career guidance';
  } catch (error) {
    console.error('Career guidance error:', error);
    return teluguMode ? 'కెరీర్ మార్గదర్శకత్వం పొందడంలో విఫలమైంది' : 'Failed to get career guidance';
  }
};

export const getProductivityTips = async (teluguMode: boolean = false): Promise<string> => {
  const prompt = teluguMode
    ? `మీరు విద్యార్థుల కోసం ఉత్పాదకత మెంటర్.

ఇవ్వండి:
- దృష్టి మరల్చకుండా ఉండే చిట్కాలు
- పొమోడోరో మరియు 80/20 పద్ధతులు
- టాప్ 3 అధ్యయన టైమ్‌టేబుల్‌లు
- ఉదయం/సాయంత్రం దినచర్యలు

దీన్ని దృశ్యమానంగా, చిన్నగా మరియు ప్రేరణాదాయకంగా చేయండి.`
    : `You are a productivity mentor for students.

Give:
- Tips to avoid distraction
- Pomodoro and 80/20 methods
- Top 3 study timetables
- Morning/evening routines

Make it visual, short, and motivating.`;

  try {
    const response = await fetch(`${PALM_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: { text: prompt },
        temperature: 0.7,
        candidateCount: 1
      }),
    });

    const data: PaLMResponse = await response.json();
    return data.candidates[0]?.output || 'Failed to get productivity tips';
  } catch (error) {
    console.error('Productivity tips error:', error);
    return teluguMode ? 'ఉత్పాదకత చిట్కాలు పొందడంలో విఫలమైంది' : 'Failed to get productivity tips';
  }
};