#!/bin/bash

echo "🚀 Starting Nexaa ML Service with Gemini AI"
echo "==========================================="

# Check if we're in the ml-service directory
if [ ! -f "main.py" ]; then
    echo "❌ Error: Please run this script from the ml-service directory"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "📝 Please edit .env and add your Gemini API key!"
    echo ""
fi

# Check if Gemini API key is set
if ! grep -q "GEMINI_API_KEY=AIza" .env 2>/dev/null; then
    echo "⚠️  Please set your GEMINI_API_KEY in the .env file"
    echo "   Get your API key from: https://makersuite.google.com/app/apikey"
    echo ""
fi

# Install required dependencies if needed
echo "📦 Checking dependencies..."
python3 -c "import fastapi, uvicorn" 2>/dev/null || {
    echo "Installing basic dependencies..."
    pip install fastapi uvicorn python-multipart requests pydantic
}

# Check for optional Gemini dependency
python3 -c "import google.generativeai" 2>/dev/null || {
    echo "Installing Gemini AI..."
    pip install google-generativeai
}

echo "✅ Starting ML Service..."
python3 main.py