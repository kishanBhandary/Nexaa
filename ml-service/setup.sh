#!/bin/bash

# NexaModel ML Service Setup Script
echo "Setting up NexaModel ML Service..."

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

# Install requirements
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create necessary directories
echo "Creating directories..."
mkdir -p uploads
mkdir -p temp
mkdir -p logs

echo "Setup complete!"
echo "To run the service:"
echo "1. source venv/bin/activate"
echo "2. python main.py"
echo "Or use: uvicorn main:app --host 0.0.0.0 --port 8001 --reload"