#!/bin/bash

# NexaModel ML Service Startup Script
# This script starts the FastAPI ML service for emotion recognition

echo "🚀 Starting NexaModel ML Service..."

# Change to the ML service directory
cd "$(dirname "$0")/ml-service"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run: python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if required packages are installed
python -c "import fastapi, uvicorn" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "📦 Installing required packages..."
    pip install fastapi uvicorn
fi

# Check if ML dependencies are installed
python -c "import transformers, torch" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "📦 Installing ML dependencies..."
    pip install transformers torch opencv-python librosa gtts tf-keras aiofiles
fi

# Kill any existing ML service process
pkill -f "simple_main.py"
sleep 2

# Start the ML service
echo "🎯 Starting FastAPI ML Service on port 8001..."
nohup python simple_main.py > ml_service.log 2>&1 &

# Wait a moment for startup
sleep 5

# Check if service started successfully
if curl -s http://localhost:8001/health > /dev/null; then
    echo "✅ ML Service started successfully!"
    echo "🌐 ML API available at: http://localhost:8001"
    echo "📋 API docs at: http://localhost:8001/docs"
    echo "📊 Health check: http://localhost:8001/health"
else
    echo "❌ ML Service failed to start!"
    echo "Check log file: $(pwd)/ml_service.log"
    exit 1
fi