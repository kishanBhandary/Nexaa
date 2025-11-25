# Nexaa ML Service

## 🚀 Quick Start

1. **Start the service:**
   ```bash
   ./start.sh
   ```

2. **Or start manually:**
   ```bash
   python3 main.py
   ```

The service will be available at `http://localhost:8001`

## 📁 Files Overview

### Core Files
- **`main.py`** - Main FastAPI service with all features (emotion recognition + Gemini AI)
- **`requirements.txt`** - Python dependencies
- **`.env`** - Environment configuration (create from `.env.example`)

### Setup & Run
- **`start.sh`** - Quick start script
- **`setup_gemini.sh`** - Detailed setup with dependency installation

### AI Models (Optional)
- **`nexamodel_v2.py`** - NexaModel V2 (82% accuracy emotion recognition)
- **`enhanced_nexamodel.py`** - Enhanced emotion model
- **`real_emotion_models.py`** - Real emotion models
- **`real_pytorch_emotion_model.py`** - PyTorch CNN models
- **`advanced_face_emotion_model.py`** - Advanced face emotion detection
- **`continuous_emotion_recognition.py`** - Continuous emotion tracking

### Documentation
- **`QUICKSTART.md`** - Detailed setup guide
- **`EMOTION_RECOGNITION_GUIDE.md`** - Emotion recognition documentation
- **`DEPLOYMENT_COMPLETE.md`** - Deployment guide

### Deploy
- **`Dockerfile`** - Container configuration

## 🔧 Configuration

Edit `.env` file:
```env
# Required for Gemini AI
GEMINI_API_KEY=your_api_key_here

# Server settings
PORT=8001
HOST=0.0.0.0
```

## 📡 Endpoints

### Chat & AI
- `POST /chat/gemini` - Generate AI responses with emotion context
- `POST /analyze/text` - Analyze emotion from text
- `POST /analyze/voice` - Analyze emotion from audio
- `POST /analyze/video` - Analyze emotion from image/video
- `POST /analyze/multimodal` - Combined analysis

### Advanced Features (if models available)
- `POST /analyze/continuous` - Continuous emotion detection
- `POST /analyze/real-emotion` - Real PyTorch CNN analysis
- `POST /analyze/face-priority` - Face-priority emotion analysis

### Status
- `GET /health` - Service health check
- `GET /model/info` - Model information

## 🎯 Features

✅ **Gemini AI Integration** - Real AI responses instead of mock data  
✅ **Emotion Recognition** - Text, voice, and facial emotion analysis  
✅ **Voice Synthesis** - Text-to-speech for AI responses  
✅ **Multimodal Analysis** - Combined emotion detection  
✅ **Graceful Fallbacks** - Works even if some models aren't available  
✅ **Real Models** - PyTorch CNN models for authentic emotion detection  

## 🔗 Frontend Integration

The service works with your Nexaa frontend. Make sure:
1. Frontend calls `http://localhost:8001/chat/gemini` for AI responses
2. Emotion analysis happens first, then Gemini generates contextual responses
3. TTS audio is served from `/audio/{filename}` endpoint

## 🛠️ Development

Start in development mode:
```bash
python3 main.py
```

The service automatically:
- Loads available AI models
- Initializes Gemini AI (if API key provided)
- Falls back to mock responses if models unavailable
- Serves on http://localhost:8001