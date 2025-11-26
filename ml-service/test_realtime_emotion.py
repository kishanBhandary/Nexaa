#!/usr/bin/env python3
"""
Test script for Real-Time Emotion Detection
==========================================

This script tests the real-time emotion detection functionality
both as a standalone application and through the API.

Usage:
    python3 test_realtime_emotion.py [--mode live|image|api]

Modes:
    live  - Run live camera detection (OpenCV window)
    image - Test with a sample image  
    api   - Test the API endpoint
"""

import cv2
import numpy as np
import requests
import argparse
import sys
import time
import json
from pathlib import Path

def test_live_detection():
    """Test live emotion detection with camera"""
    print("🎥 Testing Live Emotion Detection")
    print("=" * 50)
    
    try:
        from realtime_emotion_detector import RealTimeFaceEmotionDetector
        
        # Create detector
        detector = RealTimeFaceEmotionDetector()
        print("✅ Emotion detector initialized")
        
        # Run live detection
        print("🚀 Starting live detection...")
        print("Press 'q' to quit, 's' to save screenshot")
        detector.run_live_detection()
        
    except Exception as e:
        print(f"❌ Error in live detection: {e}")
        return False
    
    return True

def test_image_detection():
    """Test emotion detection with a sample image"""
    print("🖼️ Testing Image Emotion Detection")
    print("=" * 50)
    
    try:
        from realtime_emotion_detector import RealTimeFaceEmotionDetector
        
        # Create detector
        detector = RealTimeFaceEmotionDetector()
        print("✅ Emotion detector initialized")
        
        # Create a test image if none exists
        test_image_path = "test_face.jpg"
        if not Path(test_image_path).exists():
            print("📸 Creating test image with webcam...")
            cap = cv2.VideoCapture(0)
            if not cap.isOpened():
                print("❌ Could not access camera for test image")
                return False
            
            ret, frame = cap.read()
            if ret:
                cv2.imwrite(test_image_path, frame)
                print(f"✅ Test image saved as {test_image_path}")
            cap.release()
        
        # Process the test image
        if Path(test_image_path).exists():
            print(f"🔍 Processing image: {test_image_path}")
            annotated_image = detector.process_image(
                test_image_path, 
                output_path="test_result.jpg"
            )
            print("✅ Image processed successfully!")
            print("📁 Results saved as 'test_result.jpg'")
            
            # Display results
            cv2.imshow("Original", cv2.imread(test_image_path))
            cv2.imshow("Emotion Detection Result", annotated_image)
            print("👁️ Press any key to close windows...")
            cv2.waitKey(0)
            cv2.destroyAllWindows()
            
        else:
            print("❌ No test image available")
            return False
        
    except Exception as e:
        print(f"❌ Error in image detection: {e}")
        return False
    
    return True

def test_api_detection():
    """Test emotion detection through API"""
    print("🌐 Testing API Emotion Detection")
    print("=" * 50)
    
    try:
        # Test API health first
        health_response = requests.get("http://localhost:8001/health")
        if health_response.status_code == 200:
            print("✅ ML Service is healthy")
            health_data = health_response.json()
            print(f"   Status: {health_data.get('status')}")
            print(f"   Gemini: {'✅' if health_data.get('dependencies', {}).get('gemini') else '❌'}")
        else:
            print("❌ ML Service is not healthy")
            return False
        
        # Test the demo page
        demo_response = requests.get("http://localhost:8001/demo/realtime")
        if demo_response.status_code == 200:
            print("✅ Real-time demo page is accessible")
            print("🌐 Visit: http://localhost:8001/demo/realtime")
        else:
            print("❌ Demo page not accessible")
            
        # Test video analysis endpoint with a test frame
        print("📹 Testing video analysis endpoint...")
        
        # Create a simple test image
        test_image = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.rectangle(test_image, (200, 150), (400, 350), (100, 100, 100), -1)  # Face-like rectangle
        cv2.circle(test_image, (280, 220), 10, (255, 255, 255), -1)  # Left eye
        cv2.circle(test_image, (360, 220), 10, (255, 255, 255), -1)  # Right eye
        cv2.rectangle(test_image, (300, 280), (340, 300), (255, 255, 255), -1)  # Mouth
        
        # Save test image
        cv2.imwrite("api_test_frame.jpg", test_image)
        
        # Send to API
        with open("api_test_frame.jpg", "rb") as f:
            files = {"video_file": ("test_frame.jpg", f, "image/jpeg")}
            data = {"user_id": "test_user"}
            headers = {"Authorization": "Bearer demo-token-123"}
            
            response = requests.post(
                "http://localhost:8001/analyze/video",
                files=files,
                data=data,
                headers=headers,
                timeout=30
            )
            
        if response.status_code == 200:
            result = response.json()
            print("✅ API analysis successful!")
            print(f"   Predicted emotion: {result.get('predicted_emotion', 'N/A')}")
            print(f"   Confidence: {result.get('confidence', 0):.3f}")
            print(f"   Analysis ID: {result.get('analysis_id', 'N/A')}")
        else:
            print(f"❌ API analysis failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
        
        # Clean up
        Path("api_test_frame.jpg").unlink(missing_ok=True)
        
    except Exception as e:
        print(f"❌ Error in API testing: {e}")
        return False
    
    return True

def run_performance_test():
    """Run performance test"""
    print("⚡ Performance Testing")
    print("=" * 50)
    
    try:
        from realtime_emotion_detector import RealTimeFaceEmotionDetector
        
        detector = RealTimeFaceEmotionDetector()
        
        # Create test image
        test_image = np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
        
        # Time multiple detections
        times = []
        num_tests = 10
        
        print(f"🔄 Running {num_tests} detection cycles...")
        
        for i in range(num_tests):
            start_time = time.time()
            detections = detector.detect_faces_and_emotions(test_image)
            end_time = time.time()
            
            processing_time = (end_time - start_time) * 1000  # ms
            times.append(processing_time)
            print(f"   Test {i+1}: {processing_time:.1f}ms - {len(detections)} faces")
        
        # Statistics
        avg_time = np.mean(times)
        min_time = np.min(times)
        max_time = np.max(times)
        fps = 1000 / avg_time
        
        print(f"\n📊 Performance Results:")
        print(f"   Average processing time: {avg_time:.1f}ms")
        print(f"   Min/Max time: {min_time:.1f}ms / {max_time:.1f}ms")
        print(f"   Theoretical max FPS: {fps:.1f}")
        
        if avg_time < 100:
            print("✅ Performance is excellent (< 100ms)")
        elif avg_time < 200:
            print("✅ Performance is good (< 200ms)")
        else:
            print("⚠️ Performance could be improved (> 200ms)")
            
    except Exception as e:
        print(f"❌ Error in performance test: {e}")
        return False
    
    return True

def main():
    """Main test function"""
    parser = argparse.ArgumentParser(description="Test Real-Time Emotion Detection")
    parser.add_argument(
        "--mode", 
        choices=["live", "image", "api", "performance", "all"],
        default="all",
        help="Test mode to run"
    )
    
    args = parser.parse_args()
    
    print("🧪 Nexaa Real-Time Emotion Detection Test Suite")
    print("=" * 60)
    print()
    
    # Check dependencies
    try:
        import cv2
        import numpy as np
        print(f"✅ OpenCV version: {cv2.__version__}")
    except ImportError:
        print("❌ OpenCV not available")
        sys.exit(1)
    
    try:
        import torch
        print(f"✅ PyTorch version: {torch.__version__}")
    except ImportError:
        print("⚠️ PyTorch not available (some features may be limited)")
    
    print()
    
    # Run tests based on mode
    success = True
    
    if args.mode == "live" or args.mode == "all":
        if not test_live_detection():
            success = False
        print()
    
    if args.mode == "image" or args.mode == "all":
        if not test_image_detection():
            success = False
        print()
    
    if args.mode == "api" or args.mode == "all":
        if not test_api_detection():
            success = False
        print()
    
    if args.mode == "performance" or args.mode == "all":
        if not run_performance_test():
            success = False
        print()
    
    # Final results
    print("🏁 Test Results")
    print("=" * 30)
    if success:
        print("✅ All tests passed successfully!")
        print()
        print("🚀 Your real-time emotion detection is ready!")
        print("🌐 Try the web demo: http://localhost:8001/demo/realtime")
    else:
        print("❌ Some tests failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()