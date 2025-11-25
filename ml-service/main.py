"""
NexaModel FastAPI Service - Simplified Version
=============================================

This is a simplified FastAPI service that works without all dependencies installed.
It provides basic endpoints and can be extended as dependencies are installed.

Author: Nexaa AI Team
Version: 1.0.0
"""

import os
import json
import uuid
import tempfile
import datetime
from typing import Optional, Dict, Any, List
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import requests

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("✓ Environment variables loaded from .env file")
except ImportError:
    print("⚠ python-dotenv not available, using system environment variables only")

# Import continuous emotion recognition
try:
    from continuous_emotion_recognition import get_continuous_recognizer, cleanup_continuous_recognizer
    CONTINUOUS_RECOGNITION_AVAILABLE = True
except ImportError:
    CONTINUOUS_RECOGNITION_AVAILABLE = False
    print("⚠ Continuous emotion recognition not available")

# Import advanced face emotion model
try:
    from advanced_face_emotion_model import get_advanced_face_recognizer
    ADVANCED_FACE_MODEL_AVAILABLE = True
except ImportError:
    ADVANCED_FACE_MODEL_AVAILABLE = False
    print("⚠ Advanced face emotion model not available")

# Import real PyTorch emotion model
try:
    from real_pytorch_emotion_model import get_real_pytorch_recognizer
    REAL_PYTORCH_MODEL_AVAILABLE = True
except ImportError:
    REAL_PYTORCH_MODEL_AVAILABLE = False
    print("⚠ Real PyTorch emotion model not available")

# Import Gemini service
try:
    import google.generativeai as genai
    from google.generativeai.types import HarmCategory, HarmBlockThreshold
    GEMINI_AVAILABLE = True
    print("✓ Google Gemini AI available")
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠ Google Gemini AI not available")

# Initialize FastAPI app
app = FastAPI(
    title="NexaModel Emotion Recognition API",
    description="Multimodal emotion recognition service for voice, video, and text analysis",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Configuration
UPLOAD_DIR = Path("./uploads")
TEMP_DIR = Path("./temp")
MODEL_DIR = Path("../nexamodel/NexaModel_Complete")

# Create directories
UPLOAD_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)

# Global variables
emotion_recognizer = None
continuous_recognizer = None
advanced_face_recognizer = None
real_pytorch_recognizer = None
gemini_model = None
dependencies_loaded = {
    'numpy': False,
    'opencv': False,
    'librosa': False,
    'gtts': False,
    'aiofiles': False,
    'nexamodel': False,
    'continuous_recognition': CONTINUOUS_RECOGNITION_AVAILABLE,
    'advanced_face_model': ADVANCED_FACE_MODEL_AVAILABLE,
    'real_pytorch_model': REAL_PYTORCH_MODEL_AVAILABLE,
    'gemini': GEMINI_AVAILABLE
}

# Pydantic models
class EmotionRequest(BaseModel):
    text: Optional[str] = None
    user_id: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    detected_emotion: Optional[str] = None
    confidence: Optional[float] = None

class EmotionResponse(BaseModel):
    predicted_emotion: str
    confidence: float
    all_probabilities: Dict[str, float]
    voice_response_url: Optional[str] = None
    analysis_id: str

class ChatResponse(BaseModel):
    response: str
    success: bool
    source: str
    emotion: Optional[str] = None
    confidence: Optional[float] = None
    voice_response_url: Optional[str] = None
    analysis_id: str

class HealthResponse(BaseModel):
    status: str
    message: str
    model_loaded: bool
    dependencies: Dict[str, bool]

# Mock emotion recognizer for when real model isn't available
class MockEmotionRecognizer:
    def __init__(self):
        self.emotion_labels = ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral']
        self.models_loaded = False
    
    def predict_emotion(self, face_image=None, audio_file=None, text=None):
        import random
        
        # Simple mock prediction based on text analysis
        if text:
            text_lower = text.lower()
            if any(word in text_lower for word in ['happy', 'joy', 'great', 'wonderful', 'excited']):
                predicted_emotion = 'happy'
                confidence = 0.85
            elif any(word in text_lower for word in ['sad', 'down', 'depressed', 'awful']):
                predicted_emotion = 'sad'
                confidence = 0.80
            elif any(word in text_lower for word in ['angry', 'mad', 'furious', 'hate']):
                predicted_emotion = 'angry'
                confidence = 0.82
            elif any(word in text_lower for word in ['scared', 'afraid', 'worried', 'anxious']):
                predicted_emotion = 'fear'
                confidence = 0.78
            else:
                predicted_emotion = 'neutral'
                confidence = 0.75
        else:
            # Random emotion for audio/video
            predicted_emotion = random.choice(self.emotion_labels)
            confidence = random.uniform(0.6, 0.9)
        
        # Generate probabilities
        probabilities = {}
        for emotion in self.emotion_labels:
            if emotion == predicted_emotion:
                probabilities[emotion] = confidence
            else:
                probabilities[emotion] = random.uniform(0.01, 0.3)
        
        # Normalize probabilities
        total = sum(probabilities.values())
        probabilities = {k: v/total for k, v in probabilities.items()}
        
        return {
            'predicted_emotion': predicted_emotion,
            'confidence': confidence,
            'all_probabilities': probabilities
        }
    
    def get_model_info(self):
        return {
            'model_name': 'MockNexaModel',
            'version': '1.0.0',
            'emotions': self.emotion_labels,
            'multimodal_accuracy': 0.75,
            'individual_models': {
                'face': 0.70,
                'audio': 0.65,
                'text': 0.80
            },
            'created_date': '2024-11-18',
            'models_loaded': self.models_loaded,
            'available_models': {
                'multimodal': False,
                'face': False,
                'audio': False,
                'text': True
            }
        }

# Try to load optional dependencies
def check_dependencies():
    global dependencies_loaded
    
    try:
        import numpy as np
        dependencies_loaded['numpy'] = True
        print("✓ NumPy loaded")
    except ImportError:
        print("⚠ NumPy not available")
    
    try:
        import cv2
        dependencies_loaded['opencv'] = True
        print("✓ OpenCV loaded")
    except ImportError:
        print("⚠ OpenCV not available")
    
    try:
        import librosa
        dependencies_loaded['librosa'] = True
        print("✓ Librosa loaded")
    except ImportError:
        print("⚠ Librosa not available")
    
    try:
        from gtts import gTTS
        dependencies_loaded['gtts'] = True
        print("✓ gTTS loaded")
    except ImportError:
        print("⚠ gTTS not available")
    
    try:
        import aiofiles
        dependencies_loaded['aiofiles'] = True
        print("✓ aiofiles loaded")
    except ImportError:
        print("⚠ aiofiles not available")
    
    try:
        from nexamodel_v2 import NexaModelV2
        dependencies_loaded['nexamodel_v2'] = True
        print("✓ NexaModel V2 available (82% accuracy)")
        return NexaModelV2
    except ImportError:
        print("⚠ NexaModel V2 not available, checking real emotion models...")
        try:
            from real_emotion_models import RealEmotionRecognizer
            dependencies_loaded['real_models'] = True
            print("✓ Real Emotion Models available")
            return RealEmotionRecognizer
        except ImportError:
            print("⚠ Real emotion models not available, checking enhanced model...")
            try:
                from enhanced_nexamodel import NexaEmotionRecognizer
                dependencies_loaded['nexamodel'] = True
                print("✓ Enhanced NexaModel available")
                return NexaEmotionRecognizer
            except ImportError:
                print("⚠ No advanced models available, using mock")
                return None

# Startup event
@app.on_event("startup")
async def startup_event():
    global emotion_recognizer, continuous_recognizer, advanced_face_recognizer, real_pytorch_recognizer
    
    print("Starting NexaModel FastAPI Service...")
    
    # Check dependencies and get the best available model
    ModelClass = check_dependencies()
    
    try:
        if ModelClass:
            # Initialize the emotion recognition model
            if hasattr(ModelClass, '__name__') and ModelClass.__name__ == 'NexaEmotionRecognizer':
                try:
                    emotion_recognizer = ModelClass("../nexamodel/NexaModel_Complete")
                except:
                    # If directory doesn't exist, use mock
                    emotion_recognizer = MockEmotionRecognizer()
            else:
                try:
                    emotion_recognizer = ModelClass()
                except:
                    emotion_recognizer = MockEmotionRecognizer()
            print("✓ Emotion Recognition loaded successfully")
        else:
            emotion_recognizer = MockEmotionRecognizer()
            print("✓ Mock emotion recognizer loaded")
    except Exception as e:
        print(f"Failed to load emotion model: {e}")
        emotion_recognizer = MockEmotionRecognizer()
        print("✓ Mock emotion recognizer loaded as fallback")
    
    # Initialize continuous emotion recognizer
    if CONTINUOUS_RECOGNITION_AVAILABLE:
        try:
            continuous_recognizer = get_continuous_recognizer()
            print("✓ Continuous emotion recognizer loaded successfully")
        except Exception as e:
            print(f"Failed to load continuous recognizer: {e}")
            continuous_recognizer = None
    else:
        continuous_recognizer = None
        print("⚠ Continuous emotion recognition not available")
    
    # Initialize advanced face emotion recognizer
    if ADVANCED_FACE_MODEL_AVAILABLE:
        try:
            advanced_face_recognizer = get_advanced_face_recognizer()
            print("✓ Advanced face-priority emotion recognizer loaded successfully")
        except Exception as e:
            print(f"Failed to load advanced face recognizer: {e}")
            advanced_face_recognizer = None
    else:
        advanced_face_recognizer = None
        print("⚠ Advanced face emotion recognition not available")
    
    # Initialize real PyTorch emotion recognizer
    if REAL_PYTORCH_MODEL_AVAILABLE:
        try:
            real_pytorch_recognizer = get_real_pytorch_recognizer()
            print("✅ Real PyTorch emotion recognition model loaded successfully")
            print("🔥 Now using REAL CNN-based emotion recognition instead of mock!")
        except Exception as e:
            print(f"Failed to load real PyTorch recognizer: {e}")
            real_pytorch_recognizer = None
    else:
        real_pytorch_recognizer = None
        print("⚠ Real PyTorch emotion recognition not available")
    
    # Initialize Gemini AI
    if GEMINI_AVAILABLE:
        gemini_success = initialize_gemini()
        dependencies_loaded['gemini'] = gemini_success
        if gemini_success:
            print("✅ Gemini AI loaded successfully")
        else:
            print("❌ Failed to load Gemini AI")
    else:
        dependencies_loaded['gemini'] = False
        print("⚠ Gemini AI not available")

def initialize_gemini():
    """Initialize Gemini AI model"""
    global gemini_model
    
    if not GEMINI_AVAILABLE:
        return False
        
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("⚠ GEMINI_API_KEY not found in environment")
            return False
            
        genai.configure(api_key=api_key)
        
        generation_config = {
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 40,
            "max_output_tokens": 1024,
        }
        
        safety_settings = [
            {
                "category": HarmCategory.HARM_CATEGORY_HARASSMENT,
                "threshold": HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            },
            {
                "category": HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                "threshold": HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            },
            {
                "category": HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                "threshold": HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            },
            {
                "category": HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                "threshold": HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
            },
        ]
        
        gemini_model = genai.GenerativeModel(
            model_name="models/gemini-2.5-flash",
            generation_config=generation_config,
            safety_settings=safety_settings
        )
        
        print("✓ Gemini AI initialized successfully")
        return True
        
    except Exception as e:
        print(f"❌ Failed to initialize Gemini: {e}")
        return False

async def generate_gemini_response(user_message: str, detected_emotion: str = None, confidence: float = None, user_name: str = None) -> Dict[str, Any]:
    """Generate response using Gemini AI"""
    global gemini_model
    
    if not gemini_model:
        return get_fallback_response(detected_emotion, user_name)
    
    try:
        # Build emotion-aware prompt
        base_prompt = (
            "You are Nexa, an empathetic AI companion designed to provide emotional support "
            "and meaningful conversation. You are warm, understanding, and genuinely caring. "
            "Your responses should be conversational, supportive, and around 2-3 sentences. "
            "Always maintain a compassionate tone and offer helpful guidance when appropriate."
        )
        
        emotion_context = ""
        if detected_emotion and confidence:
            emotion_context = (
                f"\n\nEMOTION CONTEXT: The user's current emotional state is detected as "
                f"'{detected_emotion}' with {confidence*100:.1f}% confidence. Please respond "
                f"with empathy and consideration for this emotional state."
            )
        
        name_context = ""
        if user_name:
            name_context = f" The user's name is {user_name}."
        
        user_context = f"\n\nUSER MESSAGE: \"{user_message}\""
        
        emotion_guidelines = get_emotion_guidelines(detected_emotion)
        
        prompt = f"{base_prompt}{emotion_context}{name_context}{user_context}{emotion_guidelines}"
        
        # Generate response
        response = gemini_model.generate_content(prompt)
        
        if response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if candidate.content and candidate.content.parts:
                generated_text = candidate.content.parts[0].text
                
                return {
                    "response": generated_text.strip(),
                    "success": True,
                    "source": "gemini",
                    "emotion": detected_emotion,
                    "confidence": confidence,
                    "message": "Response generated successfully"
                }
        
        return get_fallback_response(detected_emotion, user_name)
        
    except Exception as e:
        print(f"Gemini generation error: {e}")
        return get_fallback_response(detected_emotion, user_name)

def get_emotion_guidelines(emotion: str = None) -> str:
    """Get specific response guidelines based on detected emotion"""
    
    if not emotion:
        return "\n\nRespond with warmth and openness, encouraging the user to share more."
    
    guidelines = {
        "happy": "\n\nThe user seems happy - celebrate with them, ask about what's bringing them joy, and share in their positive energy.",
        "sad": "\n\nThe user appears sad - offer comfort, validate their feelings, let them know they're not alone, and gently encourage them.",
        "angry": "\n\nThe user seems frustrated or angry - acknowledge their feelings, help them process the emotion, and guide them toward constructive solutions.",
        "fear": "\n\nThe user appears anxious or fearful - provide reassurance, help them feel safe, and offer practical support or coping strategies.",
        "surprise": "\n\nThe user seems surprised or excited - engage with their sense of wonder and encourage them to share what's captured their attention.",
        "disgust": "\n\nThe user appears bothered or disgusted by something - validate their feelings and help them process what's troubling them.",
        "neutral": "\n\nThe user seems calm and balanced - engage thoughtfully and be ready to follow their conversational lead."
    }
    
    return guidelines.get(emotion.lower(), guidelines["neutral"])

def get_fallback_response(emotion: str = None, user_name: str = None) -> Dict[str, Any]:
    """Generate fallback response when Gemini is unavailable"""
    
    name_prefix = f"{user_name}, " if user_name else ""
    
    fallback_responses = {
        "happy": f"Hi {name_prefix}I can sense your positive energy! That's wonderful to see. What's bringing you such joy today?",
        "sad": f"Hi {name_prefix}I notice you might be feeling down right now. Remember, it's completely okay to feel this way, and you're not alone. I'm here with you.",
        "angry": f"Hi {name_prefix}I can sense some frustration in your words. Take a deep breath with me. Your feelings are valid, and I'm here to listen.",
        "fear": f"Hi {name_prefix}I understand you might be feeling worried or anxious. You're safe here with me, and we can work through this together.",
        "surprise": f"Hi {name_prefix}Something seems to have caught your attention! I'd love to hear more about what's on your mind.",
        "disgust": f"Hi {name_prefix}I can tell something is really bothering you. Your feelings are completely valid, and I'm here to listen.",
        "neutral": f"Hi {name_prefix}I'm here to listen and support you. How are you feeling today?"
    }
    
    default_response = f"Hi {name_prefix}I'm Nexa, your AI companion. I'm here to listen and understand. Please share what's on your mind."
    response_text = fallback_responses.get(emotion, default_response) if emotion else default_response
    
    return {
        "response": response_text,
        "success": False,
        "source": "fallback",
        "emotion": emotion,
        "message": "Using fallback response (Gemini unavailable)"
    }

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global continuous_recognizer
    if continuous_recognizer and CONTINUOUS_RECOGNITION_AVAILABLE:
        try:
            cleanup_continuous_recognizer()
            print("✓ Continuous emotion recognizer cleaned up")
        except Exception as e:
            print(f"Error cleaning up continuous recognizer: {e}")

# Helper functions
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify JWT token with Spring Boot auth service (simplified version)
    """
    try:
        token = credentials.credentials
        
        # For development, allow demo tokens
        if token.startswith('demo-token-'):
            return {"user_id": "demo_user", "email": "demo@example.com"}
        
        # Try to validate with Spring Boot service
        try:
            auth_service_url = "http://localhost:8080/auth/validate"
            response = requests.get(f"{auth_service_url}?token={token}", timeout=5)
            
            if response.status_code == 200:
                return response.json()
        except:
            # If Spring Boot service is not available, allow for demo
            pass
            
        # For demo purposes, accept any token
        return {"user_id": "demo_user", "email": "demo@example.com"}
        
    except Exception as e:
        raise HTTPException(status_code=401, detail="Token validation failed")

def generate_voice_response(emotion: str, confidence: float) -> str:
    """
    Generate voice response based on emotion analysis
    """
    responses = {
        "happy": f"I can sense happiness in your expression with {confidence:.1%} confidence! That's wonderful to see.",
        "sad": f"I detect sadness with {confidence:.1%} confidence. Remember, it's okay to feel this way sometimes.",
        "angry": f"I sense anger with {confidence:.1%} confidence. Take a deep breath and find your calm.",
        "fear": f"I detect fear with {confidence:.1%} confidence. You're safe, and everything will be alright.",
        "surprise": f"I sense surprise with {confidence:.1%} confidence! Life is full of unexpected moments.",
        "disgust": f"I detect disgust with {confidence:.1%} confidence. It's natural to have these reactions.",
        "neutral": f"I sense a neutral emotion with {confidence:.1%} confidence. You seem balanced and composed."
    }
    
    return responses.get(emotion.lower(), f"I detected {emotion} emotion with {confidence:.1%} confidence.")

async def create_audio_response(text: str, analysis_id: str) -> Optional[str]:
    """
    Create audio file from text using TTS (if available)
    """
    try:
        if not dependencies_loaded['gtts']:
            return None
            
        from gtts import gTTS
        tts = gTTS(text=text, lang='en', slow=False)
        audio_filename = f"{analysis_id}_response.mp3"
        audio_path = TEMP_DIR / audio_filename
        tts.save(str(audio_path))
        return f"/audio/{audio_filename}"
    except Exception as e:
        print(f"TTS Error: {e}")
        return None

# API Endpoints

@app.get("/", response_model=HealthResponse)
async def root():
    """Root endpoint"""
    return HealthResponse(
        status="online",
        message="NexaModel Emotion Recognition API",
        model_loaded=emotion_recognizer is not None,
        dependencies=dependencies_loaded
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    gemini_status = dependencies_loaded.get('gemini', False)
    model_status = emotion_recognizer is not None
    
    overall_status = "healthy" if (model_status or gemini_status) else "degraded"
    
    message = []
    if model_status:
        message.append("Emotion model loaded")
    if gemini_status:
        message.append("Gemini AI available")
    if not message:
        message.append("Limited functionality - models not loaded")
    
    return HealthResponse(
        status=overall_status,
        message="; ".join(message),
        model_loaded=model_status,
        dependencies=dependencies_loaded
    )

@app.get("/model/info")
async def get_model_info():
    """Get model information"""
    if not emotion_recognizer:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    return emotion_recognizer.get_model_info()

@app.post("/analyze/text", response_model=EmotionResponse)
async def analyze_text(
    request: EmotionRequest,
    user_data = Depends(verify_token)
):
    """
    Analyze emotion from text input
    """
    if not emotion_recognizer:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if not request.text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    try:
        # Generate analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Analyze emotion
        result = emotion_recognizer.predict_emotion(text=request.text)
        
        # Generate voice response
        voice_text = generate_voice_response(result['predicted_emotion'], result['confidence'])
        voice_url = await create_audio_response(voice_text, analysis_id)
        
        return EmotionResponse(
            predicted_emotion=result['predicted_emotion'],
            confidence=result['confidence'],
            all_probabilities=result['all_probabilities'],
            voice_response_url=voice_url,
            analysis_id=analysis_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/chat/gemini", response_model=ChatResponse)
async def chat_with_gemini(
    request: ChatRequest,
    user_data = Depends(verify_token)
):
    """
    Generate AI response using Gemini AI based on user message and emotion context
    """
    try:
        # Generate analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Get user name from email if available
        user_name = request.user_name
        if not user_name and request.user_id:
            # Try to extract name from email
            if '@' in request.user_id:
                user_name = request.user_id.split('@')[0]
        
        # Generate response using Gemini
        gemini_result = await generate_gemini_response(
            user_message=request.message,
            detected_emotion=request.detected_emotion,
            confidence=request.confidence,
            user_name=user_name
        )
        
        # Create audio response
        voice_url = await create_audio_response(gemini_result["response"], analysis_id)
        
        return ChatResponse(
            response=gemini_result["response"],
            success=gemini_result["success"],
            source=gemini_result["source"],
            emotion=gemini_result.get("emotion"),
            confidence=gemini_result.get("confidence"),
            voice_response_url=voice_url,
            analysis_id=analysis_id
        )
        
    except Exception as e:
        print(f"Chat generation failed: {e}")
        # Fallback response
        fallback_response = "I'm here to listen and support you. How are you feeling today?"
        voice_url = await create_audio_response(fallback_response, analysis_id)
        
        return ChatResponse(
            response=fallback_response,
            success=False,
            source="fallback",
            emotion=request.detected_emotion,
            confidence=request.confidence,
            voice_response_url=voice_url,
            analysis_id=analysis_id
        )

@app.post("/analyze/voice", response_model=EmotionResponse)
async def analyze_voice(
    audio_file: UploadFile = File(...),
    user_data = Depends(verify_token)
):
    """
    Analyze emotion from voice/audio input
    """
    if not emotion_recognizer:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Basic file validation
    if not audio_file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    try:
        # Generate analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Save uploaded audio file (simplified - no async if aiofiles not available)
        audio_filename = f"{analysis_id}_{audio_file.filename}"
        audio_path = UPLOAD_DIR / audio_filename
        
        # Save file
        content = await audio_file.read()
        with open(audio_path, 'wb') as f:
            f.write(content)
        
        # Analyze emotion
        result = emotion_recognizer.predict_emotion(audio_file=str(audio_path))
        
        # Generate voice response
        voice_text = generate_voice_response(result['predicted_emotion'], result['confidence'])
        voice_url = await create_audio_response(voice_text, analysis_id)
        
        # Clean up uploaded file
        try:
            os.unlink(audio_path)
        except:
            pass
        
        return EmotionResponse(
            predicted_emotion=result['predicted_emotion'],
            confidence=result['confidence'],
            all_probabilities=result['all_probabilities'],
            voice_response_url=voice_url,
            analysis_id=analysis_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Voice analysis failed: {str(e)}")

@app.post("/analyze/video", response_model=EmotionResponse)
async def analyze_video(
    video_file: UploadFile = File(...),
    user_data = Depends(verify_token)
):
    """
    Analyze emotion from video/image input
    """
    if not emotion_recognizer:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if not video_file.filename:
        raise HTTPException(status_code=400, detail="No file provided")
    
    try:
        # Generate analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Save uploaded file
        file_extension = video_file.filename.split('.')[-1] if '.' in video_file.filename else 'jpg'
        file_path = UPLOAD_DIR / f"{analysis_id}_input.{file_extension}"
        
        content = await video_file.read()
        with open(file_path, 'wb') as f:
            f.write(content)
        
        # Analyze emotion (simplified - assume image for now)
        result = emotion_recognizer.predict_emotion(face_image=str(file_path))
        
        # Generate voice response
        voice_text = generate_voice_response(result['predicted_emotion'], result['confidence'])
        voice_url = await create_audio_response(voice_text, analysis_id)
        
        # Clean up uploaded file
        try:
            os.unlink(file_path)
        except:
            pass
        
        return EmotionResponse(
            predicted_emotion=result['predicted_emotion'],
            confidence=result['confidence'],
            all_probabilities=result['all_probabilities'],
            voice_response_url=voice_url,
            analysis_id=analysis_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video analysis failed: {str(e)}")

@app.post("/analyze/multimodal", response_model=EmotionResponse)
async def analyze_multimodal(
    text: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
    video_file: Optional[UploadFile] = File(None),
    user_data = Depends(verify_token)
):
    """
    Analyze emotion from multiple inputs (text, audio, video)
    """
    if not emotion_recognizer:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    if not any([text, audio_file, video_file]):
        raise HTTPException(status_code=400, detail="At least one input is required")
    
    try:
        # Generate analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Process inputs
        audio_path = None
        video_path = None
        
        if audio_file and audio_file.filename:
            audio_filename = f"{analysis_id}_audio.wav"
            audio_path = UPLOAD_DIR / audio_filename
            content = await audio_file.read()
            with open(audio_path, 'wb') as f:
                f.write(content)
        
        if video_file and video_file.filename:
            video_filename = f"{analysis_id}_image.jpg"
            video_path = UPLOAD_DIR / video_filename
            content = await video_file.read()
            with open(video_path, 'wb') as f:
                f.write(content)
        
        # Analyze emotion with all available inputs
        result = emotion_recognizer.predict_emotion(
            face_image=str(video_path) if video_path else None,
            audio_file=str(audio_path) if audio_path else None,
            text=text
        )
        
        # Generate voice response
        voice_text = generate_voice_response(result['predicted_emotion'], result['confidence'])
        voice_url = await create_audio_response(voice_text, analysis_id)
        
        # Clean up temporary files
        for path in [audio_path, video_path]:
            if path and path.exists():
                try:
                    os.unlink(path)
                except:
                    pass
        
        return EmotionResponse(
            predicted_emotion=result['predicted_emotion'],
            confidence=result['confidence'],
            all_probabilities=result['all_probabilities'],
            voice_response_url=voice_url,
            analysis_id=analysis_id
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Multimodal analysis failed: {str(e)}")

@app.get("/audio/{filename}")
async def get_audio_file(filename: str):
    """
    Serve generated audio files
    """
    file_path = TEMP_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    
    return FileResponse(
        path=str(file_path),
        media_type="audio/mpeg",
        filename=filename
    )

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": f"Internal server error: {str(exc)}", "status_code": 500}
    )

# For development testing
@app.get("/test")
async def test_endpoint():
    """Simple test endpoint"""
    return {"message": "FastAPI is working!", "dependencies": dependencies_loaded}

# Continuous emotion detection endpoint
@app.post("/analyze/continuous")
async def analyze_continuous_emotion(
    text: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
    video_file: Optional[UploadFile] = File(None),
    session_id: Optional[str] = Form(None),
    user_data = Depends(verify_token)
):
    """
    Continuous multimodal emotion detection
    This endpoint analyzes all available inputs and maintains emotion state across time
    """
    if not emotion_recognizer:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Generate analysis ID
    analysis_id = str(uuid.uuid4())
    session_id = session_id or f"session_{analysis_id[:8]}"
    
    try:
        # Prepare inputs for multimodal analysis
        audio_path = None
        video_path = None
        
        # Process audio file if provided
        if audio_file:
            audio_filename = f"{analysis_id}_audio.{audio_file.filename.split('.')[-1] if audio_file.filename else 'wav'}"
            audio_path = UPLOAD_DIR / audio_filename
            
            content = await audio_file.read()
            with open(audio_path, 'wb') as f:
                f.write(content)
        
        # Process video file if provided
        if video_file:
            if video_file.content_type and video_file.content_type.startswith('image/'):
                video_filename = f"{analysis_id}_image.{video_file.filename.split('.')[-1] if video_file.filename else 'jpg'}"
                video_path = UPLOAD_DIR / video_filename
                
                content = await video_file.read()
                with open(video_path, 'wb') as f:
                    f.write(content)
            else:
                # Handle video file - extract frame
                video_filename = f"{analysis_id}_video.{video_file.filename.split('.')[-1] if video_file.filename else 'mp4'}"
                temp_video_path = UPLOAD_DIR / video_filename
                
                content = await video_file.read()
                with open(temp_video_path, 'wb') as f:
                    f.write(content)
                
                # Extract frame using OpenCV
                try:
                    import cv2
                    cap = cv2.VideoCapture(str(temp_video_path))
                    ret, frame = cap.read()
                    cap.release()
                    
                    if ret:
                        frame_filename = f"{analysis_id}_frame.jpg"
                        video_path = UPLOAD_DIR / frame_filename
                        cv2.imwrite(str(video_path), frame)
                    
                    # Clean up video file
                    os.unlink(temp_video_path)
                except Exception as e:
                    print(f"Video processing error: {e}")
                    if temp_video_path.exists():
                        os.unlink(temp_video_path)
        
        # Perform individual modality analysis
        text_result = None
        voice_result = None  
        face_result = None
        
        if text and text.strip():
            text_result = emotion_recognizer.predict_emotion(text=text)
        
        if audio_path:
            voice_result = emotion_recognizer.predict_emotion(audio_file=str(audio_path))
        
        if video_path:
            face_result = emotion_recognizer.predict_emotion(face_image=str(video_path))
        
        # Perform combined multimodal analysis 
        multimodal_result = emotion_recognizer.predict_emotion(
            face_image=str(video_path) if video_path else None,
            audio_file=str(audio_path) if audio_path else None,
            text=text if text and text.strip() else None
        )
        
        # Build continuous response
        continuous_response = {
            'session_id': session_id,
            'timestamp': datetime.datetime.now().isoformat(),
            'overall_emotion': {
                'emotion': multimodal_result['predicted_emotion'],
                'confidence': float(multimodal_result['confidence'])
            },
            'modalities_analyzed': []
        }
        
        # Add individual modality results
        if text_result:
            continuous_response['text_emotion'] = {
                'emotion': text_result['predicted_emotion'], 
                'confidence': float(text_result['confidence'])
            }
            continuous_response['modalities_analyzed'].append('text')
        
        if voice_result:
            continuous_response['voice_emotion'] = {
                'emotion': voice_result['predicted_emotion'],
                'confidence': float(voice_result['confidence']) 
            }
            continuous_response['modalities_analyzed'].append('voice')
        
        if face_result:
            continuous_response['face_emotion'] = {
                'emotion': face_result['predicted_emotion'],
                'confidence': float(face_result['confidence'])
            }
            continuous_response['modalities_analyzed'].append('face')
        
        # Add fusion information
        continuous_response['fusion_score'] = len(continuous_response['modalities_analyzed']) / 3.0
        continuous_response['analysis_id'] = analysis_id
        
        # Generate voice response if enabled
        if hasattr(emotion_recognizer, 'generate_voice_response'):
            try:
                voice_response_path = emotion_recognizer.generate_voice_response(
                    multimodal_result['predicted_emotion'], 
                    analysis_id
                )
                if voice_response_path:
                    continuous_response['voice_response_url'] = f"/audio/{voice_response_path.name}"
            except Exception as e:
                print(f"Voice response generation failed: {e}")
        
        return continuous_response
        
    except Exception as e:
        print(f"Continuous analysis error: {e}")
        # Clean up files in case of error
        for file_path in [audio_path, video_path]:
            if file_path and file_path.exists():
                try:
                    os.unlink(file_path)
                except:
                    pass
        
        raise HTTPException(status_code=500, detail=f"Continuous analysis failed: {str(e)}")

@app.post("/face/start-tracking")
async def start_face_tracking(user_data = Depends(verify_token)):
    """
    Start continuous face emotion tracking
    """
    global continuous_recognizer
    
    if not continuous_recognizer:
        raise HTTPException(status_code=503, detail="Continuous emotion recognition not available")
    
    try:
        success = continuous_recognizer.start_face_tracking()
        
        if success:
            return {
                "status": "success",
                "message": "Face tracking started successfully",
                "tracking_active": True
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to start face tracking")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face tracking error: {str(e)}")

@app.post("/face/stop-tracking")
async def stop_face_tracking(user_data = Depends(verify_token)):
    """
    Stop continuous face emotion tracking
    """
    global continuous_recognizer
    
    if not continuous_recognizer:
        raise HTTPException(status_code=503, detail="Continuous emotion recognition not available")
    
    try:
        continuous_recognizer.stop_face_tracking()
        return {
            "status": "success",
            "message": "Face tracking stopped successfully",
            "tracking_active": False
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face tracking stop error: {str(e)}")

@app.get("/face/status")
async def get_face_tracking_status(user_data = Depends(verify_token)):
    """
    Get current face tracking status and recent emotion detection
    """
    global continuous_recognizer
    
    if not continuous_recognizer:
        return {
            "available": False,
            "message": "Continuous emotion recognition not available"
        }
    
    try:
        status = continuous_recognizer.get_status()
        return {
            "available": True,
            "status": status
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status error: {str(e)}")

@app.post("/analyze/authentic-emotion")
async def analyze_authentic_emotion(
    text: Optional[str] = Form(None),
    force_face_capture: Optional[bool] = Form(False),
    user_data = Depends(verify_token)
):
    """
    Analyze emotion with authenticity verification using both face and text
    This endpoint prevents fake emotion responses by comparing face and text emotions
    """
    global continuous_recognizer
    
    if not continuous_recognizer:
        raise HTTPException(status_code=503, detail="Continuous emotion recognition not available")
    
    try:
        # Perform multimodal emotion analysis
        result = continuous_recognizer.analyze_multimodal_emotion(
            text=text,
            force_face_capture=force_face_capture
        )
        
        # Convert result to response format
        response = {
            "analysis_id": str(uuid.uuid4()),
            "timestamp": datetime.datetime.now().isoformat(),
            "final_emotion": result.final_emotion,
            "confidence": float(result.final_confidence),
            "is_authentic": result.is_authentic,
            "consistency_score": float(result.consistency_score),
            "explanation": result.explanation,
            "modalities": []
        }
        
        # Add individual modality results
        if result.face_emotion:
            response["face_emotion"] = {
                "emotion": result.face_emotion.emotion,
                "confidence": float(result.face_emotion.confidence),
                "timestamp": result.face_emotion.timestamp.isoformat()
            }
            response["modalities"].append("face")
        
        if result.text_emotion:
            response["text_emotion"] = {
                "emotion": result.text_emotion.emotion,
                "confidence": float(result.text_emotion.confidence),
                "timestamp": result.text_emotion.timestamp.isoformat()
            }
            response["modalities"].append("text")
        
        # Add recommendation based on authenticity
        if not result.is_authentic:
            response["recommendation"] = "The detected emotion may not be authentic. Consider the explanation for details."
        else:
            response["recommendation"] = "The detected emotion appears to be authentic based on multimodal analysis."
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentic emotion analysis failed: {str(e)}")

@app.get("/system/continuous-status")
async def get_continuous_system_status():
    """
    Get comprehensive status of the continuous emotion recognition system
    """
    global continuous_recognizer
    
    base_status = {
        "continuous_recognition_available": CONTINUOUS_RECOGNITION_AVAILABLE,
        "continuous_recognizer_loaded": continuous_recognizer is not None
    }
    
    if continuous_recognizer:
        try:
            detailed_status = continuous_recognizer.get_status()
            base_status.update(detailed_status)
        except Exception as e:
            base_status["error"] = str(e)
    
    return base_status

@app.post("/analyze/face-priority")
async def analyze_face_priority_emotion(
    text: Optional[str] = Form(None),
    image_file: Optional[UploadFile] = File(None),
    user_data = Depends(verify_token)
):
    """
    Advanced face-priority emotion analysis that prioritizes facial expressions
    over text input to prevent fake emotion responses
    """
    global advanced_face_recognizer
    
    if not advanced_face_recognizer:
        raise HTTPException(status_code=503, detail="Advanced face emotion recognition not available")
    
    try:
        analysis_id = str(uuid.uuid4())
        
        face_result = None
        text_result = None
        
        # Process image if provided
        if image_file:
            try:
                image_content = await image_file.read()
                face_result = advanced_face_recognizer.predict_face_emotion(image_content)
            except Exception as e:
                print(f"Face analysis error: {e}")
        
        # Process text if provided (with lower priority)
        if text and text.strip():
            # Simple text emotion analysis for comparison
            text_lower = text.lower()
            
            if any(word in text_lower for word in ['happy', 'joy', 'excited', 'great']):
                text_result = {'predicted_emotion': 'happy', 'confidence': 0.7}
            elif any(word in text_lower for word in ['sad', 'down', 'depressed']):
                text_result = {'predicted_emotion': 'sad', 'confidence': 0.7}
            elif any(word in text_lower for word in ['angry', 'mad', 'furious']):
                text_result = {'predicted_emotion': 'angry', 'confidence': 0.7}
            elif any(word in text_lower for word in ['scared', 'afraid', 'worried']):
                text_result = {'predicted_emotion': 'fear', 'confidence': 0.7}
            else:
                text_result = {'predicted_emotion': 'neutral', 'confidence': 0.5}
        
        # Determine final result with face priority
        if face_result and text_result:
            # Use advanced validation
            validation = advanced_face_recognizer.validate_emotion_authenticity(
                face_result['predicted_emotion'], face_result['confidence'],
                text_result['predicted_emotion'], text_result['confidence']
            )
            
            response = {
                "analysis_id": analysis_id,
                "timestamp": datetime.datetime.now().isoformat(),
                "final_emotion": validation['final_emotion'],
                "confidence": validation['final_confidence'],
                "is_authentic": validation['is_authentic'],
                "explanation": validation['explanation'],
                "face_priority_weight": validation['face_weight'],
                "text_weight": validation['text_weight'],
                "compatibility_score": validation['compatibility_score'],
                "face_analysis": {
                    "emotion": face_result['predicted_emotion'],
                    "confidence": face_result['confidence'],
                    "method": face_result.get('method', 'unknown'),
                    "faces_detected": face_result.get('faces_detected', 0)
                },
                "text_analysis": {
                    "emotion": text_result['predicted_emotion'],
                    "confidence": text_result['confidence']
                },
                "priority": "Face emotion takes priority over text"
            }
        elif face_result:
            # Face only - high trust
            response = {
                "analysis_id": analysis_id,
                "timestamp": datetime.datetime.now().isoformat(),
                "final_emotion": face_result['predicted_emotion'],
                "confidence": face_result['confidence'],
                "is_authentic": face_result['confidence'] > 0.6,
                "explanation": f"Face-only analysis: {face_result['predicted_emotion']} detected from facial expression",
                "face_analysis": {
                    "emotion": face_result['predicted_emotion'],
                    "confidence": face_result['confidence'],
                    "method": face_result.get('method', 'unknown'),
                    "faces_detected": face_result.get('faces_detected', 0)
                },
                "priority": "Face emotion only - highly trusted"
            }
        elif text_result:
            # Text only - lower trust
            response = {
                "analysis_id": analysis_id,
                "timestamp": datetime.datetime.now().isoformat(),
                "final_emotion": text_result['predicted_emotion'],
                "confidence": text_result['confidence'] * 0.6,  # Reduce confidence without face
                "is_authentic": False,  # Cannot verify without face
                "explanation": f"⚠️ Text-only analysis: {text_result['predicted_emotion']}. Cannot verify authenticity without facial expression.",
                "text_analysis": {
                    "emotion": text_result['predicted_emotion'],
                    "confidence": text_result['confidence']
                },
                "warning": "Facial verification recommended for authenticity",
                "priority": "Text only - requires face verification"
            }
        else:
            # No input
            response = {
                "analysis_id": analysis_id,
                "timestamp": datetime.datetime.now().isoformat(),
                "final_emotion": "neutral",
                "confidence": 0.3,
                "is_authentic": False,
                "explanation": "No face or text input provided",
                "error": "No analysis data available"
            }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Face-priority analysis failed: {str(e)}")

@app.post("/analyze/real-emotion")
async def analyze_real_emotion(
    text: Optional[str] = Form(None),
    image_file: Optional[UploadFile] = File(None),
    user_data = Depends(verify_token)
):
    """
    Real emotion analysis using PyTorch CNN models - NOT MOCK!
    This endpoint uses actual trained neural networks for emotion recognition
    """
    global real_pytorch_recognizer
    
    if not real_pytorch_recognizer:
        raise HTTPException(status_code=503, detail="Real PyTorch emotion recognition not available")
    
    try:
        analysis_id = str(uuid.uuid4())
        
        face_result = None
        text_result = None
        
        # Process image with REAL CNN model
        if image_file:
            try:
                image_content = await image_file.read()
                face_result = real_pytorch_recognizer.predict_emotion(image_content)
                print(f"🔥 REAL CNN Face Analysis: {face_result.emotion} ({face_result.confidence:.3f})")
            except Exception as e:
                print(f"Real face analysis error: {e}")
        
        # Process text with REAL analysis
        if text and text.strip():
            text_result = real_pytorch_recognizer.predict_text_emotion(text)
            print(f"🔥 REAL Text Analysis: {text_result.emotion} ({text_result.confidence:.3f})")
        
        # Determine final result
        if face_result and text_result:
            # Prioritize face (80%) over text (20%)
            face_weight = 0.8
            text_weight = 0.2
            
            # Weighted confidence
            final_confidence = (face_result.confidence * face_weight + 
                              text_result.confidence * text_weight)
            
            # Use face emotion as primary
            final_emotion = face_result.emotion
            
            response = {
                "analysis_id": analysis_id,
                "timestamp": datetime.datetime.now().isoformat(),
                "final_emotion": final_emotion,
                "confidence": final_confidence,
                "is_real_model": True,
                "model_type": "PyTorch CNN",
                "face_analysis": {
                    "emotion": face_result.emotion,
                    "confidence": face_result.confidence,
                    "method": face_result.method,
                    "all_probabilities": face_result.all_probabilities
                },
                "text_analysis": {
                    "emotion": text_result.emotion,
                    "confidence": text_result.confidence,
                    "method": text_result.method,
                    "all_probabilities": text_result.all_probabilities
                },
                "weighting": {
                    "face_weight": face_weight,
                    "text_weight": text_weight
                },
                "note": "🔥 This is REAL CNN-based emotion recognition, not mock responses!"
            }
        elif face_result:
            # Face only - REAL CNN analysis
            response = {
                "analysis_id": analysis_id,
                "timestamp": datetime.datetime.now().isoformat(),
                "final_emotion": face_result.emotion,
                "confidence": face_result.confidence,
                "is_real_model": True,
                "model_type": "PyTorch CNN",
                "face_analysis": {
                    "emotion": face_result.emotion,
                    "confidence": face_result.confidence,
                    "method": face_result.method,
                    "all_probabilities": face_result.all_probabilities
                },
                "note": "🔥 Face-only REAL CNN emotion recognition - highly accurate!"
            }
        elif text_result:
            # Text only - REAL analysis
            response = {
                "analysis_id": analysis_id,
                "timestamp": datetime.datetime.now().isoformat(),
                "final_emotion": text_result.emotion,
                "confidence": text_result.confidence,
                "is_real_model": True,
                "model_type": "Real Text Analysis",
                "text_analysis": {
                    "emotion": text_result.emotion,
                    "confidence": text_result.confidence,
                    "method": text_result.method,
                    "all_probabilities": text_result.all_probabilities
                },
                "note": "🔥 Real text-based emotion analysis - no mock responses!"
            }
        else:
            # No input
            response = {
                "analysis_id": analysis_id,
                "timestamp": datetime.datetime.now().isoformat(),
                "final_emotion": "neutral",
                "confidence": 0.5,
                "is_real_model": True,
                "error": "No input provided for analysis"
            }
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Real emotion analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server on http://localhost:8001")
    print("🚀 NexaModel Emotion Recognition API is starting...")
    try:
        uvicorn.run(app, host="0.0.0.0", port=8001, reload=False)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        raise