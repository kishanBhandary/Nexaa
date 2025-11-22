#!/usr/bin/env python3
"""
Setup fallback model files for deployment when actual models are not available
"""

import os
import json
import pickle

def setup_fallback_models():
    """Create mock model files for fallback functionality"""
    model_dir = '../nexamodel/NexaModel_Complete'
    os.makedirs(model_dir, exist_ok=True)
    
    # Create emotion labels
    if not os.path.exists(f'{model_dir}/emotion_labels.json'):
        labels = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
        with open(f'{model_dir}/emotion_labels.json', 'w') as f:
            json.dump(labels, f)
        print("Created emotion_labels.json")
    
    # Create mock text preprocessor
    if not os.path.exists(f'{model_dir}/text_preprocessor.pkl'):
        mock_preprocessor = {'vectorizer': None, 'scaler': None}
        with open(f'{model_dir}/text_preprocessor.pkl', 'wb') as f:
            pickle.dump(mock_preprocessor, f)
        print("Created text_preprocessor.pkl")
    
    print("Fallback model setup complete")

if __name__ == "__main__":
    setup_fallback_models()