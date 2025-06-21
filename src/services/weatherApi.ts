// Weather API service using Google PaLM API for weather and farming advice
const API_KEY = 'AIzaSyDXf4W88CpdbzRW_NSmR4d5wNWU2UThJ6Y';
const PALM_API_URL = 'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText';

export interface WeatherData {
  location: string;
  temperature: number;
  rainProbability: number;
  humidity: number;
  windSpeed: number;
  timeOfDay: string;
  weatherEmoji: string;
  farmingAdvice: string;
  fiveDayForecast: DayForecast[];
}

export interface DayForecast {
  day: string;
  emoji: string;
  temperature: number;
  advice: string;
}

interface PaLMResponse {
  candidates: {
    output: string;
  }[];
}

export const fetchWeatherAndFarmingAdvice = async (
  location: string = 'Hyderabad, India',
  teluguMode: boolean = false
): Promise<WeatherData> => {
  try {
    const prompt = teluguMode 
      ? `మీరు భారతీయ రైతుల కోసం శిక్షణ పొందిన వాతావరణ అంచనా సహాయకుడు.

${location} లోని ప్రస్తుత వాతావరణం ఆధారంగా ఇవ్వండి:
- వాతావరణ పరిస్థితి
- వర్షపాతం మరియు ఉష్ణోగ్రత
- పంట నీరు పోయడం, ఎరువులు మరియు రక్షణపై సలహా

సరళమైన, రైతు-స్నేహపూర్వక ఫార్మాట్‌లో ప్రదర్శించండి.

ఈ ఫార్మాట్‌లో ప్రతిస్పందించండి:
స్థానం: ${location}
ఉష్ణోగ్రత: [సంఖ్య]°C
వర్షం సంభావ్యత: [సంఖ్య]%
తేమ: [సంఖ్య]%
గాలి వేగం: [సంఖ్య] km/h
దినంలో భాగం: [ఉదయం/మధ్యాహ్నం/సాయంత్రం/రాత్రి]
వాతావరణ ఎమోజీ: [☀️/⛅/🌧/⛈/💨 లో ఒకటి]
రైతుల సలహా: [వాతావరణం ఆధారంగా సరళమైన సలహా - ఎప్పుడు నీరు పోయాలి, కీటకనాశకాలు వాడాలి, విత్తనాలు వేయాలి లేదా కోత చేయాలి, భద్రత లేదా హైడ్రేషన్ చిట్కాలు]

5-రోజుల అంచనా:
సోమవారం: [ఎమోజీ] [ఉష్ణోగ్రత]°C - [ఒక వాక్యంలో సలహా]
మంగళవారం: [ఎమోజీ] [ఉష్ణోగ్రత]°C - [ఒక వాక్యంలో సలహా]
బుధవారం: [ఎమోజీ] [ఉష్ణోగ్రత]°C - [ఒక వాక్యంలో సలహా]
గురువారం: [ఎమోజీ] [ఉష్ణోగ్రత]°C - [ఒక వాక్యంలో సలహా]
శుక్రవారం: [ఎమోజీ] [ఉష్ణోగ్రత]°C - [ఒక వాక్యంలో సలహా]`
      : `You are a weather forecasting assistant trained for Indian farmers.

Use the current user location (auto-fetched) to generate:
- Weather condition
- Rainfall and temperature
- Advice on crop watering, fertilization, and protection

Display in simple, farmer-friendly format.

Respond in this format:
Location: ${location}
Temperature: [number]°C
Rain Probability: [number]%
Humidity: [number]%
Wind Speed: [number] km/h
Time of Day: [Morning/Afternoon/Evening/Night]
Weather Emoji: [one of ☀️/⛅/🌧/⛈/💨]
Farming Advice: [Simple advice based on weather - when to water crops, pesticide usage, sowing or harvesting suggestions, safety or hydration tips]

5-Day Forecast:
Monday: [emoji] [temp]°C - [one-line advice]
Tuesday: [emoji] [temp]°C - [one-line advice]
Wednesday: [emoji] [temp]°C - [one-line advice]
Thursday: [emoji] [temp]°C - [one-line advice]
Friday: [emoji] [temp]°C - [one-line advice]`;

    const response = await fetch(`${PALM_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          text: prompt
        },
        temperature: 0.7,
        candidateCount: 1
      }),
    });

    if (!response.ok) {
      throw new Error(`Weather API Error: ${response.status} - ${response.statusText}`);
    }

    const data: PaLMResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No weather response from AI');
    }

    const weatherText = data.candidates[0].output;
    
    // Parse the response
    const lines = weatherText.split('\n').filter(line => line.trim());
    const weatherData: Partial<WeatherData> = {
      location: location,
      fiveDayForecast: []
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.includes('ఉష్ణోగ్రత:') || trimmedLine.includes('Temperature:')) {
        const tempMatch = trimmedLine.match(/(\d+)°C/);
        if (tempMatch) weatherData.temperature = parseInt(tempMatch[1]);
      } else if (trimmedLine.includes('వర్షం సంభావ్యత:') || trimmedLine.includes('Rain Probability:')) {
        const rainMatch = trimmedLine.match(/(\d+)%/);
        if (rainMatch) weatherData.rainProbability = parseInt(rainMatch[1]);
      } else if (trimmedLine.includes('తేమ:') || trimmedLine.includes('Humidity:')) {
        const humidityMatch = trimmedLine.match(/(\d+)%/);
        if (humidityMatch) weatherData.humidity = parseInt(humidityMatch[1]);
      } else if (trimmedLine.includes('గాలి వేగం:') || trimmedLine.includes('Wind Speed:')) {
        const windMatch = trimmedLine.match(/(\d+)/);
        if (windMatch) weatherData.windSpeed = parseInt(windMatch[1]);
      } else if (trimmedLine.includes('దినంలో భాగం:') || trimmedLine.includes('Time of Day:')) {
        weatherData.timeOfDay = trimmedLine.split(':')[1]?.trim() || 'Morning';
      } else if (trimmedLine.includes('వాతావరణ ఎమోజీ:') || trimmedLine.includes('Weather Emoji:')) {
        const emojiMatch = trimmedLine.match(/[☀️⛅🌧⛈💨]/);
        weatherData.weatherEmoji = emojiMatch ? emojiMatch[0] : '☀️';
      } else if (trimmedLine.includes('రైతుల సలహా:') || trimmedLine.includes('Farming Advice:')) {
        weatherData.farmingAdvice = trimmedLine.split(':').slice(1).join(':').trim();
      } else if (trimmedLine.match(/(సోమవారం|మంగళవారం|బుధవారం|గురువారం|శుక్రవారం|Monday|Tuesday|Wednesday|Thursday|Friday):/)) {
        // Parse forecast days
        const dayMatch = trimmedLine.match(/(సోమవారం|మంగళవారం|బుధవారం|గురువారం|శుక్రవారం|Monday|Tuesday|Wednesday|Thursday|Friday):\s*([☀️⛅🌧⛈💨])\s*(\d+)°C\s*-\s*(.+)/);
        if (dayMatch) {
          weatherData.fiveDayForecast!.push({
            day: dayMatch[1],
            emoji: dayMatch[2],
            temperature: parseInt(dayMatch[3]),
            advice: dayMatch[4].trim()
          });
        }
      }
    }

    // Provide fallback values
    return {
      location: weatherData.location || location,
      temperature: weatherData.temperature || 28,
      rainProbability: weatherData.rainProbability || 20,
      humidity: weatherData.humidity || 65,
      windSpeed: weatherData.windSpeed || 12,
      timeOfDay: weatherData.timeOfDay || 'Morning',
      weatherEmoji: weatherData.weatherEmoji || '☀️',
      farmingAdvice: weatherData.farmingAdvice || (teluguMode ? 'మంచి వాతావరణం వ్యవసాయానికి' : 'Good weather for farming'),
      fiveDayForecast: weatherData.fiveDayForecast!.length > 0 ? weatherData.fiveDayForecast! : [
        { day: teluguMode ? 'సోమవారం' : 'Monday', emoji: '☀️', temperature: 30, advice: teluguMode ? 'ఉదయం నీరు పోయండి' : 'Water early morning' },
        { day: teluguMode ? 'మంగళవారం' : 'Tuesday', emoji: '⛅', temperature: 28, advice: teluguMode ? 'మంచి రోజు' : 'Good day for farming' },
        { day: teluguMode ? 'బుధవారం' : 'Wednesday', emoji: '🌧', temperature: 25, advice: teluguMode ? 'స్ప్రే చేయవద్దు' : 'Don\'t spray today' },
        { day: teluguMode ? 'గురువారం' : 'Thursday', emoji: '☀️', temperature: 32, advice: teluguMode ? 'ఎక్కువ నీరు పోయండి' : 'Water more today' },
        { day: teluguMode ? 'శుక్రవారం' : 'Friday', emoji: '⛅', temperature: 29, advice: teluguMode ? 'కోత చేయవచ్చు' : 'Good for harvesting' }
      ]
    };

  } catch (error) {
    console.error('Weather fetch error:', error);
    
    // Return fallback weather data
    return {
      location: location,
      temperature: 28,
      rainProbability: 20,
      humidity: 65,
      windSpeed: 12,
      timeOfDay: 'Morning',
      weatherEmoji: '☀️',
      farmingAdvice: teluguMode 
        ? 'వాతావరణ డేటా లోడ్ చేయడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.'
        : 'Failed to load weather data. Please try again.',
      fiveDayForecast: [
        { day: teluguMode ? 'సోమవారం' : 'Monday', emoji: '☀️', temperature: 30, advice: teluguMode ? 'ఉదయం నీరు పోయండి' : 'Water early morning' },
        { day: teluguMode ? 'మంగళవారం' : 'Tuesday', emoji: '⛅', temperature: 28, advice: teluguMode ? 'మంచి రోజు' : 'Good day for farming' },
        { day: teluguMode ? 'బుధవారం' : 'Wednesday', emoji: '🌧', temperature: 25, advice: teluguMode ? 'స్ప్రే చేయవద్దు' : 'Don\'t spray today' },
        { day: teluguMode ? 'గురువారం' : 'Thursday', emoji: '☀️', temperature: 32, advice: teluguMode ? 'ఎక్కువ నీరు పోయండి' : 'Water more today' },
        { day: teluguMode ? 'శుక్రవారం' : 'Friday', emoji: '⛅', temperature: 29, advice: teluguMode ? 'కోత చేయవచ్చు' : 'Good for harvesting' }
      ]
    };
  }
};