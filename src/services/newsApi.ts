// Agriculture News API service using Google PaLM API
const API_KEY = 'AIzaSyDXf4W88CpdbzRW_NSmR4d5wNWU2UThJ6Y';
const PALM_API_URL = 'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText';

export interface AgricultureNews {
  headline: string;
  content: string;
  timestamp: Date;
  source?: string;
}

interface PaLMResponse {
  candidates: {
    output: string;
  }[];
}

export const fetchLatestAgricultureNews = async (teluguMode: boolean = false): Promise<AgricultureNews> => {
  try {
    const prompt = teluguMode 
      ? `మీరు వ్యవసాయ వార్తా ఏజెన్సీ.

ఇటీవలి మరియు సంబంధిత భారతీయ వ్యవసాయ వార్తలను ఇవ్వండి:
- పంట ధరలు
- ప్రభుత్వ పథకాలు
- ఎరువుల అప్‌డేట్‌లు
- మార్కెట్ అంతర్దృష్టులు

3-5 చిన్న కథనాలు క్రమం తప్పకుండా అప్‌డేట్ చేయబడతాయి. సాధారణ భాష ఉపయోగించండి.

ఈ ఫార్మాట్‌లో ప్రతిస్పందించండి:
హెడ్‌లైన్: [బోల్డ్ హెడ్‌లైన్]
కంటెంట్: [2-3 వాక్యాలలో వివరణ]
మూలం: [ఏదైనా ఉంటే]`
      : `You are an agriculture news agency.

Give recent and relevant Indian farming news:
- Crop pricing
- Government schemes
- Fertilizer updates
- Market insights

3–5 short articles updated regularly. Use plain language.

Respond in this format:
Headline: [Bold headline]
Content: [2-3 sentence description]
Source: [if any]`;

    const response = await fetch(`${PALM_API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          text: prompt
        },
        temperature: 0.8,
        candidateCount: 1
      }),
    });

    if (!response.ok) {
      throw new Error(`News API Error: ${response.status} - ${response.statusText}`);
    }

    const data: PaLMResponse = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No news response from AI');
    }

    const newsText = data.candidates[0].output;
    
    // Parse the response to extract headline, content, and source
    const lines = newsText.split('\n').filter(line => line.trim());
    let headline = '';
    let content = '';
    let source = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.toLowerCase().startsWith('headline:')) {
        headline = trimmedLine.replace(/^headline:\s*/i, '').replace(/^\*\*|\*\*$/g, '');
      } else if (trimmedLine.toLowerCase().startsWith('content:')) {
        content = trimmedLine.replace(/^content:\s*/i, '');
      } else if (trimmedLine.toLowerCase().startsWith('source:')) {
        source = trimmedLine.replace(/^source:\s*/i, '');
      } else if (!headline && trimmedLine.length > 10) {
        // If no explicit headline found, use the first substantial line
        headline = trimmedLine.replace(/^\*\*|\*\*$/g, '');
      } else if (headline && !content && trimmedLine.length > 20) {
        // If headline exists but no content, use this as content
        content = trimmedLine;
      }
    }

    // Fallback if parsing fails
    if (!headline) {
      const sentences = newsText.split('.').filter(s => s.trim().length > 10);
      headline = sentences[0]?.trim() || 'Latest Agriculture Update';
      content = sentences.slice(1, 3).join('. ').trim() || newsText.substring(0, 200);
    }

    return {
      headline: headline || 'Agriculture News Update',
      content: content || newsText.substring(0, 200),
      timestamp: new Date(),
      source: source || undefined
    };

  } catch (error) {
    console.error('Agriculture news fetch error:', error);
    
    // Return fallback news
    return {
      headline: teluguMode 
        ? 'వ్యవసాయ వార్తలు లోడ్ చేయడంలో విఫలమైంది'
        : 'Failed to load agriculture news',
      content: teluguMode 
        ? 'దయచేసి కొద్దిసేపు తర్వాత మళ్లీ ప్రయత్నించండి.'
        : 'Please try again in a few moments.',
      timestamp: new Date()
    };
  }
};