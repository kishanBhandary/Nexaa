"""
Continuous Multimodal Emotion Recognition System
==============================================

This module provides continuous emotion recognition that:
1. Captures face emotions in real-time from webcam
2. Analyzes text input emotions
3. Combines both modalities for accurate emotion detection
4. Prevents fake emotion responses by cross-validating face and text

Author: Nexaa AI Team
Version: 3.0.0
"""

import cv2
import numpy as np
import torch
import threading
import time
import queue
import json
import logging
from typing import Dict, Any, Optional, Tuple, List
from dataclasses import dataclass
from datetime import datetime, timedelta
import asyncio

# Import existing models
try:
    from real_emotion_models import RealEmotionRecognizer
    REAL_MODELS_AVAILABLE = True
except ImportError:
    REAL_MODELS_AVAILABLE = False
    print("Real models not available, using enhanced fallback")

# Import advanced face emotion model
try:
    from advanced_face_emotion_model import get_advanced_face_recognizer
    ADVANCED_FACE_MODEL_AVAILABLE = True
except ImportError:
    ADVANCED_FACE_MODEL_AVAILABLE = False
    print("Advanced face model not available")

logger = logging.getLogger(__name__)

@dataclass
class EmotionResult:
    """Data class for emotion recognition results"""
    emotion: str
    confidence: float
    probabilities: Dict[str, float]
    timestamp: datetime
    modality: str
    
@dataclass
class MultimodalResult:
    """Data class for combined multimodal results"""
    final_emotion: str
    final_confidence: float
    face_emotion: Optional[EmotionResult]
    text_emotion: Optional[EmotionResult]
    audio_emotion: Optional[EmotionResult]
    consistency_score: float
    is_authentic: bool
    explanation: str

class ContinuousEmotionRecognizer:
    """
    Continuous emotion recognition system with face tracking and text analysis
    """
    
    def __init__(self):
        self.emotion_labels = ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral']
        
        # Initialize the base emotion recognizer
        if ADVANCED_FACE_MODEL_AVAILABLE:
            self.face_recognizer = get_advanced_face_recognizer()
            logger.info("✅ Using Advanced Face-Priority Emotion Model")
        else:
            self.face_recognizer = None
            logger.warning("⚠️ Advanced face model not available")
        
        if REAL_MODELS_AVAILABLE:
            self.text_recognizer = RealEmotionRecognizer()
        else:
            self.text_recognizer = self._create_fallback_recognizer()
        
        # Face tracking variables
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.cap = None
        self.face_tracking_active = False
        self.face_emotion_history = queue.Queue(maxsize=10)  # Store last 10 face emotions
        
        # Threading for continuous face detection
        self.face_thread = None
        self.stop_face_tracking = threading.Event()
        
        # Emotion consistency tracking
        self.emotion_history = []
        self.max_history_length = 30  # Keep 30 seconds of history at 1fps
        
        # Configuration
        self.face_detection_interval = 1.0  # Detect face every 1 second
        self.consistency_threshold = 0.6  # Threshold for emotion consistency
        self.authenticity_threshold = 0.7  # Threshold for authentic emotion detection
        
        logger.info("✅ Continuous Emotion Recognizer initialized")
    
    def _create_fallback_recognizer(self):
        """Create a fallback recognizer when real models aren't available"""
        class FallbackRecognizer:
            def __init__(self):
                self.emotion_labels = ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral']
            
            def predict_text_emotion(self, text):
                return self._enhanced_keyword_emotion_detection(text)
            
            def predict_face_emotion(self, image_data):
                return {
                    'predicted_emotion': 'neutral',
                    'confidence': 0.6,
                    'all_probabilities': {emotion: 1/7 for emotion in self.emotion_labels},
                    'method': 'fallback'
                }
            
            def _enhanced_keyword_emotion_detection(self, text):
                """Enhanced keyword-based emotion detection"""
                text_lower = text.lower()
                
                emotion_keywords = {
                    'happy': ['happy', 'joy', 'excited', 'great', 'wonderful', 'love', 'amazing', 'fantastic'],
                    'sad': ['sad', 'down', 'depressed', 'awful', 'terrible', 'hurt', 'cry', 'upset'],
                    'angry': ['angry', 'mad', 'furious', 'hate', 'annoyed', 'frustrated', 'rage'],
                    'fear': ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'terrified'],
                    'surprise': ['surprised', 'shocked', 'amazed', 'wow', 'incredible'],
                    'disgust': ['disgusted', 'gross', 'nasty', 'revolting', 'sick']
                }
                
                emotion_scores = {}
                for emotion, keywords in emotion_keywords.items():
                    score = sum(1 for keyword in keywords if keyword in text_lower)
                    emotion_scores[emotion] = score
                
                emotion_scores['neutral'] = 0.5
                
                if max(emotion_scores.values()) == 0:
                    predicted_emotion = 'neutral'
                    confidence = 0.6
                else:
                    predicted_emotion = max(emotion_scores, key=emotion_scores.get)
                    confidence = min(0.7 + emotion_scores[predicted_emotion] * 0.1, 0.95)
                
                # Create probability distribution
                total_score = sum(emotion_scores.values()) + 1
                probabilities = {emotion: (emotion_scores.get(emotion, 0.1) + 0.1) / total_score 
                               for emotion in self.emotion_labels}
                
                return {
                    'predicted_emotion': predicted_emotion,
                    'confidence': confidence,
                    'all_probabilities': probabilities,
                    'method': 'keyword_analysis'
                }
        
        return FallbackRecognizer()
    
    def start_face_tracking(self) -> bool:
        """Start continuous face emotion tracking"""
        try:
            if self.face_tracking_active:
                logger.info("Face tracking already active")
                return True
            
            # Initialize camera
            self.cap = cv2.VideoCapture(0)
            if not self.cap.isOpened():
                logger.error("Failed to open camera")
                return False
            
            # Set camera properties for better performance
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.cap.set(cv2.CAP_PROP_FPS, 30)
            
            # Start face tracking thread
            self.stop_face_tracking.clear()
            self.face_thread = threading.Thread(target=self._face_tracking_loop, daemon=True)
            self.face_thread.start()
            
            self.face_tracking_active = True
            logger.info("✅ Face tracking started successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to start face tracking: {e}")
            return False
    
    def stop_face_tracking(self):
        """Stop continuous face emotion tracking"""
        try:
            if not self.face_tracking_active:
                return
            
            self.stop_face_tracking.set()
            
            if self.face_thread:
                self.face_thread.join(timeout=5)
            
            if self.cap:
                self.cap.release()
                self.cap = None
            
            self.face_tracking_active = False
            logger.info("✅ Face tracking stopped")
            
        except Exception as e:
            logger.error(f"❌ Error stopping face tracking: {e}")
    
    def _face_tracking_loop(self):
        """Main loop for continuous face emotion detection"""
        last_detection_time = 0
        
        while not self.stop_face_tracking.is_set():
            try:
                current_time = time.time()
                
                # Check if it's time for next detection
                if current_time - last_detection_time < self.face_detection_interval:
                    time.sleep(0.1)
                    continue
                
                # Capture frame
                ret, frame = self.cap.read()
                if not ret:
                    continue
                
                # Detect and analyze face emotion
                face_result = self._detect_face_emotion(frame)
                if face_result:
                    # Add to face emotion history
                    if not self.face_emotion_history.full():
                        self.face_emotion_history.put(face_result)
                    else:
                        # Remove oldest and add new
                        try:
                            self.face_emotion_history.get_nowait()
                        except queue.Empty:
                            pass
                        self.face_emotion_history.put(face_result)
                
                last_detection_time = current_time
                
            except Exception as e:
                logger.error(f"Error in face tracking loop: {e}")
                time.sleep(1)
    
    def _detect_face_emotion(self, frame) -> Optional[EmotionResult]:
        """Detect emotion from a single frame using advanced face recognition"""
        try:
            if self.face_recognizer:
                # Use advanced face emotion recognition
                face_result = self.face_recognizer.predict_face_emotion(frame)
            else:
                # Fallback to basic analysis
                face_result = self._basic_face_analysis(frame)
            
            return EmotionResult(
                emotion=face_result['predicted_emotion'],
                confidence=face_result['confidence'],
                probabilities=face_result['all_probabilities'],
                timestamp=datetime.now(),
                modality='face'
            )
            
        except Exception as e:
            logger.error(f"Error detecting face emotion: {e}")
            return None
    
    def _basic_face_analysis(self, frame) -> Dict[str, Any]:
        """Basic face analysis fallback"""
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            return {
                'predicted_emotion': 'neutral',
                'confidence': 0.3,
                'all_probabilities': {emotion: 1/7 for emotion in self.emotion_labels}
            }
        
        # Basic emotion based on face brightness and contrast
        (x, y, w, h) = faces[0]
        face_roi = gray[y:y+h, x:x+w]
        
        mean_intensity = np.mean(face_roi)
        std_intensity = np.std(face_roi)
        
        if mean_intensity > 120 and std_intensity > 20:
            emotion = 'happy'
            confidence = 0.7
        elif mean_intensity < 80:
            emotion = 'sad'
            confidence = 0.65
        elif std_intensity > 30:
            emotion = 'surprise'
            confidence = 0.6
        else:
            emotion = 'neutral'
            confidence = 0.5
        
        probabilities = {e: 0.1 for e in self.emotion_labels}
        probabilities[emotion] = confidence
        
        # Normalize
        total = sum(probabilities.values())
        probabilities = {k: v/total for k, v in probabilities.items()}
        
        return {
            'predicted_emotion': emotion,
            'confidence': confidence,
            'all_probabilities': probabilities
        }
    
    def get_recent_face_emotion(self) -> Optional[EmotionResult]:
        """Get the most recent face emotion detection"""
        if self.face_emotion_history.empty():
            return None
        
        # Get all current face emotions and return the most recent
        face_emotions = []
        while not self.face_emotion_history.empty():
            try:
                emotion = self.face_emotion_history.get_nowait()
                face_emotions.append(emotion)
            except queue.Empty:
                break
        
        # Put them back
        for emotion in face_emotions:
            if not self.face_emotion_history.full():
                self.face_emotion_history.put(emotion)
        
        if face_emotions:
            return max(face_emotions, key=lambda x: x.timestamp)
        
        return None
    
    def get_face_emotion_consensus(self) -> Optional[Dict[str, Any]]:
        """Get consensus emotion from recent face detections"""
        face_emotions = []
        
        # Get all current face emotions
        temp_queue = queue.Queue()
        while not self.face_emotion_history.empty():
            try:
                emotion = self.face_emotion_history.get_nowait()
                face_emotions.append(emotion)
                temp_queue.put(emotion)
            except queue.Empty:
                break
        
        # Put them back
        self.face_emotion_history = temp_queue
        
        if not face_emotions:
            return None
        
        # Filter emotions from last 10 seconds
        cutoff_time = datetime.now() - timedelta(seconds=10)
        recent_emotions = [e for e in face_emotions if e.timestamp > cutoff_time]
        
        if not recent_emotions:
            return None
        
        # Calculate consensus
        emotion_counts = {}
        total_confidence = 0
        
        for emotion_result in recent_emotions:
            emotion = emotion_result.emotion
            confidence = emotion_result.confidence
            
            if emotion not in emotion_counts:
                emotion_counts[emotion] = []
            emotion_counts[emotion].append(confidence)
            total_confidence += confidence
        
        # Find dominant emotion
        consensus_emotion = max(emotion_counts.keys(), 
                              key=lambda x: len(emotion_counts[x]))
        
        # Calculate average confidence for consensus emotion
        avg_confidence = np.mean(emotion_counts[consensus_emotion])
        
        # Calculate stability score (how consistent the emotions are)
        stability_score = len(emotion_counts[consensus_emotion]) / len(recent_emotions)
        
        return {
            'emotion': consensus_emotion,
            'confidence': float(avg_confidence),
            'stability_score': float(stability_score),
            'sample_count': len(recent_emotions),
            'emotion_distribution': {k: len(v) for k, v in emotion_counts.items()}
        }
    
    def analyze_text_emotion(self, text: str) -> EmotionResult:
        """Analyze emotion from text input"""
        try:
            if self.text_recognizer and hasattr(self.text_recognizer, 'predict_text_emotion'):
                text_result = self.text_recognizer.predict_text_emotion(text)
            else:
                # Fallback text analysis
                text_result = self._simple_text_analysis(text)
            
            return EmotionResult(
                emotion=text_result['predicted_emotion'],
                confidence=text_result['confidence'],
                probabilities=text_result['all_probabilities'],
                timestamp=datetime.now(),
                modality='text'
            )
            
        except Exception as e:
            logger.error(f"Error analyzing text emotion: {e}")
            return EmotionResult(
                emotion='neutral',
                confidence=0.5,
                probabilities={emotion: 1/7 for emotion in self.emotion_labels},
                timestamp=datetime.now(),
                modality='text'
            )
    
    def _simple_text_analysis(self, text: str) -> Dict[str, Any]:
        """Simple text emotion analysis fallback"""
        # Basic keyword matching
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['happy', 'joy', 'excited', 'great', 'wonderful']):
            return {'predicted_emotion': 'happy', 'confidence': 0.8, 
                   'all_probabilities': {'happy': 0.8, 'neutral': 0.2}}
        elif any(word in text_lower for word in ['sad', 'down', 'depressed', 'awful']):
            return {'predicted_emotion': 'sad', 'confidence': 0.8,
                   'all_probabilities': {'sad': 0.8, 'neutral': 0.2}}
        elif any(word in text_lower for word in ['angry', 'mad', 'furious', 'hate']):
            return {'predicted_emotion': 'angry', 'confidence': 0.8,
                   'all_probabilities': {'angry': 0.8, 'neutral': 0.2}}
        else:
            return {'predicted_emotion': 'neutral', 'confidence': 0.6,
                   'all_probabilities': {emotion: 1/7 for emotion in self.emotion_labels}}
    
    def analyze_multimodal_emotion(self, text: str = None, 
                                 force_face_capture: bool = False) -> MultimodalResult:
        """
        Analyze emotion using both face and text with authenticity checking
        """
        face_emotion = None
        text_emotion = None
        
        # Get face emotion
        if self.face_tracking_active:
            face_emotion = self.get_recent_face_emotion()
            if not face_emotion and force_face_capture:
                # Try to capture a single frame
                if self.cap and self.cap.isOpened():
                    ret, frame = self.cap.read()
                    if ret:
                        face_emotion = self._detect_face_emotion(frame)
        
        # Get text emotion
        if text and text.strip():
            text_emotion = self.analyze_text_emotion(text)
        
        # Combine and validate emotions
        return self._combine_and_validate_emotions(face_emotion, text_emotion)
    
    def _combine_and_validate_emotions(self, face_emotion: Optional[EmotionResult],
                                     text_emotion: Optional[EmotionResult]) -> MultimodalResult:
        """
        Combine face and text emotions with authenticity validation
        """
        
        if not face_emotion and not text_emotion:
            return MultimodalResult(
                final_emotion='neutral',
                final_confidence=0.5,
                face_emotion=None,
                text_emotion=None,
                audio_emotion=None,
                consistency_score=0.0,
                is_authentic=False,
                explanation="No face or text data available"
            )
        
        # Case 1: Only face emotion available
        if face_emotion and not text_emotion:
            return MultimodalResult(
                final_emotion=face_emotion.emotion,
                final_confidence=face_emotion.confidence,
                face_emotion=face_emotion,
                text_emotion=None,
                audio_emotion=None,
                consistency_score=1.0,
                is_authentic=face_emotion.confidence > 0.6,
                explanation=f"Face-only detection: {face_emotion.emotion} with {face_emotion.confidence:.1%} confidence"
            )
        
        # Case 2: Only text emotion available
        if text_emotion and not face_emotion:
            # Without face validation, lower authenticity
            is_authentic = text_emotion.confidence > 0.7 and text_emotion.emotion != 'neutral'
            explanation = f"Text-only detection: {text_emotion.emotion}. Face verification recommended for authenticity."
            
            return MultimodalResult(
                final_emotion=text_emotion.emotion,
                final_confidence=text_emotion.confidence * 0.8,  # Reduce confidence without face
                face_emotion=None,
                text_emotion=text_emotion,
                audio_emotion=None,
                consistency_score=0.5,
                is_authentic=is_authentic,
                explanation=explanation
            )
        
        # Case 3: Both face and text emotions available
        face_consensus = self.get_face_emotion_consensus()
        
        if face_consensus:
            consistency_score = self._calculate_consistency_score(
                face_consensus['emotion'], text_emotion.emotion,
                face_consensus['confidence'], text_emotion.confidence
            )
        else:
            consistency_score = self._calculate_consistency_score(
                face_emotion.emotion, text_emotion.emotion,
                face_emotion.confidence, text_emotion.confidence
            )
        
        # Determine final emotion and authenticity
        final_emotion, final_confidence, is_authentic, explanation = self._determine_final_emotion(
            face_emotion, text_emotion, face_consensus, consistency_score
        )
        
        return MultimodalResult(
            final_emotion=final_emotion,
            final_confidence=final_confidence,
            face_emotion=face_emotion,
            text_emotion=text_emotion,
            audio_emotion=None,
            consistency_score=consistency_score,
            is_authentic=is_authentic,
            explanation=explanation
        )
    
    def _calculate_consistency_score(self, face_emotion: str, text_emotion: str,
                                   face_confidence: float, text_confidence: float) -> float:
        """Calculate consistency score between face and text emotions"""
        
        # Direct match
        if face_emotion == text_emotion:
            return 1.0
        
        # Compatible emotions (positive/negative alignment)
        positive_emotions = {'happy', 'surprise'}
        negative_emotions = {'sad', 'angry', 'fear', 'disgust'}
        
        face_valence = 'positive' if face_emotion in positive_emotions else \
                      'negative' if face_emotion in negative_emotions else 'neutral'
        
        text_valence = 'positive' if text_emotion in positive_emotions else \
                      'negative' if text_emotion in negative_emotions else 'neutral'
        
        if face_valence == text_valence and face_valence != 'neutral':
            return 0.7  # Same valence but different specific emotion
        elif 'neutral' in [face_valence, text_valence]:
            return 0.5  # One neutral
        else:
            return 0.2  # Conflicting valences
    
    def _determine_final_emotion(self, face_emotion: EmotionResult, 
                               text_emotion: EmotionResult,
                               face_consensus: Optional[Dict],
                               consistency_score: float) -> Tuple[str, float, bool, str]:
        """Determine final emotion with advanced face-priority logic"""
        
        # Use face consensus if available, otherwise single face detection
        if face_consensus:
            face_result_emotion = face_consensus['emotion']
            face_conf = face_consensus['confidence'] * face_consensus['stability_score']
        else:
            face_result_emotion = face_emotion.emotion
            face_conf = face_emotion.confidence
        
        text_conf = text_emotion.confidence
        
        # Use advanced face recognizer for authenticity validation if available
        if self.face_recognizer and hasattr(self.face_recognizer, 'validate_emotion_authenticity'):
            validation_result = self.face_recognizer.validate_emotion_authenticity(
                face_result_emotion, face_conf, text_emotion.emotion, text_conf
            )
            
            return (
                validation_result['final_emotion'],
                validation_result['final_confidence'],
                validation_result['is_authentic'],
                validation_result['explanation']
            )
        
        # Fallback to original logic with face priority
        face_weight = 0.8  # Higher priority for face
        text_weight = 0.2
        
        # High consistency - emotions match or are compatible
        if consistency_score >= self.consistency_threshold:
            if face_result_emotion == text_emotion.emotion:
                # Perfect match
                final_emotion = face_result_emotion
                final_confidence = (face_conf * face_weight + text_conf * text_weight)
                is_authentic = True
                explanation = f"✅ AUTHENTIC: Face and text both indicate {final_emotion}"
            else:
                # Compatible emotions - prioritize face
                final_emotion = face_result_emotion
                final_confidence = face_conf * face_weight + text_conf * text_weight * 0.7
                is_authentic = True
                explanation = f"Compatible emotions: Face shows {face_result_emotion}, text shows {text_emotion.emotion}. Prioritizing facial expression."
        else:
            # Low consistency - potential fake, always trust face
            final_emotion = face_result_emotion
            final_confidence = face_conf * 0.8  # Slightly reduce confidence due to conflict
            is_authentic = False
            explanation = f"🚫 POTENTIAL FAKE: Face shows {face_result_emotion} but text suggests {text_emotion.emotion}. Facial expression takes priority over text."
        
        return final_emotion, final_confidence, is_authentic, explanation
    
    def get_status(self) -> Dict[str, Any]:
        """Get current status of the emotion recognition system"""
        face_consensus = self.get_face_emotion_consensus() if self.face_tracking_active else None
        
        return {
            'face_tracking_active': self.face_tracking_active,
            'face_emotion_history_size': self.face_emotion_history.qsize(),
            'recent_face_emotion': face_consensus,
            'camera_available': self.cap is not None and self.cap.isOpened() if self.cap else False,
            'base_recognizer_loaded': self.base_recognizer is not None,
            'system_ready': self.face_tracking_active and self.base_recognizer is not None
        }
    
    def cleanup(self):
        """Cleanup resources"""
        self.stop_face_tracking()
        logger.info("✅ Continuous emotion recognizer cleaned up")

# Global instance
_continuous_recognizer = None

def get_continuous_recognizer() -> ContinuousEmotionRecognizer:
    """Get the global continuous emotion recognizer instance"""
    global _continuous_recognizer
    if _continuous_recognizer is None:
        _continuous_recognizer = ContinuousEmotionRecognizer()
    return _continuous_recognizer

def cleanup_continuous_recognizer():
    """Cleanup the global continuous emotion recognizer"""
    global _continuous_recognizer
    if _continuous_recognizer:
        _continuous_recognizer.cleanup()
        _continuous_recognizer = None

# Testing function
def test_continuous_recognition():
    """Test the continuous emotion recognition system"""
    recognizer = get_continuous_recognizer()
    
    print("🧪 Testing Continuous Emotion Recognition")
    print("=" * 50)
    
    # Test 1: Start face tracking
    print("\n1. Starting face tracking...")
    success = recognizer.start_face_tracking()
    print(f"   {'✅' if success else '❌'} Face tracking: {'Started' if success else 'Failed'}")
    
    # Test 2: Test text emotion
    print("\n2. Testing text emotion analysis...")
    test_texts = [
        "I am so happy and excited!",
        "I feel really sad and down today",
        "I'm angry and frustrated",
        "This is neutral text"
    ]
    
    for text in test_texts:
        result = recognizer.analyze_text_emotion(text)
        print(f"   Text: '{text}'")
        print(f"   Emotion: {result.emotion} (confidence: {result.confidence:.1%})")
    
    # Test 3: Multimodal analysis
    print("\n3. Testing multimodal analysis...")
    if success:
        print("   Waiting 3 seconds for face detection...")
        time.sleep(3)
        
        result = recognizer.analyze_multimodal_emotion(
            text="I am really happy today!",
            force_face_capture=True
        )
        
        print(f"   Final emotion: {result.final_emotion} (confidence: {result.final_confidence:.1%})")
        print(f"   Consistency score: {result.consistency_score:.1%}")
        print(f"   Is authentic: {result.is_authentic}")
        print(f"   Explanation: {result.explanation}")
    
    # Test 4: System status
    print("\n4. System status:")
    status = recognizer.get_status()
    for key, value in status.items():
        print(f"   {key}: {value}")
    
    # Cleanup
    print("\n5. Cleaning up...")
    recognizer.cleanup()
    print("   ✅ Cleanup complete")

if __name__ == "__main__":
    test_continuous_recognition()