#!/bin/bash

# FastAPI Startup Script
echo "🚀 Starting NexaModel FastAPI Service"
echo "==================================="

cd /home/kishan/Documents/Nexaaa/Nexaa/ml-service

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run ./quick_setup.sh first"
    exit 1
fi

# Check if the service is already running
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo "⚠️  Service already running on port 8001"
    echo "🌐 FastAPI is available at: http://localhost:8001"
    echo "📖 API docs at: http://localhost:8001/docs"
    exit 0
fi

echo "📦 Starting FastAPI service..."

# Export PYTHONPATH and start the service
export PYTHONPATH=/home/kishan/Documents/Nexaaa/Nexaa/ml-service

# Start the service
exec /home/kishan/Documents/Nexaaa/Nexaa/ml-service/venv/bin/uvicorn simple_main:app --host 0.0.0.0 --port 8001

echo "✅ FastAPI service started!"
echo "🌐 FastAPI is available at: http://localhost:8001"
echo "📖 API docs at: http://localhost:8001/docs"
echo "🧪 Test endpoint: http://localhost:8001/test"