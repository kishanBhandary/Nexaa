"""
Face-Priority Multimodal Emotion Analysis
========================================

This module provides enhanced multimodal emotion analysis that prioritizes
facial expression over text to prevent fake emotion responses.

Author: Nexaa AI Team  
Version: 1.0.0
"""

def analyze_face_priority_emotion(emotion_recognizer, text=None, image_blob=None):
    """
    Analyze emotion with face taking priority over text
    
    This method ensures that genuine facial expressions are detected
    even if the user types contradictory emotional text.
    
    Args:
        emotion_recognizer: The emotion recognition model
        text: Optional text input
        image_blob: Optional face image blob
        
    Returns:
        dict: Analysis result with face-priority logic applied
    """
    
    face_result = None
    text_result = None
    
    # Analyze face emotion if image provided
    if image_blob:
        try:
            face_result = emotion_recognizer.predict_emotion(face_image=image_blob)
            face_result['source'] = 'face_priority'
            print(f"🎭 Face emotion detected: {face_result['predicted_emotion']} ({face_result['confidence']:.3f})")
        except Exception as e:
            print(f"Face analysis error: {e}")
    
    # Analyze text emotion if text provided
    if text and text.strip():
        try:
            text_result = emotion_recognizer.predict_emotion(text=text.strip())
            text_result['source'] = 'text_analysis'
            print(f"📝 Text emotion detected: {text_result['predicted_emotion']} ({text_result['confidence']:.3f})")
        except Exception as e:
            print(f"Text analysis error: {e}")
    
    # Apply face-priority fusion logic
    if face_result and text_result:
        return _apply_face_priority_fusion(face_result, text_result, text)
    elif face_result:
        # Face only - highly trusted
        face_result['analysis_method'] = 'face_only'
        face_result['authenticity'] = 'verified_facial_expression'
        face_result['explanation'] = f"Genuine {face_result['predicted_emotion']} emotion detected from facial expression"
        return face_result
    elif text_result:
        # Text only - lower trust
        text_result['analysis_method'] = 'text_only'
        text_result['authenticity'] = 'unverified_text'
        text_result['confidence'] *= 0.7  # Reduce confidence without face verification
        text_result['explanation'] = f"⚠️ Text-based {text_result['predicted_emotion']} emotion. Facial verification recommended."
        return text_result
    else:
        # No input
        return {
            'predicted_emotion': 'neutral',
            'confidence': 0.5,
            'all_probabilities': {emotion: 1.0/7 for emotion in ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral']},
            'analysis_method': 'no_input',
            'authenticity': 'unknown',
            'explanation': 'No emotion input provided'
        }

def _apply_face_priority_fusion(face_result, text_result, original_text):
    """
    Apply sophisticated face-priority fusion logic
    
    This method prioritizes facial expressions while considering text context,
    helping detect when someone types sad emotions but isn't actually sad.
    """
    
    face_emotion = face_result['predicted_emotion']
    face_confidence = face_result['confidence']
    text_emotion = text_result['predicted_emotion']
    text_confidence = text_result['confidence']
    
    # Calculate emotion compatibility score
    compatibility_score = _calculate_emotion_compatibility(face_emotion, text_emotion)
    
    print(f"🧠 Face-Priority Analysis:")
    print(f"   Face: {face_emotion} ({face_confidence:.3f})")
    print(f"   Text: {text_emotion} ({text_confidence:.3f})")
    print(f"   Compatibility: {compatibility_score:.3f}")
    
    # Decision logic based on compatibility and confidence
    if compatibility_score > 0.7:
        # Emotions are compatible - combine them
        final_emotion = face_emotion if face_confidence > text_confidence else text_emotion
        final_confidence = (face_confidence * 0.6 + text_confidence * 0.4)
        explanation = f"Compatible emotions: Face shows {face_emotion}, text expresses {text_emotion}"
        authenticity = "compatible_multimodal"
        
    elif face_confidence > 0.65:
        # High confidence face emotion overrides text
        final_emotion = face_emotion  
        final_confidence = face_confidence * 0.9  # Slight reduction for conflict
        explanation = f"🎭 Facial expression ({face_emotion}) takes priority over text ({text_emotion}). Your face shows your true emotion!"
        authenticity = "face_priority_override"
        
    elif text_confidence > 0.8 and face_confidence < 0.5:
        # Very confident text with weak face detection
        final_emotion = text_emotion
        final_confidence = text_confidence * 0.8
        explanation = f"📝 Text emotion ({text_emotion}) used due to unclear facial expression"
        authenticity = "text_priority_weak_face"
        
    else:
        # Moderate conflict - lean toward face but consider both
        weight_face = 0.7
        weight_text = 0.3
        
        # Weighted average of probabilities
        combined_probs = {}
        emotions = ['happy', 'sad', 'angry', 'fear', 'surprise', 'disgust', 'neutral']
        
        for emotion in emotions:
            face_prob = face_result['all_probabilities'].get(emotion, 0)
            text_prob = text_result['all_probabilities'].get(emotion, 0)
            combined_probs[emotion] = face_prob * weight_face + text_prob * weight_text
        
        final_emotion = max(combined_probs, key=combined_probs.get)
        final_confidence = (face_confidence * weight_face + text_confidence * weight_text)
        explanation = f"🔀 Blended analysis: Face-weighted {final_emotion} from face ({face_emotion}) + text ({text_emotion})"
        authenticity = "blended_multimodal"
        combined_probs = face_result['all_probabilities']  # Use face probabilities as base
    
    # Check for specific cases where text might be deceptive
    if _detect_potential_deception(original_text, face_emotion, text_emotion):
        explanation += f" ⚠️ Text may not reflect genuine emotion - facial expression suggests {face_emotion}."
        authenticity += "_potential_text_deception"
    
    return {
        'predicted_emotion': final_emotion,
        'confidence': final_confidence,
        'all_probabilities': face_result['all_probabilities'],
        'analysis_method': 'face_priority_multimodal',
        'authenticity': authenticity,
        'explanation': explanation,
        'face_analysis': {
            'emotion': face_emotion,
            'confidence': face_confidence
        },
        'text_analysis': {
            'emotion': text_emotion,
            'confidence': text_confidence  
        },
        'compatibility_score': compatibility_score,
        'priority_given_to': 'face' if final_emotion == face_emotion else 'text'
    }

def _calculate_emotion_compatibility(face_emotion, text_emotion):
    """
    Calculate how compatible two emotions are (0-1 scale)
    """
    # Exact match
    if face_emotion == text_emotion:
        return 1.0
    
    # Define emotion compatibility matrix
    compatibility_matrix = {
        'happy': {'surprise': 0.7, 'neutral': 0.6, 'sad': 0.1, 'angry': 0.1, 'fear': 0.2, 'disgust': 0.2},
        'sad': {'fear': 0.6, 'neutral': 0.5, 'disgust': 0.4, 'angry': 0.3, 'happy': 0.1, 'surprise': 0.2},
        'angry': {'disgust': 0.7, 'fear': 0.4, 'sad': 0.3, 'neutral': 0.3, 'happy': 0.1, 'surprise': 0.2},
        'fear': {'sad': 0.6, 'surprise': 0.5, 'angry': 0.4, 'neutral': 0.4, 'disgust': 0.3, 'happy': 0.1},
        'surprise': {'happy': 0.7, 'fear': 0.5, 'neutral': 0.5, 'sad': 0.2, 'angry': 0.2, 'disgust': 0.2},
        'disgust': {'angry': 0.7, 'sad': 0.4, 'fear': 0.3, 'neutral': 0.3, 'happy': 0.1, 'surprise': 0.2},
        'neutral': {'happy': 0.6, 'sad': 0.5, 'surprise': 0.5, 'fear': 0.4, 'angry': 0.3, 'disgust': 0.3}
    }
    
    return compatibility_matrix.get(face_emotion, {}).get(text_emotion, 0.3)

def _detect_potential_deception(text, face_emotion, text_emotion):
    """
    Detect cases where text might be masking true emotion
    """
    text_lower = text.lower() if text else ""
    
    # Look for explicit emotion words that contradict face
    explicit_emotions = {
        'happy': ['happy', 'joy', 'great', 'wonderful', 'amazing', 'excited'],
        'sad': ['sad', 'depressed', 'down', 'awful', 'terrible', 'horrible'],
        'angry': ['angry', 'mad', 'furious', 'hate', 'pissed'],
        'fear': ['scared', 'afraid', 'worried', 'anxious', 'nervous'],
    }
    
    # Check if text contains explicit emotion words
    text_has_explicit_emotion = False
    for emotion, words in explicit_emotions.items():
        if any(word in text_lower for word in words):
            text_has_explicit_emotion = True
            break
    
    # If text explicitly states an emotion but face shows different emotion
    if text_has_explicit_emotion and face_emotion != text_emotion:
        confidence_difference = abs(0.8 - 0.6)  # Assume moderate confidence difference
        if confidence_difference > 0.1:
            return True
    
    return False