"""
NexaModel FastAPI Service
========================

This FastAPI service provides emotion recognition endpoints using the trained NexaModel.
It handles multimodal input (face, voice, text) and returns emotion analysis with voice response.

Author: Nexaa AI Team
Version: 1.0.0
"""

import os
import io
import tempfile
import uuid
import asyncio
from typing import Optional, Dict, Any, List
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import requests

# Optional imports with fallbacks
try:
    import numpy as np
except ImportError:
    print("Warning: numpy not installed. Install with: pip install numpy")
    np = None

try:
    import cv2
except ImportError:
    print("Warning: opencv-python not installed. Install with: pip install opencv-python")
    cv2 = None

try:
    import librosa
except ImportError:
    print("Warning: librosa not installed. Install with: pip install librosa")
    librosa = None

try:
    import aiofiles
except ImportError:
    print("Warning: aiofiles not installed. Install with: pip install aiofiles")
    aiofiles = None

try:
    from gtts import gTTS
except ImportError:
    print("Warning: gTTS not installed. Install with: pip install gtts")
    gTTS = None

try:
    from jose import jwt, JWTError
except ImportError:
    print("Warning: python-jose not installed. Install with: pip install python-jose[cryptography]")
    jwt = None
    JWTError = None

# Import the enhanced NexaModel with fallback
try:
    from enhanced_nexamodel import NexaEmotionRecognizer
except ImportError:
    print("Warning: Enhanced NexaModel not available. Using mock implementation.")
    NexaEmotionRecognizer = None

# Initialize FastAPI app
app = FastAPI(
    title="NexaModel Emotion Recognition API",
    description="Multimodal emotion recognition service for voice, video, and text analysis",
    version="1.0.0"
)

# Configure CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Configuration
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "./uploads"))
TEMP_DIR = Path(os.getenv("TEMP_DIR", "./temp"))
MODEL_DIR = Path(os.getenv("MODEL_DIR", "../nexamodel/NexaModel_Complete"))
SPRING_BOOT_AUTH_URL = os.getenv("SPRING_BOOT_AUTH_URL", "http://localhost:8080")

# Create directories
UPLOAD_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)

# Initialize emotion recognizer
emotion_recognizer = None

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

# Startup event
@app.on_event("startup")
async def startup_event():
    global emotion_recognizer
    try:
        # Check if model directory exists
        if not MODEL_DIR.exists():
            print(f"Model directory not found: {MODEL_DIR}")
            print("Please ensure the trained model files are in the correct location")
            emotion_recognizer = None
        else:
            emotion_recognizer = NexaEmotionRecognizer(str(MODEL_DIR))
            print("✓ NexaModel loaded successfully")
    except Exception as e:
        print(f"Failed to load NexaModel: {e}")
        emotion_recognizer = None

# Helper functions
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify JWT token with Spring Boot auth service
    """
    try:
        token = credentials.credentials
        
        # Validate token with Spring Boot service
        auth_service_url = f"{SPRING_BOOT_AUTH_URL}/auth/validate"
        response = requests.get(f"{auth_service_url}?token={token}")
        
        if response.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        return response.json()
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

async def create_audio_response(text: str, analysis_id: str) -> str:
    """
    Create audio file from text using TTS
    """
    try:
        tts = gTTS(text=text, lang='en', slow=False)
        audio_filename = f"{analysis_id}_response.mp3"
        audio_path = TEMP_DIR / audio_filename
        tts.save(str(audio_path))
        return f"/api/audio/{audio_filename}"
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
        model_loaded=emotion_recognizer is not None
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy" if emotion_recognizer else "degraded",
        message="Service is running" if emotion_recognizer else "Model not loaded",
        model_loaded=emotion_recognizer is not None
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
    
    if not audio_file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="Audio file required")
    
    try:
        # Generate analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Save uploaded audio file
        audio_filename = f"{analysis_id}_{audio_file.filename}"
        audio_path = UPLOAD_DIR / audio_filename
        
        async with aiofiles.open(audio_path, 'wb') as f:
            content = await audio_file.read()
            await f.write(content)
        
        # Analyze emotion
        result = emotion_recognizer.predict_emotion(audio_file=str(audio_path))
        
        # Generate voice response
        voice_text = generate_voice_response(result['predicted_emotion'], result['confidence'])
        voice_url = await create_audio_response(voice_text, analysis_id)
        
        # Clean up uploaded file
        os.unlink(audio_path)
        
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
    
    if not (video_file.content_type.startswith('video/') or video_file.content_type.startswith('image/')):
        raise HTTPException(status_code=400, detail="Video or image file required")
    
    try:
        # Generate analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Save uploaded file
        file_extension = video_file.filename.split('.')[-1]
        file_path = UPLOAD_DIR / f"{analysis_id}_input.{file_extension}"
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await video_file.read()
            await f.write(content)
        
        # Process based on file type
        if video_file.content_type.startswith('image/'):
            # Direct image analysis
            result = emotion_recognizer.predict_emotion(face_image=str(file_path))
        else:
            # Extract frame from video
            cap = cv2.VideoCapture(str(file_path))
            ret, frame = cap.read()
            cap.release()
            
            if not ret:
                raise HTTPException(status_code=400, detail="Could not process video file")
            
            # Save frame
            frame_path = UPLOAD_DIR / f"{analysis_id}_frame.jpg"
            cv2.imwrite(str(frame_path), frame)
            
            # Analyze frame
            result = emotion_recognizer.predict_emotion(face_image=str(frame_path))
            
            # Clean up frame file
            os.unlink(frame_path)
        
        # Generate voice response
        voice_text = generate_voice_response(result['predicted_emotion'], result['confidence'])
        voice_url = await create_audio_response(voice_text, analysis_id)
        
        # Clean up uploaded file
        os.unlink(file_path)
        
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
        
        # Prepare inputs
        audio_path = None
        video_path = None
        
        # Process audio file
        if audio_file:
            audio_filename = f"{analysis_id}_audio.{audio_file.filename.split('.')[-1]}"
            audio_path = UPLOAD_DIR / audio_filename
            
            async with aiofiles.open(audio_path, 'wb') as f:
                content = await audio_file.read()
                await f.write(content)
        
        # Process video file
        if video_file:
            if video_file.content_type.startswith('image/'):
                video_filename = f"{analysis_id}_image.{video_file.filename.split('.')[-1]}"
                video_path = UPLOAD_DIR / video_filename
                
                async with aiofiles.open(video_path, 'wb') as f:
                    content = await video_file.read()
                    await f.write(content)
            else:
                # Extract frame from video
                video_filename = f"{analysis_id}_video.{video_file.filename.split('.')[-1]}"
                temp_video_path = UPLOAD_DIR / video_filename
                
                async with aiofiles.open(temp_video_path, 'wb') as f:
                    content = await video_file.read()
                    await f.write(content)
                
                # Extract frame
                cap = cv2.VideoCapture(str(temp_video_path))
                ret, frame = cap.read()
                cap.release()
                
                if ret:
                    frame_filename = f"{analysis_id}_frame.jpg"
                    video_path = UPLOAD_DIR / frame_filename
                    cv2.imwrite(str(video_path), frame)
                
                # Clean up video file
                os.unlink(temp_video_path)
        
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
        if audio_path and audio_path.exists():
            os.unlink(audio_path)
        if video_path and video_path.exists():
            os.unlink(video_path)
        
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
        content={"error": "Internal server error", "status_code": 500}
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)