# Gemini AI Integration Guide

## Overview

This guide explains how to integrate Google Gemini AI into your Nexaa project to replace mock responses with intelligent, emotion-aware AI responses in both chat and voice interactions.

## What's Been Added

### 1. Python ML Service Updates

- **Gemini Service** (`ml-service/gemini_service.py`): Core service for interacting with Google Gemini AI
- **New Chat Endpoint** (`/chat/gemini`): Generates AI responses based on user messages and emotion context
- **Enhanced Dependencies**: Added `google-generativeai` to requirements.txt

### 2. Frontend Updates

- **ML Service Client**: Added `generateGeminiResponse()` method to `mlService.js`
- **ChatPage Updates**: Modified to use Gemini responses instead of mock data
- **Enhanced Message Display**: Shows response source (Gemini/Fallback) and emotion context

### 3. Configuration

- **Environment Setup**: `.env.example` file with Gemini API key configuration
- **Setup Script**: `setup_gemini.sh` for easy installation

## Setup Instructions

### 1. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key for the next step

### 2. Install Dependencies

```bash
cd ml-service
./setup_gemini.sh
```

### 3. Configure Environment

1. Open `ml-service/.env` file
2. Replace `your_gemini_api_key_here` with your actual API key:

```env
GEMINI_API_KEY=AIzaSyYour_Actual_API_Key_Here
```

### 4. Start Services

```bash
# Start ML Service (from ml-service directory)
python3 main.py

# Start Frontend (from frontend directory)
npm run dev

# Start Backend (from backend directory - if needed for auth)
mvn spring-boot:run
```

## How It Works

### 1. Chat Flow

1. User sends a message in the chat
2. **Emotion Analysis**: Message is analyzed for emotion (happy, sad, angry, etc.)
3. **Gemini Request**: Message + emotion context sent to Gemini AI
4. **AI Response**: Gemini generates empathetic, context-aware response
5. **Voice Output**: Response is spoken using text-to-speech
6. **Fallback**: If Gemini fails, emotion-based fallback responses are used

### 2. Emotion-Aware Prompting

The system sends enhanced prompts to Gemini that include:
- User's message
- Detected emotion (e.g., "sad" with 85% confidence)
- User's name for personalization
- Context about being an empathetic AI companion

Example prompt structure:
```
You are Nexa, an empathetic AI companion...

EMOTION CONTEXT: The user's emotional state is 'sad' with 85.0% confidence. 
Please respond with empathy and consideration for this emotional state.

USER MESSAGE: "I've been feeling really down lately"
```

### 3. Voice Integration

- All Gemini responses are automatically converted to speech
- Uses the existing TTS system for consistent voice experience
- Maintains the same speaking style as before, but with AI-generated content

## API Endpoints

### New Gemini Chat Endpoint

```http
POST /chat/gemini
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "I'm feeling really stressed about work",
  "user_id": "user@example.com",
  "user_name": "John",
  "detected_emotion": "angry",
  "confidence": 0.85
}
```

Response:
```json
{
  "response": "I understand work stress can be overwhelming, John. Your feelings are completely valid. Have you been able to identify what specific aspects are causing the most pressure?",
  "success": true,
  "source": "gemini",
  "emotion": "angry",
  "confidence": 0.85,
  "voice_response_url": "/api/audio/response.mp3",
  "analysis_id": "uuid-here"
}
```

### Enhanced Health Check

```http
GET /health
```

Response includes Gemini status:
```json
{
  "status": "healthy",
  "message": "Emotion model loaded; Gemini AI available",
  "model_loaded": true
}
```

## Features

### ✨ What's New

1. **Intelligent Responses**: Real AI responses instead of pre-programmed templates
2. **Emotion-Aware**: Gemini receives emotion context to provide empathetic responses
3. **Personalized**: Uses user's name and emotional state for personalization
4. **Fallback System**: Graceful degradation if Gemini is unavailable
5. **Source Indicators**: UI shows whether response is from Gemini or fallback
6. **Voice Integration**: All AI responses are spoken naturally

### 🔄 Fallback Behavior

- If Gemini API is unavailable: Uses emotion-based template responses
- If emotion detection fails: Uses general supportive responses
- If everything fails: Uses basic "I'm here to help" messages

## Troubleshooting

### Common Issues

1. **"Gemini service not available"**
   - Check your API key in `.env`
   - Ensure you have internet connection
   - Verify API key has proper permissions

2. **"Model not loaded"**
   - The emotion recognition model isn't required for Gemini to work
   - Gemini can work independently for chat responses

3. **Import errors**
   - Run `pip install google-generativeai`
   - Check Python version (requires Python 3.7+)

### Testing Gemini Integration

```bash
# Test if Gemini is working
curl -X POST "http://localhost:8001/chat/gemini" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer demo-token-123" \
  -d '{
    "message": "Hello, how are you?",
    "user_name": "Test User"
  }'
```

## Security Notes

- API keys are stored in environment variables, not in code
- Gemini API calls include safety settings to filter harmful content
- All user data sent to Gemini is temporary and not stored by Google

## Customization

### Modifying AI Personality

Edit the prompt in `gemini_service.py`:

```python
base_prompt = (
    "You are Nexa, an empathetic AI companion designed to provide emotional support "
    "and meaningful conversation. You are warm, understanding, and genuinely caring."
    # Customize this section for different personality traits
)
```

### Adjusting Response Length

Modify generation config in `gemini_service.py`:

```python
generation_config = {
    "temperature": 0.7,  # Creativity level (0.0-1.0)
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 1024,  # Increase for longer responses
}
```

## Next Steps

1. **Monitor Usage**: Watch Gemini API usage in Google Cloud Console
2. **Fine-tune Prompts**: Adjust prompts based on user feedback
3. **Add More Context**: Include conversation history for better responses
4. **Voice Customization**: Experiment with different TTS voices for AI responses

## Support

- Check logs in terminal for error details
- Verify environment variables are set correctly
- Ensure all dependencies are installed
- Test with simple messages first before complex conversations