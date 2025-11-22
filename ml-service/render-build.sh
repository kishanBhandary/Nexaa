#!/bin/bash
# Render Build Script for NexaModel ML Service

set -e  # Exit on any error

echo "Starting Render build for NexaModel ML Service..."

# Install system dependencies
echo "Installing system dependencies..."
apt-get update
apt-get install -y \
    ffmpeg \
    libsndfile1 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libfontconfig1 \
    libxrender1

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r render-requirements.txt

# Create necessary directories
echo "Creating directories..."
mkdir -p uploads
mkdir -p temp
mkdir -p logs
mkdir -p ../nexamodel/NexaModel_Complete

# Set permissions
chmod 755 uploads
chmod 755 temp
chmod 755 logs

# Create a basic mock model if actual models are not available
echo "Setting up fallback model..."
python -c "
import os
import pickle
import numpy as np

model_dir = '../nexamodel/NexaModel_Complete'
os.makedirs(model_dir, exist_ok=True)

# Create mock model files if they don't exist
if not os.path.exists(f'{model_dir}/emotion_labels.json'):
    labels = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']
    with open(f'{model_dir}/emotion_labels.json', 'w') as f:
        import json
        json.dump(labels, f)

# Create mock preprocessor if it doesn't exist
if not os.path.exists(f'{model_dir}/text_preprocessor.pkl'):
    mock_preprocessor = {'vectorizer': None, 'scaler': None}
    with open(f'{model_dir}/text_preprocessor.pkl', 'wb') as f:
        pickle.dump(mock_preprocessor, f)
"

echo "Build completed successfully!"