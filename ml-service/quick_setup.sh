#!/bin/bash

# Quick Start Script for NexaModel FastAPI Service
echo "🚀 Quick FastAPI Setup for NexaModel"
echo "===================================="

# Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install minimal requirements
echo "Installing minimal FastAPI requirements..."
pip install fastapi uvicorn[standard] python-multipart requests pydantic

# Create necessary directories
echo "Creating directories..."
mkdir -p uploads
mkdir -p temp
mkdir -p logs

echo ""
echo "✅ Basic setup complete!"
echo ""
echo "🔥 To start the FastAPI service:"
echo "   source venv/bin/activate"
echo "   python simple_main.py"
echo ""
echo "🌐 The service will be available at:"
echo "   http://localhost:8001"
echo ""
echo "📝 To install additional features:"
echo "   pip install gtts                    # For text-to-speech"
echo "   pip install numpy opencv-python     # For video/image processing" 
echo "   pip install librosa                 # For audio processing"
echo "   pip install tensorflow              # For full ML model"
echo ""
echo "🧪 Test the service:"
echo "   curl http://localhost:8001/test"
echo ""