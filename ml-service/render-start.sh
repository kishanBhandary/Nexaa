#!/bin/bash
# Render Start Script for NexaModel ML Service

set -e

echo "Starting NexaModel ML Service on Render..."

# Set environment variables for production
export FASTAPI_HOST=0.0.0.0
export FASTAPI_PORT=${PORT:-8001}
export ENVIRONMENT=production

# Create directories if they don't exist
mkdir -p uploads temp logs

# Start the FastAPI service
echo "Starting FastAPI server on port $FASTAPI_PORT..."
exec uvicorn main:app --host $FASTAPI_HOST --port $FASTAPI_PORT --workers 1