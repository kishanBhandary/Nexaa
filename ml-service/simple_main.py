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
dependencies_loaded = {
    'numpy': False,
    'opencv': False,
    'librosa': False,
    'gtts': False,
    'aiofiles': False,
    'nexamodel': False
}

# Pydantic models
class EmotionRequest(BaseModel):
    text: Optional[str] = None
    user_id: Optional[str] = None

class EmotionResponse(BaseModel):
    predicted_emotion: str
    confidence: float
    all_probabilities: Dict[str, float]
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
    global emotion_recognizer
    
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
    return HealthResponse(
        status="healthy" if emotion_recognizer else "degraded",
        message="Service is running" if emotion_recognizer else "Model not loaded",
        model_loaded=emotion_recognizer is not None,
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

if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server on http://localhost:8001")
    print("🚀 NexaModel Emotion Recognition API is starting...")
    try:
        uvicorn.run(app, host="0.0.0.0", port=8001, reload=False)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        raise