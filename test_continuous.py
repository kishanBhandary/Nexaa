#!/usr/bin/env python3
"""
Test script for continuous emotion detection
"""

import requests
import json
import time
from io import BytesIO
from PIL import Image, ImageDraw
import numpy as np

# Create a simple test image (simulating a face)
def create_test_image():
    img = Image.new('RGB', (640, 480), color='lightblue')
    draw = ImageDraw.Draw(img)
    
    # Draw a simple face
    draw.ellipse([200, 150, 440, 390], fill='peachpuff', outline='black')  # Face
    draw.ellipse([250, 200, 290, 240], fill='black')  # Left eye
    draw.ellipse([350, 200, 390, 240], fill='black')  # Right eye
    draw.ellipse([300, 280, 340, 320], fill='black')  # Nose
    draw.arc([270, 320, 370, 370], 0, 180, fill='black', width=3)  # Smile
    
    img_bytes = BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes.getvalue()

# Create a simple test audio (silent audio for now)
def create_test_audio():
    # Create 2 seconds of silent audio
    sample_rate = 44100
    duration = 2
    audio_data = np.zeros(sample_rate * duration, dtype=np.float32)
    
    # Convert to bytes (WAV format simulation)
    audio_bytes = audio_data.tobytes()
    return audio_bytes

def test_continuous_endpoint():
    url = "http://localhost:8001/analyze/continuous"
    
    # JWT token from authentication
    token = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiI2OTFkYzRmYWYzYjgzMzY3MmYwZTIwNGQiLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzYzNTU4NjU5LCJleHAiOjE3NjM2NDUwNTl9.APmGox-9MAPDcXNUKwOe_zEK4LPtFm6lavnSl8UnA0o2rXIEbb93GjTTRpfnhhkp7f7B31v3tjKRgHcTGYXcDw"
    
    headers = {
        'Authorization': f'Bearer {token}'
    }
    
    # Create test data
    image_data = create_test_image()
    audio_data = create_test_audio()
    
    # Prepare form data
    files = {
        'video_file': ('test_frame.jpg', image_data, 'image/jpeg'),
        'audio_file': ('test_audio.wav', audio_data, 'audio/wav')
    }
    
    data = {
        'text': 'I am feeling happy and excited today!'
    }
    
    print("🚀 Testing continuous emotion detection endpoint...")
    print(f"📍 URL: {url}")
    print(f"📝 Text: {data['text']}")
    
    try:
        response = requests.post(url, files=files, data=data, headers=headers)
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Continuous emotion detection successful!")
            print(f"📋 Result: {json.dumps(result, indent=2)}")
            
            # Extract key information
            if 'overall_emotion' in result:
                overall = result['overall_emotion']
                print(f"\n🎯 Overall Emotion: {overall['emotion']} ({overall['confidence']:.2%})")
            
            if 'face_emotion' in result:
                face = result['face_emotion']
                print(f"😊 Face Emotion: {face['emotion']} ({face['confidence']:.2%})")
                
            if 'voice_emotion' in result:
                voice = result['voice_emotion']
                print(f"🎵 Voice Emotion: {voice['emotion']} ({voice['confidence']:.2%})")
                
            if 'text_emotion' in result:
                text = result['text_emotion']
                print(f"📝 Text Emotion: {text['emotion']} ({text['confidence']:.2%})")
                
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to ML service. Is it running on port 8001?")
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_continuous_endpoint()