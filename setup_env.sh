#!/bin/bash

# Setup Environment Variables for Nexaa Project
# This script helps you set up environment variables securely

echo "🔐 Nexaa Environment Setup"
echo "=========================="
echo

# Check if .env files exist
check_env_file() {
    local service=$1
    local env_file="$service/.env"
    local example_file="$service/.env.example"
    
    if [ ! -f "$env_file" ]; then
        if [ -f "$example_file" ]; then
            echo "📋 Creating $env_file from $example_file..."
            cp "$example_file" "$env_file"
            echo "✅ Created $env_file"
            echo "⚠️  Please edit $env_file and add your real API keys!"
        else
            echo "❌ Neither $env_file nor $example_file exists for $service"
        fi
    else
        echo "✅ $env_file already exists for $service"
    fi
}

# Function to prompt for API key
prompt_for_gemini_key() {
    echo
    echo "🤖 Gemini AI Setup"
    echo "=================="
    echo "You need a Google Gemini API key for AI responses."
    echo "Get it from: https://makersuite.google.com/app/apikey"
    echo
    
    if [ -f "ml-service/.env" ]; then
        current_key=$(grep "GEMINI_API_KEY=" ml-service/.env | cut -d'=' -f2)
        if [ "$current_key" != "your_gemini_api_key_here" ] && [ -n "$current_key" ]; then
            echo "✅ Gemini API key is already configured"
            return
        fi
    fi
    
    read -p "Enter your Gemini API key (or press Enter to skip): " gemini_key
    
    if [ -n "$gemini_key" ]; then
        sed -i "s/GEMINI_API_KEY=.*/GEMINI_API_KEY=$gemini_key/" ml-service/.env
        echo "✅ Gemini API key updated!"
    else
        echo "⚠️  Skipped Gemini API key setup. Update ml-service/.env manually."
    fi
}

# Main setup
echo "Checking environment files..."

# Check each service
check_env_file "ml-service"
check_env_file "frontend" 
check_env_file "backend"

# Prompt for Gemini API key
prompt_for_gemini_key

echo
echo "🔒 Security Reminders:"
echo "====================="
echo "1. ✅ .env files are in .gitignore (won't be committed)"
echo "2. ✅ .env.example files will be committed (safe templates)"
echo "3. ⚠️  NEVER commit real API keys to GitHub!"
echo "4. ⚠️  Use environment variables in production"

echo
echo "🚀 Next Steps:"
echo "============="
echo "1. Review and edit .env files with your real API keys"
echo "2. Run: ./start_all.sh to start all services"
echo "3. For production: use secure environment variable management"

echo
echo "📝 Note: If you already pushed .env files to GitHub:"
echo "1. Regenerate your API keys immediately"
echo "2. Run: git rm --cached ml-service/.env frontend/.env backend/.env"
echo "3. Commit the removal: git commit -m 'Remove environment files from tracking'"