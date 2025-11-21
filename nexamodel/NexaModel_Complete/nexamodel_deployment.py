"""
NexaModel Multimodal Emotion Recognition - Deployment Script
==========================================================

This script demonstrates how to load and use the trained NexaModel
for emotion recognition from face, voice, and text inputs.

Author: Nexaa AI Team
Version: 1.0.0
"""

import tensorflow as tf
import numpy as np
import cv2
import librosa
import pickle
import json
import os
from tensorflow.keras.models import load_model

class NexaEmotionRecognizer:
    def __init__(self, model_dir):
        """
        Initialize the NexaModel Emotion Recognizer

        Args:
            model_dir (str): Path to the directory containing saved models
        """
        self.model_dir = model_dir
        self.load_models()
        self.load_preprocessors()
        self.load_config()

    def load_models(self):
        """Load the trained models"""
        self.multimodal_model = load_model(os.path.join(self.model_dir, 'multimodal_emotion_model.keras'))

        # Load individual models if available
        self.face_model = None
        self.audio_model = None
        self.text_model = None

        if os.path.exists(os.path.join(self.model_dir, 'face_only_model.keras')):
            self.face_model = load_model(os.path.join(self.model_dir, 'face_only_model.keras'))

        if os.path.exists(os.path.join(self.model_dir, 'audio_only_model.keras')):
            self.audio_model = load_model(os.path.join(self.model_dir, 'audio_only_model.keras'))

        if os.path.exists(os.path.join(self.model_dir, 'text_only_model.keras')):
            self.text_model = load_model(os.path.join(self.model_dir, 'text_only_model.keras'))

        print(f"✓ Loaded NexaModel from {self.model_dir}")

    def load_preprocessors(self):
        """Load the data preprocessors"""
        with open(os.path.join(self.model_dir, 'face_processor.pkl'), 'rb') as f:
            self.face_processor = pickle.load(f)

        with open(os.path.join(self.model_dir, 'audio_processor.pkl'), 'rb') as f:
            self.audio_processor = pickle.load(f)

        with open(os.path.join(self.model_dir, 'text_processor.pkl'), 'rb') as f:
            self.text_processor = pickle.load(f)

        print("✓ Loaded preprocessors")

    def load_config(self):
        """Load model configuration"""
        with open(os.path.join(self.model_dir, 'model_config.json'), 'r') as f:
            self.config = json.load(f)
        self.emotion_labels = self.config['emotion_labels']
        print(f"✓ Loaded configuration - Emotions: {', '.join(self.emotion_labels)}")

    def preprocess_face(self, face_input):
        """Preprocess face input"""
        if face_input is None:
            return np.zeros((1, 48, 48, 1))

        if isinstance(face_input, str):
            # Load image from path
            image = cv2.imread(face_input)
            if image is None:
                return np.zeros((1, 48, 48, 1))
            face_data = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            face_data = face_input

        # Use the trained face processor
        return self.face_processor.preprocess_single_image(face_data)

    def preprocess_audio(self, audio_input):
        """Preprocess audio input"""
        if audio_input is None:
            return np.zeros((1, 56))

        # Use the trained audio processor
        return self.audio_processor.preprocess_single_audio(audio_input)

    def preprocess_text(self, text_input):
        """Preprocess text input"""
        if text_input is None or text_input == "":
            return np.zeros((1, 128))

        # Use the trained text processor
        return self.text_processor.preprocess_single_text(text_input)

    def predict_emotion(self, face_image=None, audio_file=None, text=None):
        """
        Predict emotion from multimodal inputs

        Args:
            face_image (str or np.array): Path to face image or image array
            audio_file (str): Path to audio file
            text (str): Text input

        Returns:
            dict: Prediction results
        """
        # Preprocess inputs
        face_data = self.preprocess_face(face_image)
        audio_data = self.preprocess_audio(audio_file)
        text_data = self.preprocess_text(text)

        inputs = {
            'face_input': face_data,
            'audio_input': audio_data,
            'text_input': text_data
        }

        # Make prediction
        prediction = self.multimodal_model.predict(inputs, verbose=0)
        predicted_class = np.argmax(prediction, axis=1)[0]
        confidence = float(np.max(prediction))

        result = {
            'predicted_emotion': self.emotion_labels[predicted_class],
            'confidence': confidence,
            'all_probabilities': {
                label: float(prob) for label, prob in zip(self.emotion_labels, prediction[0])
            }
        }

        # Add individual model predictions if available
        if self.face_model is not None and face_image is not None:
            face_pred = self.face_model.predict(face_data, verbose=0)
            result['face_only'] = {
                'emotion': self.emotion_labels[np.argmax(face_pred)],
                'confidence': float(np.max(face_pred))
            }

        if self.audio_model is not None and audio_file is not None:
            audio_pred = self.audio_model.predict(audio_data, verbose=0)
            result['audio_only'] = {
                'emotion': self.emotion_labels[np.argmax(audio_pred)],
                'confidence': float(np.max(audio_pred))
            }

        if self.text_model is not None and text is not None:
            text_pred = self.text_model.predict(text_data, verbose=0)
            result['text_only'] = {
                'emotion': self.emotion_labels[np.argmax(text_pred)],
                'confidence': float(np.max(text_pred))
            }

        return result

    def get_model_info(self):
        """Get information about the loaded model"""
        return {
            'model_name': self.config['model_name'],
            'version': self.config['version'],
            'emotions': self.emotion_labels,
            'multimodal_accuracy': self.config['performance']['multimodal_accuracy'],
            'individual_models': self.config['performance']['individual_models'],
            'created_date': self.config['created_date']
        }

# Example usage and testing functions
def test_recognizer():
    """Test function for the recognizer"""
    try:
        recognizer = NexaEmotionRecognizer(model_dir="./")

        # Test with sample inputs
        result = recognizer.predict_emotion(
            text="I'm so excited about this new technology!"
        )

        print("\n=== NexaModel Test Results ===")
        print(f"Predicted Emotion: {result['predicted_emotion']}")
        print(f"Confidence: {result['confidence']:.3f}")
        print("\nAll Emotion Probabilities:")
        for emotion, prob in result['all_probabilities'].items():
            print(f"  {emotion}: {prob:.3f}")

        # Model info
        info = recognizer.get_model_info()
        print(f"\n=== Model Information ===")
        print(f"Model: {info['model_name']}")
        print(f"Version: {info['version']}")
        print(f"Accuracy: {info['multimodal_accuracy']:.2%}")

        return True

    except Exception as e:
        print(f"Test failed: {e}")
        return False

if __name__ == "__main__":
    print("NexaModel Multimodal Emotion Recognition")
    print("=" * 50)

    if test_recognizer():
        print("\n✓ NexaModel is ready for deployment!")
    else:
        print("\n✗ NexaModel test failed. Check installation.")
