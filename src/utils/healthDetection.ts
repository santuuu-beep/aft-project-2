// Health-related keyword detection and medical prompt generation

export interface HealthKeywords {
  symptoms: string[];
  medical: string[];
  body: string[];
  conditions: string[];
  treatments: string[];
  general: string[];
}

// Comprehensive health-related keywords for detection
const healthKeywords: HealthKeywords = {
  symptoms: [
    'fever', 'headache', 'pain', 'ache', 'hurt', 'sore', 'swollen', 'swelling',
    'cough', 'cold', 'flu', 'nausea', 'vomit', 'diarrhea', 'constipation',
    'dizzy', 'tired', 'fatigue', 'weakness', 'breathless', 'shortness of breath',
    'chest pain', 'stomach pain', 'back pain', 'joint pain', 'muscle pain',
    'rash', 'itchy', 'burning', 'tingling', 'numbness', 'bleeding', 'bruise',
    'infection', 'inflammation', 'discharge', 'lump', 'bump', 'growth'
  ],
  medical: [
    'doctor', 'physician', 'medical', 'medicine', 'medication', 'drug', 'pill',
    'tablet', 'capsule', 'injection', 'vaccine', 'treatment', 'therapy',
    'surgery', 'operation', 'procedure', 'diagnosis', 'test', 'examination',
    'prescription', 'dosage', 'side effect', 'allergy', 'allergic'
  ],
  body: [
    'heart', 'lung', 'liver', 'kidney', 'brain', 'stomach', 'intestine',
    'blood', 'pressure', 'bp', 'pulse', 'temperature', 'weight', 'height',
    'skin', 'eye', 'ear', 'nose', 'throat', 'mouth', 'tooth', 'teeth',
    'bone', 'muscle', 'joint', 'nerve', 'organ'
  ],
  conditions: [
    'diabetes', 'hypertension', 'asthma', 'cancer', 'tumor', 'covid', 'corona',
    'dengue', 'malaria', 'typhoid', 'pneumonia', 'bronchitis', 'arthritis',
    'migraine', 'depression', 'anxiety', 'stress', 'insomnia', 'obesity',
    'anemia', 'thyroid', 'cholesterol', 'stroke', 'attack', 'seizure'
  ],
  treatments: [
    'cure', 'heal', 'recover', 'remedy', 'relief', 'prevent', 'avoid',
    'diet', 'exercise', 'rest', 'sleep', 'nutrition', 'vitamin', 'supplement',
    'home remedy', 'natural', 'ayurveda', 'herbal', 'antibiotic', 'painkiller'
  ],
  general: [
    'health', 'healthy', 'sick', 'illness', 'disease', 'condition', 'disorder',
    'syndrome', 'symptom', 'emergency', 'urgent', 'serious', 'chronic', 'acute',
    'hospital', 'clinic', 'appointment', 'checkup', 'consultation'
  ]
};

// Telugu health keywords for better detection in Telugu mode
const teluguHealthKeywords = [
  'జ్వరం', 'తలనొప్పి', 'నొప్పి', 'దగ్గు', 'జలుబు', 'వాంతులు', 'విరేచనలు',
  'వైద్యుడు', 'డాక్టర్', 'మందు', 'మెడిసిన్', 'చికిత్స', 'వైద్యం',
  'గుండె', 'ఊపిరితిత్తులు', 'కాలేయం', 'మూత్రపిండాలు', 'రక్తం', 'ప్రెషర్',
  'మధుమేహం', 'షుగర్', 'బీపీ', 'ఆరోగ్యం', 'అనారోగ్యం', 'వ్యాధి', 'లక్షణాలు'
];

// Key health terms for auto-detection and condition-specific advice
const keyHealthTerms = {
  'fever': {
    english: ['fever', 'high temperature', 'pyrexia'],
    telugu: ['జ్వరం', 'వేడిమి', 'ఉష్ణోగ్రత'],
    advice: {
      english: 'For fever: Rest, drink plenty of fluids, take paracetamol as directed, and monitor temperature regularly.',
      telugu: 'జ్వరానికి: విశ్రాంతి తీసుకోండి, ఎక్కువ నీరు త్రాగండి, పారాసిటమాల్ తీసుకోండి, ఉష్ణోగ్రతను తనిఖీ చేయండి.'
    }
  },
  'diabetes': {
    english: ['diabetes', 'blood sugar', 'glucose', 'diabetic'],
    telugu: ['మధుమేహం', 'షుగర్', 'రక్తంలో చక్కెర', 'డయాబెటిస్'],
    advice: {
      english: 'For diabetes: Monitor blood sugar regularly, follow prescribed diet, take medications on time, and exercise regularly.',
      telugu: 'మధుమేహానికి: రక్తంలో చక్కెరను తనిఖీ చేయండి, ఆహార నియమాలు పాటించండి, మందులు సమయానికి తీసుకోండి, వ్యాయామం చేయండి.'
    }
  },
  'rash': {
    english: ['rash', 'skin irritation', 'red spots', 'itchy skin'],
    telugu: ['దద్దుర్లు', 'చర్మ మీద మచ్చలు', 'దురద', 'చర్మ వాపు'],
    advice: {
      english: 'For skin rash: Keep area clean and dry, avoid scratching, apply cool compress, and avoid known allergens.',
      telugu: 'దద్దుర్లకు: ప్రాంతాన్ని శుభ్రంగా మరియు పొడిగా ఉంచండి, గోకకండి, చల్లని వస్త్రం వేయండి, అలెర్జీ కారకాలను నివారించండి.'
    }
  }
};

/**
 * Detects if a message contains health-related content
 */
export const isHealthRelated = (message: string): boolean => {
  if (!message || typeof message !== 'string') {
    return false;
  }

  const lowerMessage = message.toLowerCase();
  
  // Check English keywords
  const allKeywords = [
    ...healthKeywords.symptoms,
    ...healthKeywords.medical,
    ...healthKeywords.body,
    ...healthKeywords.conditions,
    ...healthKeywords.treatments,
    ...healthKeywords.general
  ];
  
  const hasEnglishKeywords = allKeywords.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
  
  // Check Telugu keywords
  const hasTeluguKeywords = teluguHealthKeywords.some(keyword => 
    message.includes(keyword)
  );
  
  // Check for common health-related phrases
  const healthPhrases = [
    'what should i do', 'how to treat', 'how to cure', 'is it safe',
    'side effects', 'home remedy', 'natural treatment', 'when to see doctor',
    'symptoms of', 'causes of', 'prevention of', 'risk factors'
  ];
  
  const hasHealthPhrases = healthPhrases.some(phrase => 
    lowerMessage.includes(phrase)
  );
  
  return hasEnglishKeywords || hasTeluguKeywords || hasHealthPhrases;
};

/**
 * Auto-detects key health terms and provides condition-specific advice
 */
export const detectHealthCondition = (message: string, teluguMode: boolean): string | null => {
  const lowerMessage = message.toLowerCase();
  
  for (const [condition, data] of Object.entries(keyHealthTerms)) {
    const englishTerms = data.english;
    const teluguTerms = data.telugu;
    
    const hasEnglishTerm = englishTerms.some(term => lowerMessage.includes(term.toLowerCase()));
    const hasTeluguTerm = teluguTerms.some(term => message.includes(term));
    
    if (hasEnglishTerm || hasTeluguTerm) {
      return teluguMode ? data.advice.telugu : data.advice.english;
    }
  }
  
  return null;
};

/**
 * Generates appropriate medical prompt based on language mode with professional Indian doctor persona
 */
export const generateMedicalPrompt = (originalMessage: string, teluguMode: boolean): string => {
  const basePrompt = teluguMode
    ? `మీరు అత్యంత అర్హత కలిగిన భారతీయ వైద్య నిపుణుడు మరియు సర్టిఫైడ్ డైటీషియన్. మీరు ఖచ్చితమైన, ఆచరణాత్మక మరియు సాంస్కృతికంగా తగిన ఆరోగ్య సలహా అందించడానికి శిక్షణ పొందారు. వినియోగదారు లక్షణాలను వివరించినప్పుడు లేదా వ్యాధి నివారణ గురించి అడిగినప్పుడు, నిజమైన వైద్యుడిలా స్పష్టమైన, దశల వారీ సలహా ఇవ్వండి. సాధారణ మందులు (అవసరమైతే OTC), ఇంటి సంరక్షణ చిట్కాలు, చికిత్స ఎంపికలు మరియు జాగ్రత్తలు సూచించండి.

ఆహారం గురించి అడిగితే, భారతీయ ఆహార అలవాట్ల ఆధారంగా సమతుల్య ఆహార ప్రణాళికను సూచించండి. వినియోగదారుకు వైద్య పరిస్థితి (ఉదా: మధుమేహం, రక్తపోటు) ఉంటే, దాని ప్రకారం మీ ఆహార సలహాను రూపొందించండి.

ప్రతిస్పందన ఫార్మాట్:
- స్నేహపూర్వక గ్రీటింగ్‌తో ప్రారంభించండి
- లక్షణాలు, సూచనలు మరియు తదుపరి దశలను స్పష్టంగా జాబితా చేయండి
- అవసరమైతే బుల్లెట్ పాయింట్లు ఉపయోగించండి
- "లక్షణాలు కొనసాగితే దయచేసి సమీప వైద్యుడిని సంప్రదించండి" వంటి భద్రతా రిమైండర్‌తో ముగించండి

ఎల్లప్పుడూ సరళమైన భాషలో వివరించండి. వినియోగదారు తెలుగును ఇష్టపడితే, తెలుగులో సమాధానం ఇవ్వండి.

వినియోగదారు ప్రశ్న: ${originalMessage}`
    : `You are a highly qualified Indian medical professional and certified dietician. You are trained to provide accurate, practical, and culturally appropriate health advice. When a user describes symptoms or asks for a disease cure, respond like a real doctor would — using clear, step-by-step advice. Recommend common medicines (OTC if appropriate), home care tips, treatment options, and precautions.

If asked about food, suggest a balanced diet plan based on Indian eating habits. If the user has a medical condition (e.g., diabetes, hypertension), tailor your diet advice accordingly.

Response Format:
- Start with a friendly greeting
- Clearly list symptoms, suggestions, and next steps
- Use bullets if needed
- End with a safety reminder like: "Please consult a nearby doctor if symptoms persist."

Always explain in simple language. If the user prefers Telugu, reply in Telugu.

User's question: ${originalMessage}`;

  return basePrompt;
};

/**
 * Generates medical disclaimer based on language mode
 */
export const getMedicalDisclaimer = (teluguMode: boolean): string => {
  return teluguMode
    ? '\n\n⚠️ వైద్య నిరాకరణ: ఈ సమాచారం సాధారణ మార్గదర్శకత్వం కోసం మాత్రమే. తీవ్రమైన లక్షణాలు లేదా అత్యవసర పరిస్థితుల్లో దయచేసి వెంటనే అర్హత కలిగిన వైద్యుడిని సంప్రదించండి.'
    : '\n\n⚠️ Medical Disclaimer: This information is for general guidance only. Please consult a qualified healthcare professional immediately for serious symptoms or medical emergencies.';
};

/**
 * Checks if message indicates emergency symptoms
 */
export const hasEmergencySymptoms = (message: string): boolean => {
  const emergencyKeywords = [
    'chest pain', 'heart attack', 'stroke', 'seizure', 'unconscious',
    'bleeding heavily', 'severe pain', 'can\'t breathe', 'emergency',
    'urgent', 'critical', 'life threatening', 'ambulance', 'hospital now'
  ];
  
  const teluguEmergencyKeywords = [
    'గుండెనొప్పి', 'గుండెపోటు', 'తీవ్రమైన నొప్పి', 'అత్యవసరం', 'ఆసుపత్రి'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  return emergencyKeywords.some(keyword => lowerMessage.includes(keyword)) ||
         teluguEmergencyKeywords.some(keyword => message.includes(keyword));
};

/**
 * Generates emergency warning message
 */
export const getEmergencyWarning = (teluguMode: boolean): string => {
  return teluguMode
    ? '🚨 అత్యవసర హెచ్చరిక: మీ లక్షణాలు తీవ్రంగా అనిపిస్తున్నాయి. దయచేసి వెంటనే అత్యవసర సేవలను (108) సంప్రదించండి లేదా సమీప ఆసుపత్రికి వెళ్లండి. ఆలస్యం చేయవద్దు!'
    : '🚨 EMERGENCY WARNING: Your symptoms sound serious. Please call emergency services (911/108) immediately or go to the nearest hospital. Do not delay seeking immediate medical attention!';
};

/**
 * Enhanced health detection with context analysis
 */
export const analyzeHealthContext = (message: string) => {
  const isHealth = isHealthRelated(message);
  const isEmergency = hasEmergencySymptoms(message);
  
  // Determine confidence level
  let confidence = 0;
  const lowerMessage = message.toLowerCase();
  
  // High confidence indicators
  if (lowerMessage.includes('doctor') || lowerMessage.includes('medical') || 
      lowerMessage.includes('symptoms') || lowerMessage.includes('pain')) {
    confidence += 0.4;
  }
  
  // Medium confidence indicators
  if (lowerMessage.includes('health') || lowerMessage.includes('medicine') ||
      lowerMessage.includes('treatment') || lowerMessage.includes('cure')) {
    confidence += 0.3;
  }
  
  // Body parts or conditions
  const bodyParts = ['head', 'chest', 'stomach', 'back', 'heart', 'lung'];
  if (bodyParts.some(part => lowerMessage.includes(part))) {
    confidence += 0.2;
  }
  
  // Question patterns
  if (lowerMessage.includes('what should i') || lowerMessage.includes('how to') ||
      lowerMessage.includes('is it safe') || lowerMessage.includes('side effect')) {
    confidence += 0.1;
  }
  
  // Auto-detect specific health conditions
  const conditionAdvice = detectHealthCondition(message, false); // We'll handle language in the response
  
  return {
    isHealthRelated: isHealth,
    isEmergency: isEmergency,
    confidence: Math.min(confidence, 1.0),
    requiresMedicalPrompt: isHealth && confidence > 0.3,
    conditionSpecificAdvice: conditionAdvice
  };
};