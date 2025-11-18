# NexaModel Integration Guide

This guide explains how to set up and run your integrated system with React frontend, Spring Boot authentication, and FastAPI ML service.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  React Frontend │    │  Spring Boot     │    │  FastAPI ML     │
│  (Port 3000)    │    │  Auth Service    │    │  Service        │
│                 │    │  (Port 8080)     │    │  (Port 8001)    │
│                 │    │                  │    │                 │
│  - User Login   │───▶│  - Authentication│    │  - Emotion      │
│  - UI/UX        │    │  - JWT Tokens    │    │    Analysis     │
│  - File Upload  │    │  - User Management│   │  - TTS Response │
│  - Voice/Video  │    │                  │    │  - Model API    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                                               │
         └──────────────── ML Requests ──────────────────┘
                     (Authenticated with JWT)
```

## Prerequisites

- **Java 17+** for Spring Boot
- **Node.js 18+** for React
- **Python 3.8+** for FastAPI
- **Git** for version control

## Setup Instructions

### 1. Spring Boot Auth Service (Backend)

```bash
cd backend
```

**Start the Spring Boot service:**
```bash
./mvnw spring-boot:run
```
or
```bash
mvn spring-boot:run
```

The service will run on `http://localhost:8080`

**Test endpoints:**
- `GET /auth/health` - Health check
- `POST /auth/signin` - User login
- `POST /auth/signup` - User registration
- `POST /auth/validate` - Token validation

### 2. FastAPI ML Service

```bash
cd ml-service
```

**Setup Python environment:**
```bash
# Make script executable (if not already)
chmod +x setup.sh

# Run setup script
./setup.sh
```

**Or manually:**
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

**Start the FastAPI service:**
```bash
# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Start the service
python main.py
```
or
```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

The service will run on `http://localhost:8001`

**Test endpoints:**
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /model/info` - Model information
- `POST /analyze/text` - Text emotion analysis
- `POST /analyze/voice` - Voice emotion analysis
- `POST /analyze/video` - Video emotion analysis
- `POST /analyze/multimodal` - Combined analysis

### 3. React Frontend

```bash
cd frontend
```

**Install dependencies:**
```bash
npm install
```

**Start the development server:**
```bash
npm run dev
```

The application will run on `http://localhost:3000` (or `http://localhost:5173` with Vite)

## Usage Flow

### 1. User Authentication
1. User visits the React frontend
2. User signs in via email, Google, or GitHub
3. Spring Boot validates credentials and returns JWT token
4. React stores the token and user information

### 2. Emotion Analysis
1. User navigates to the Emotion Analysis page
2. User provides input (text, voice recording, or video)
3. React sends the data to FastAPI with JWT token
4. FastAPI validates the token with Spring Boot
5. FastAPI processes the input using NexaModel
6. FastAPI returns emotion analysis and generates voice response
7. React displays results and plays voice feedback

## API Authentication

The FastAPI service validates requests using JWT tokens from Spring Boot:

```python
# FastAPI validates token with Spring Boot
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    auth_service_url = "http://localhost:8080/auth/validate"
    response = requests.get(f"{auth_service_url}?token={token}")
    
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return response.json()
```

## Model Integration

The FastAPI service uses the enhanced NexaModel:

```python
from enhanced_nexamodel import NexaEmotionRecognizer

# Initialize the emotion recognizer
emotion_recognizer = NexaEmotionRecognizer("../nexamodel/NexaModel_Complete")

# Analyze emotions
result = emotion_recognizer.predict_emotion(
    face_image=image_path,
    audio_file=audio_path,
    text=text_input
)
```

## File Structure

```
Nexaa/
├── backend/                 # Spring Boot authentication service
│   ├── src/main/java/
│   ├── pom.xml
│   └── target/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── EmotionAnalysisPage.jsx
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── mlService.js
│   │   │   └── ...
│   │   └── contexts/
│   ├── package.json
│   └── dist/
├── ml-service/              # FastAPI ML service
│   ├── main.py
│   ├── enhanced_nexamodel.py
│   ├── requirements.txt
│   ├── setup.sh
│   ├── .env
│   └── venv/
└── nexamodel/              # Trained ML models
    └── NexaModel_Complete/
        ├── multimodal_emotion_model.keras
        ├── face_processor.pkl
        ├── audio_processor.pkl
        ├── text_processor.pkl
        └── model_config.json
```

## Environment Configuration

### FastAPI (.env file)
```env
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8001
SPRING_BOOT_AUTH_URL=http://localhost:8080
MODEL_DIR=../nexamodel/NexaModel_Complete
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### React (environment variables)
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_ML_API_BASE_URL=http://localhost:8001
```

## Troubleshooting

### Common Issues

**1. Model Not Loading**
- Ensure the model files are in `nexamodel/NexaModel_Complete/`
- Check Python dependencies are installed
- The service will run with fallback functionality if models aren't available

**2. CORS Issues**
- Verify CORS settings in FastAPI main.py
- Check that frontend URLs are in the allowed origins list

**3. Authentication Failures**
- Ensure Spring Boot service is running on port 8080
- Check that JWT tokens are being passed correctly
- Verify token validation endpoint is working

**4. Audio/Video Not Working**
- Grant microphone/camera permissions in browser
- Check browser compatibility for media APIs
- Ensure HTTPS if testing on remote servers

### Debug Commands

**Check service health:**
```bash
# Spring Boot
curl http://localhost:8080/auth/health

# FastAPI
curl http://localhost:8001/health

# Check model info
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8001/model/info
```

**View logs:**
```bash
# FastAPI logs
cd ml-service
source venv/bin/activate
python main.py

# Spring Boot logs (check terminal output)
cd backend
./mvnw spring-boot:run
```

## Security Notes

- JWT tokens are used for authentication between services
- CORS is configured to allow specific origins only
- File uploads have size and type restrictions
- Temporary files are automatically cleaned up

## Performance Optimization

- Models are loaded once at startup
- Audio/video files are processed and cleaned up immediately
- TTS responses are cached temporarily
- Use production WSGI server for FastAPI in production

## Production Deployment

For production deployment:

1. **Use environment variables for configuration**
2. **Set up proper database for user management**
3. **Use production WSGI server (Gunicorn) for FastAPI**
4. **Configure proper CORS and security headers**
5. **Set up SSL certificates for HTTPS**
6. **Use Docker containers for easier deployment**

## Next Steps

1. **Add user session management**
2. **Implement analysis history**
3. **Add more emotion response templates**
4. **Integrate with cloud services for scaling**
5. **Add real-time analysis features**
6. **Implement user preferences and settings**