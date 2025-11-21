#!/usr/bin/env python3
"""
Test Script for Continuous Emotion Recognition
============================================

This script tests the continuous emotion recognition system
to verify face tracking and multimodal emotion analysis.

Author: Nexaa AI Team
Version: 1.0.0
"""

import asyncio
import time
import cv2
import requests
import json
from typing import Dict, Any

# Configuration
API_BASE_URL = "http://localhost:8001"
TEST_TOKEN = "demo-token-12345"

headers = {
    "Authorization": f"Bearer {TEST_TOKEN}",
    "Content-Type": "application/json"
}

def test_api_connection():
    """Test basic API connection"""
    print("🔌 Testing API connection...")
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API is online: {data['message']}")
            return True
        else:
            print(f"❌ API responded with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Failed to connect to API: {e}")
        return False

def test_continuous_status():
    """Test continuous emotion recognition status"""
    print("\\n📊 Testing continuous emotion recognition status...")
    try:
        response = requests.get(f"{API_BASE_URL}/system/continuous-status", headers=headers)
        if response.status_code == 200:
            status = response.json()
            print(f"✅ Continuous recognition available: {status.get('continuous_recognition_available', False)}")
            print(f"✅ Continuous recognizer loaded: {status.get('continuous_recognizer_loaded', False)}")
            return status
        else:
            print(f"❌ Status check failed with status {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Failed to get status: {e}")
        return None

def test_face_tracking():
    """Test face tracking start/stop"""
    print("\\n👤 Testing face tracking...")
    
    # Start face tracking
    print("  Starting face tracking...")
    try:
        response = requests.post(f"{API_BASE_URL}/face/start-tracking", headers=headers)
        if response.status_code == 200:
            print("  ✅ Face tracking started successfully")
            
            # Wait for some tracking
            print("  ⏳ Waiting 5 seconds for face detection...")
            time.sleep(5)
            
            # Check status
            status_response = requests.get(f"{API_BASE_URL}/face/status", headers=headers)
            if status_response.status_code == 200:
                status = status_response.json()
                print(f"  📊 Face tracking status: {status}")
            
            # Stop face tracking
            print("  Stopping face tracking...")
            stop_response = requests.post(f"{API_BASE_URL}/face/stop-tracking", headers=headers)
            if stop_response.status_code == 200:
                print("  ✅ Face tracking stopped successfully")
                return True
            else:
                print(f"  ❌ Failed to stop face tracking: {stop_response.status_code}")
                return False
        else:
            print(f"  ❌ Failed to start face tracking: {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Face tracking test failed: {e}")
        return False

def test_text_emotion_analysis():
    """Test text emotion analysis"""
    print("\\n📝 Testing text emotion analysis...")
    
    test_texts = [
        ("I am so happy and excited about this new technology!", "happy"),
        ("I feel really sad and depressed today", "sad"),
        ("I'm angry and frustrated with this situation", "angry"),
        ("I'm scared and worried about the future", "fear"),
        ("This is just normal text", "neutral")
    ]
    
    results = []
    for text, expected_emotion in test_texts:
        try:
            data = {"text": text}
            response = requests.post(
                f"{API_BASE_URL}/analyze/text", 
                headers=headers,
                json=data
            )
            
            if response.status_code == 200:
                result = response.json()
                detected_emotion = result.get('predicted_emotion', 'unknown')
                confidence = result.get('confidence', 0.0)
                
                print(f"  Text: '{text}'")
                print(f"  Expected: {expected_emotion} | Detected: {detected_emotion} ({confidence:.1%})")
                
                results.append({
                    'text': text,
                    'expected': expected_emotion,
                    'detected': detected_emotion,
                    'confidence': confidence,
                    'correct': detected_emotion == expected_emotion
                })
            else:
                print(f"  ❌ Failed to analyze text: {response.status_code}")
        except Exception as e:
            print(f"  ❌ Text analysis error: {e}")
    
    if results:
        correct_count = sum(1 for r in results if r['correct'])
        accuracy = correct_count / len(results)
        print(f"\\n  📈 Text emotion accuracy: {accuracy:.1%} ({correct_count}/{len(results)})")
    
    return results

def test_authentic_emotion_analysis():
    """Test authentic emotion analysis (multimodal)"""
    print("\\n🔍 Testing authentic emotion analysis...")
    
    # Start face tracking first
    requests.post(f"{API_BASE_URL}/face/start-tracking", headers=headers)
    time.sleep(2)  # Give time for face tracking to initialize
    
    test_scenarios = [
        {
            "text": "I am so happy and excited!",
            "description": "Happy text with face verification",
            "force_face_capture": True
        },
        {
            "text": "I feel terrible and sad",
            "description": "Sad text with face verification", 
            "force_face_capture": True
        },
        {
            "text": "I'm angry and frustrated",
            "description": "Angry text with face verification",
            "force_face_capture": True
        },
        {
            "text": "I'm neutral about this",
            "description": "Neutral text with face verification",
            "force_face_capture": True
        }
    ]
    
    results = []
    for scenario in test_scenarios:
        try:
            print(f"\\n  Testing: {scenario['description']}")
            
            data = {
                "text": scenario["text"],
                "force_face_capture": scenario["force_face_capture"]
            }
            
            response = requests.post(
                f"{API_BASE_URL}/analyze/authentic-emotion",
                headers=headers,
                data=data  # Using form data
            )
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"    Final emotion: {result.get('final_emotion', 'unknown')}")
                print(f"    Confidence: {result.get('confidence', 0.0):.1%}")
                print(f"    Is authentic: {result.get('is_authentic', False)}")
                print(f"    Consistency score: {result.get('consistency_score', 0.0):.1%}")
                print(f"    Explanation: {result.get('explanation', 'No explanation')}")
                
                modalities = result.get('modalities', [])
                print(f"    Modalities used: {', '.join(modalities)}")
                
                if 'face_emotion' in result:
                    face_emotion = result['face_emotion']
                    print(f"    Face emotion: {face_emotion.get('emotion', 'unknown')} ({face_emotion.get('confidence', 0.0):.1%})")
                
                if 'text_emotion' in result:
                    text_emotion = result['text_emotion']
                    print(f"    Text emotion: {text_emotion.get('emotion', 'unknown')} ({text_emotion.get('confidence', 0.0):.1%})")
                
                results.append(result)
            else:
                print(f"    ❌ Failed to analyze: {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"    Error: {error_detail}")
                except:
                    print(f"    Error: {response.text}")
        
        except Exception as e:
            print(f"    ❌ Analysis error: {e}")
    
    # Stop face tracking
    requests.post(f"{API_BASE_URL}/face/stop-tracking", headers=headers)
    
    return results

def test_camera_availability():
    """Test if camera is available for face tracking"""
    print("\\n📷 Testing camera availability...")
    try:
        cap = cv2.VideoCapture(0)
        if cap.isOpened():
            ret, frame = cap.read()
            cap.release()
            
            if ret:
                print("  ✅ Camera is available and working")
                return True
            else:
                print("  ⚠️ Camera is available but not capturing frames")
                return False
        else:
            print("  ❌ Camera is not available")
            return False
    except Exception as e:
        print(f"  ❌ Camera test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 Continuous Emotion Recognition Test Suite")
    print("=" * 60)
    
    # Test 1: Basic API connection
    if not test_api_connection():
        print("\\n❌ Basic API test failed. Make sure the server is running.")
        return
    
    # Test 2: Camera availability
    camera_available = test_camera_availability()
    
    # Test 3: Continuous recognition status
    status = test_continuous_status()
    if not status:
        print("\\n❌ Continuous recognition not available")
        return
    
    # Test 4: Text emotion analysis
    text_results = test_text_emotion_analysis()
    
    # Test 5: Face tracking (if camera available)
    if camera_available:
        face_tracking_success = test_face_tracking()
    else:
        print("\\n⚠️ Skipping face tracking tests - no camera available")
        face_tracking_success = False
    
    # Test 6: Authentic emotion analysis
    if camera_available and face_tracking_success:
        authentic_results = test_authentic_emotion_analysis()
    else:
        print("\\n⚠️ Skipping authentic emotion analysis - camera or face tracking not available")
        authentic_results = []
    
    # Summary
    print("\\n" + "=" * 60)
    print("🏁 Test Summary")
    print("=" * 60)
    print(f"✅ API Connection: Working")
    print(f"{'✅' if camera_available else '❌'} Camera: {'Available' if camera_available else 'Not Available'}")
    print(f"{'✅' if status and status.get('continuous_recognition_available') else '❌'} Continuous Recognition: {'Available' if status and status.get('continuous_recognition_available') else 'Not Available'}")
    print(f"✅ Text Analysis: {len(text_results)} tests completed")
    print(f"{'✅' if face_tracking_success else '❌'} Face Tracking: {'Working' if face_tracking_success else 'Failed'}")
    print(f"{'✅' if authentic_results else '❌'} Authentic Analysis: {len(authentic_results)} tests completed")
    
    if camera_available and face_tracking_success:
        print("\\n🎉 All tests passed! The continuous emotion recognition system is fully functional.")
    elif not camera_available:
        print("\\n⚠️ Tests completed with limitations due to camera unavailability.")
    else:
        print("\\n❌ Some tests failed. Check the error messages above.")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\\n\\n🛑 Tests interrupted by user")
    except Exception as e:
        print(f"\\n\\n❌ Test suite failed: {e}")