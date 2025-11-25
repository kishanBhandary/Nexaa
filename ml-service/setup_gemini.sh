#!/bin/bash

echo "🚀 Setting up Nexaa ML Service with Gemini AI Integration"
echo "============================================================"

# Check if we're in the ml-service directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: Please run this script from the ml-service directory"
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install google-generativeai==0.3.2
pip install fastapi==0.104.1
pip install uvicorn[standard]==0.24.0
pip install python-multipart==0.0.6
pip install requests==2.31.0
pip install pydantic==2.5.0

echo "✅ Dependencies installed successfully!"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating environment file..."
    cp .env.example .env
    echo ""
    echo "📝 Please edit the .env file and add your Gemini API key:"
    echo "   1. Get your API key from: https://makersuite.google.com/app/apikey"
    echo "   2. Open .env file and replace 'your_gemini_api_key_here' with your actual API key"
    echo ""
else
    echo "ℹ️ .env file already exists. Make sure your GEMINI_API_KEY is set correctly."
fi

# Check if the service can start
echo "🔍 Testing service startup..."
python3 -c "
import sys
try:
    import google.generativeai as genai
    from fastapi import FastAPI
    print('✅ All dependencies are working correctly!')
except ImportError as e:
    print(f'❌ Import error: {e}')
    sys.exit(1)
"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Add your Gemini API key to the .env file"
echo "   2. Start the ML service: python3 main.py"
echo "   3. The service will be available at http://localhost:8001"
echo ""
echo "🔗 New Gemini endpoints:"
echo "   • POST /chat/gemini - Generate AI responses with emotion context"
echo "   • GET /health - Check service and Gemini AI status"
echo ""