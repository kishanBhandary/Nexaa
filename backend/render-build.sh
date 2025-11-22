#!/usr/bin/env bash

# Render build script for Nexaa Backend
# Since the JAR is already built, we just need to ensure it exists

echo "Checking for existing JAR file..."

if [ -f "target/nexaa-backend-1.0.0.jar" ]; then
    echo "✅ JAR file found: target/nexaa-backend-1.0.0.jar"
    echo "Build completed successfully!"
else
    echo "❌ Error: JAR file not found at target/nexaa-backend-1.0.0.jar"
    echo "Available files in target directory:"
    ls -la target/ || echo "Target directory not found"
    exit 1
fi