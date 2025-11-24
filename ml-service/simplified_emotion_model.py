"""
Simplified Emotion Recognition Model for Immediate Deployment
============================================================

This module provides a lightweight emotion recognition implementation that can work
without complex trained models, using rule-based and statistical approaches.
"""

import re
import numpy as np
import cv2
import librosa
import pickle
import json
import os
from typing import Dict, Any, Optional, Union
import warnings
warnings.filterwarnings('ignore')

class SimplifiedEmotionRecognizer:
    """
    Simplified emotion recognizer using rule-based and basic statistical methods
    """
    
    def __init__(self):
        self.emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
        self.setup_text_patterns()
        
    def setup_text_patterns(self):
        """Setup text patterns for emotion detection"""
        self.text_patterns = {
            'happy': [
                r'\b(happy|joy|excited|amazing|wonderful|fantastic|great|love|awesome|excellent|brilliant|perfect)\b',
                r'\b(laugh|smile|celebrate|party|fun|enjoy|pleased|delighted|cheerful)\b',
                r'[!]{2,}',  # Multiple exclamation marks
                r'[😊😄😃🎉🎊💖❤️😍]',  # Happy emojis
            ],
            'sad': [
                r'\b(sad|cry|depressed|disappointed|hurt|pain|sorrow|grief|upset|down|blue)\b',
                r'\b(lonely|empty|heartbroken|devastated|miserable|gloomy|despair)\b',
                r'[😢😭😞😔💔]',  # Sad emojis
            ],
            'angry': [
                r'\b(angry|mad|furious|rage|hate|annoyed|irritated|pissed|frustrated)\b',
                r'\b(damn|hell|stupid|idiotic|ridiculous|outrageous|unacceptable)\b',
                r'[😠😡🤬💢]',  # Angry emojis
                r'[A-Z]{3,}',  # ALL CAPS (might indicate shouting)
            ],
            'fear': [
                r'\b(scared|afraid|terrified|frightened|worried|anxious|panic|nervous)\b',
                r'\b(danger|threat|risk|horror|nightmare|dread|phobia)\b',
                r'[😨😰😱]',  # Fear emojis
            ],
            'surprise': [
                r'\b(surprised|shocked|amazed|astonished|wow|incredible|unbelievable)\b',
                r'\b(sudden|unexpected|speechless|stunned|blown away)\b',
                r'[😲😮🤯]',  # Surprise emojis
                r'\bwow+\b',
            ],
            'disgust': [
                r'\b(disgusting|gross|yuck|eww|nasty|repulsive|revolting|sick)\b',
                r'\b(vomit|puke|nausea|awful|terrible|horrible)\b',
                r'[🤢🤮😷]',  # Disgust emojis
            ]
        }
        
    def analyze_text_sentiment(self, text: str) -> Dict[str, float]:
        """Analyze text sentiment using pattern matching"""
        if not text:
            return {emotion: 1/len(self.emotion_labels) for emotion in self.emotion_labels}
        
        text_lower = text.lower()
        emotion_scores = {emotion: 0.0 for emotion in self.emotion_labels}
        
        # Pattern matching
        for emotion, patterns in self.text_patterns.items():
            for pattern in patterns:
                matches = len(re.findall(pattern, text_lower, re.IGNORECASE))
                emotion_scores[emotion] += matches * 0.3
        
        # Basic sentiment indicators
        positive_words = ['good', 'nice', 'beautiful', 'best', 'better', 'fine', 'ok', 'okay']
        negative_words = ['bad', 'worst', 'terrible', 'awful', 'hate', 'stupid', 'wrong']
        
        for word in positive_words:
            if word in text_lower:
                emotion_scores['happy'] += 0.2
        
        for word in negative_words:
            if word in text_lower:
                emotion_scores['sad'] += 0.2
                emotion_scores['angry'] += 0.1
        
        # Punctuation analysis
        exclamation_count = text.count('!')
        question_count = text.count('?')
        
        if exclamation_count > 0:
            emotion_scores['happy'] += exclamation_count * 0.1
            emotion_scores['surprise'] += exclamation_count * 0.05
            emotion_scores['angry'] += exclamation_count * 0.05
        
        if question_count > 0:
            emotion_scores['surprise'] += question_count * 0.1
            emotion_scores['fear'] += question_count * 0.05
        
        # Normalize scores
        total_score = sum(emotion_scores.values())
        if total_score > 0:
            emotion_scores = {k: v/total_score for k, v in emotion_scores.items()}
        else:
            # Default to neutral if no patterns found
            emotion_scores['neutral'] = 1.0
        
        return emotion_scores
    
    def analyze_face_basic(self, face_image: Union[str, np.ndarray]) -> Dict[str, float]:
        """Basic face analysis using simple features"""
        try:
            if isinstance(face_image, str):
                img = cv2.imread(face_image)
                if img is None:
                    return self._default_emotion_scores()
            else:
                img = face_image
            
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Basic feature extraction
            # This is a simplified approach - in reality you'd use more sophisticated methods
            
            # Calculate image statistics
            mean_intensity = np.mean(gray)
            std_intensity = np.std(gray)
            
            # Simple heuristics based on brightness and contrast
            emotion_scores = {emotion: 0.1 for emotion in self.emotion_labels}
            
            # Bright images might indicate happiness
            if mean_intensity > 120:
                emotion_scores['happy'] += 0.3
                emotion_scores['surprise'] += 0.2
            # Dark images might indicate sadness
            elif mean_intensity < 80:
                emotion_scores['sad'] += 0.3
                emotion_scores['fear'] += 0.2
            
            # High contrast might indicate strong emotions
            if std_intensity > 60:
                emotion_scores['angry'] += 0.2
                emotion_scores['surprise'] += 0.2
            
            # Normalize scores
            total = sum(emotion_scores.values())
            return {k: v/total for k, v in emotion_scores.items()}
            
        except Exception as e:
            print(f"Face analysis error: {e}")
            return self._default_emotion_scores()
    
    def analyze_audio_basic(self, audio_file: str) -> Dict[str, float]:
        """Basic audio analysis using simple audio features"""
        try:
            # Load audio file
            y, sr = librosa.load(audio_file, duration=30, sr=22050)
            
            # Extract basic features
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            spectral_centroid = np.mean(librosa.feature.spectral_centroid(y=y, sr=sr))
            spectral_rolloff = np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr))
            rms = np.mean(librosa.feature.rms(y=y))
            zero_crossing_rate = np.mean(librosa.feature.zero_crossing_rate(y))
            
            emotion_scores = {emotion: 0.1 for emotion in self.emotion_labels}
            
            # Simple heuristics based on audio features
            if tempo > 120:  # Fast tempo
                emotion_scores['happy'] += 0.3
                emotion_scores['angry'] += 0.2
            elif tempo < 80:  # Slow tempo
                emotion_scores['sad'] += 0.3
                emotion_scores['fear'] += 0.1
            
            if spectral_centroid > 2000:  # High pitch
                emotion_scores['surprise'] += 0.2
                emotion_scores['fear'] += 0.1
            elif spectral_centroid < 1000:  # Low pitch
                emotion_scores['sad'] += 0.2
                emotion_scores['angry'] += 0.1
            
            if rms > 0.1:  # High energy
                emotion_scores['angry'] += 0.2
                emotion_scores['happy'] += 0.1
            elif rms < 0.05:  # Low energy
                emotion_scores['sad'] += 0.2
                emotion_scores['neutral'] += 0.1
            
            if zero_crossing_rate > 0.1:  # High variability
                emotion_scores['surprise'] += 0.1
                emotion_scores['fear'] += 0.1
            
            # Normalize scores
            total = sum(emotion_scores.values())
            return {k: v/total for k, v in emotion_scores.items()}
            
        except Exception as e:
            print(f"Audio analysis error: {e}")
            return self._default_emotion_scores()
    
    def _default_emotion_scores(self) -> Dict[str, float]:
        """Return default emotion scores"""
        return {emotion: 1/len(self.emotion_labels) for emotion in self.emotion_labels}
    
    def predict_emotion(self, face_image=None, audio_file=None, text=None) -> Dict[str, Any]:
        """
        Predict emotion from multimodal inputs using simplified methods
        """
        # Analyze each modality
        text_scores = self.analyze_text_sentiment(text) if text else {}
        face_scores = self.analyze_face_basic(face_image) if face_image else {}
        audio_scores = self.analyze_audio_basic(audio_file) if audio_file else {}
        
        # Combine scores with weights
        final_scores = {emotion: 0.0 for emotion in self.emotion_labels}
        weights = {'text': 0.4, 'face': 0.3, 'audio': 0.3}
        
        # Weight the contributions based on available modalities
        available_modalities = []
        if text_scores:
            available_modalities.append('text')
        if face_scores:
            available_modalities.append('face')
        if audio_scores:
            available_modalities.append('audio')
        
        if not available_modalities:
            # No valid inputs, return neutral
            final_scores['neutral'] = 1.0
        else:
            # Normalize weights for available modalities
            total_weight = sum(weights[mod] for mod in available_modalities)
            for modality in available_modalities:
                weights[modality] = weights[modality] / total_weight
            
            # Combine scores
            for emotion in self.emotion_labels:
                if text_scores:
                    final_scores[emotion] += text_scores.get(emotion, 0) * weights['text']
                if face_scores:
                    final_scores[emotion] += face_scores.get(emotion, 0) * weights['face']
                if audio_scores:
                    final_scores[emotion] += audio_scores.get(emotion, 0) * weights['audio']
        
        # Find predicted emotion
        predicted_emotion = max(final_scores.keys(), key=lambda k: final_scores[k])
        confidence = final_scores[predicted_emotion]
        
        result = {
            'predicted_emotion': predicted_emotion,
            'confidence': float(confidence),
            'all_probabilities': {k: float(v) for k, v in final_scores.items()}
        }
        
        # Add individual modality results if available
        if text_scores:
            text_emotion = max(text_scores.keys(), key=lambda k: text_scores[k])
            result['text_only'] = {
                'emotion': text_emotion,
                'confidence': float(text_scores[text_emotion])
            }
        
        if face_scores:
            face_emotion = max(face_scores.keys(), key=lambda k: face_scores[k])
            result['face_only'] = {
                'emotion': face_emotion,
                'confidence': float(face_scores[face_emotion])
            }
        
        if audio_scores:
            audio_emotion = max(audio_scores.keys(), key=lambda k: audio_scores[k])
            result['audio_only'] = {
                'emotion': audio_emotion,
                'confidence': float(audio_scores[audio_emotion])
            }
        
        return result
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            'model_name': 'SimplifiedNexaModel',
            'version': '1.0.0-simplified',
            'emotions': self.emotion_labels,
            'type': 'rule_based_statistical',
            'description': 'Lightweight emotion recognition using pattern matching and basic features'
        }

# Test function
def test_simplified_model():
    """Test the simplified emotion model"""
    recognizer = SimplifiedEmotionRecognizer()
    
    # Test with text
    test_texts = [
        "I'm so happy and excited about this!",
        "This is really sad and disappointing.",
        "I'm angry about this situation!",
        "Wow, that's amazing and surprising!",
        "I'm scared and worried about this.",
        "This is disgusting and awful.",
        "Everything seems normal today."
    ]
    
    print("Testing Simplified Emotion Recognition Model")
    print("=" * 50)
    
    for text in test_texts:
        result = recognizer.predict_emotion(text=text)
        print(f"\nText: '{text}'")
        print(f"Predicted: {result['predicted_emotion']} (confidence: {result['confidence']:.3f})")
    
    return True

if __name__ == "__main__":
    test_simplified_model()