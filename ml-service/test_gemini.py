#!/usr/bin/env python3
"""
Quick test script for Gemini API key validation
"""

import os
import sys
from dotenv import load_dotenv

def test_gemini_api():
    """Test if Gemini API key is working"""
    
    # Load environment variables
    load_dotenv()
    
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key or api_key == "your_gemini_api_key_here":
        print("❌ No valid Gemini API key found!")
        print("\nTo fix this:")
        print("1. Go to https://makersuite.google.com/app/apikey")
        print("2. Create a new API key (it's free)")
        print("3. Copy the API key")
        print("4. Edit the .env file in ml-service folder")
        print("5. Replace 'your_gemini_api_key_here' with your actual API key")
        print("\nExample:")
        print("GEMINI_API_KEY=AIzaSyYour_Real_API_Key_Here")
        return False
    
    try:
        import google.generativeai as genai
        
        print("🔧 Testing Gemini API key...")
        
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Create a simple model
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        
        # Test with a simple prompt
        response = model.generate_content("Say hello!")
        
        if response.candidates and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if candidate.content and candidate.content.parts:
                text = candidate.content.parts[0].text
                print(f"✅ Gemini API is working!")
                print(f"📝 Test response: {text}")
                return True
        
        print("❌ Got empty response from Gemini")
        return False
        
    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        print("\nPossible issues:")
        print("1. Invalid API key")
        print("2. API key doesn't have necessary permissions") 
        print("3. Network connectivity issues")
        print("4. Quota exceeded")
        return False

if __name__ == "__main__":
    print("🧪 Testing Gemini API Integration...")
    print("=" * 50)
    
    success = test_gemini_api()
    
    if success:
        print("\n✅ All tests passed! Gemini is ready to use.")
        print("You can now restart the ML service and test your chat.")
    else:
        print("\n❌ Tests failed. Please fix the issues above.")
        sys.exit(1)