# Google API Key Setup Instructions

## Current Issue
The application is using a placeholder API key (`AIzaSyDXf4W88CpdbzRW_NSmR4d5wNWU2UThJ6Y`) which is causing "Failed to fetch" errors.

## Required APIs
Your Google Cloud Project needs the following APIs enabled:
1. **Generative Language API** (for Gemini)
2. **Cloud Text-to-Speech API**
3. **Cloud Speech-to-Text API**

## Steps to Fix

### 1. Get a Valid API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the required APIs:
   - Go to "APIs & Services" > "Library"
   - Search for and enable each API listed above
4. Create an API key:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

### 2. Replace the API Key
Replace `AIzaSyDXf4W88CpdbzRW_NSmR4d5wNWU2UThJ6Y` with your actual API key in these files:
- `src/services/api.ts` (line 2)
- `src/services/googleTTS.ts` (line 3)
- `src/services/newsApi.ts` (line 2)
- `src/services/speechApi.ts` (line 3)
- `src/services/weatherApi.ts` (line 2)

### 3. Security Recommendations
- Restrict your API key to specific APIs only
- Consider using environment variables for production
- Add HTTP referrer restrictions if deploying to a domain

## Example Replacement
Change this:
```javascript
const API_KEY = 'AIzaSyDXf4W88CpdbzRW_NSmR4d5wNWU2UThJ6Y';
```

To this:
```javascript
const API_KEY = 'YOUR_ACTUAL_API_KEY_HERE';
```

Once you replace the API key in all five files, the application should work correctly.