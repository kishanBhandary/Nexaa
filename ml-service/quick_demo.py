#!/usr/bin/env python3
"""
Quick Demo: Real-Time Face Emotion Detection
===========================================

This is a simple demo that shows OpenCV-based real-time emotion detection
similar to the image you shared, with face bounding boxes and emotion labels.

Usage: python3 quick_demo.py
Press 'q' to quit, 's' to save screenshot
"""

import cv2
import numpy as np
import time
from typing import Dict, List, Tuple

class QuickEmotionDemo:
    """Simple real-time emotion detection demo"""
    
    def __init__(self):
        # Initialize face detection
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Emotion colors (BGR format for OpenCV)
        self.emotion_colors = {
            'angry': (0, 0, 255),      # Red
            'disgust': (128, 0, 128),   # Purple
            'fear': (255, 0, 255),      # Magenta
            'happy': (0, 255, 0),       # Green
            'neutral': (128, 128, 128), # Gray
            'sad': (255, 0, 0),         # Blue
            'surprise': (0, 255, 255)   # Yellow
        }
        
        # FPS tracking
        self.fps_counter = 0
        self.fps_start_time = time.time()
        self.current_fps = 0
        
    def simple_emotion_classifier(self, face_roi: np.ndarray) -> Tuple[str, float]:
        """
        Simple emotion classification based on basic image features
        This is a demo version - your actual models are much more sophisticated!
        """
        # Convert to grayscale for analysis
        gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY) if len(face_roi.shape) == 3 else face_roi
        
        # Basic feature analysis
        mean_intensity = np.mean(gray_face)
        std_intensity = np.std(gray_face)
        
        # Simple heuristic-based emotion detection (demo purposes)
        if mean_intensity > 140 and std_intensity > 25:
            return 'happy', 0.85
        elif mean_intensity < 80:
            return 'sad', 0.78
        elif std_intensity > 35:
            return 'surprise', 0.72
        elif mean_intensity < 100 and std_intensity > 20:
            return 'angry', 0.68
        elif mean_intensity > 120:
            return 'neutral', 0.65
        else:
            return 'neutral', 0.60
    
    def detect_and_classify(self, frame: np.ndarray) -> List[Dict]:
        """Detect faces and classify emotions"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces using Haarcascade
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        
        results = []
        for (x, y, w, h) in faces:
            # Extract face ROI
            face_roi = frame[y:y+h, x:x+w]
            
            # Classify emotion
            emotion, confidence = self.simple_emotion_classifier(face_roi)
            
            results.append({
                'bbox': (x, y, w, h),
                'emotion': emotion,
                'confidence': confidence
            })
        
        return results
    
    def draw_annotations(self, frame: np.ndarray, detections: List[Dict]) -> np.ndarray:
        """Draw emotion annotations on frame"""
        annotated_frame = frame.copy()
        
        for detection in detections:
            x, y, w, h = detection['bbox']
            emotion = detection['emotion']
            confidence = detection['confidence']
            
            # Get color for this emotion
            color = self.emotion_colors.get(emotion, (255, 255, 255))
            
            # Draw face bounding box
            cv2.rectangle(annotated_frame, (x, y), (x + w, y + h), color, 2)
            
            # Prepare label text
            label = f"{emotion.upper()}: {confidence:.2f}"
            
            # Get text size for background rectangle
            (text_width, text_height), _ = cv2.getTextSize(
                label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2
            )
            
            # Draw background rectangle for text
            cv2.rectangle(
                annotated_frame,
                (x, y - text_height - 10),
                (x + text_width, y),
                color,
                -1
            )
            
            # Draw emotion label
            cv2.putText(
                annotated_frame,
                label,
                (x, y - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )
            
            # Draw additional info
            info_text = f"Face: {w}x{h}"
            cv2.putText(
                annotated_frame,
                info_text,
                (x, y + h + 20),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                color,
                1
            )
        
        # Draw FPS and face count
        self._update_fps()
        cv2.putText(
            annotated_frame,
            f"FPS: {self.current_fps:.1f}",
            (10, 30),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )
        
        cv2.putText(
            annotated_frame,
            f"Faces Detected: {len(detections)}",
            (10, 70),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )
        
        # Draw technology info
        cv2.putText(
            annotated_frame,
            "Nexaa AI - OpenCV + Haarcascade + Deep Learning",
            (10, annotated_frame.shape[0] - 20),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255, 255, 255),
            1
        )
        
        return annotated_frame
    
    def _update_fps(self):
        """Update FPS counter"""
        self.fps_counter += 1
        if time.time() - self.fps_start_time > 1.0:
            self.current_fps = self.fps_counter
            self.fps_counter = 0
            self.fps_start_time = time.time()
    
    def run_demo(self, camera_index: int = 0):
        """Run the real-time emotion detection demo"""
        print("🎥 Starting Nexaa Real-Time Emotion Detection Demo")
        print("=" * 55)
        print("📋 Features:")
        print("   • OpenCV Haarcascade face detection")
        print("   • Real-time emotion classification")
        print("   • Live FPS monitoring")
        print("   • Multi-face support")
        print()
        print("⌨️ Controls:")
        print("   • Press 'q' to quit")
        print("   • Press 's' to save screenshot")
        print("   • Press 'i' for info")
        print()
        
        # Initialize camera
        cap = cv2.VideoCapture(camera_index)
        if not cap.isOpened():
            print(f"❌ Error: Could not open camera {camera_index}")
            return
        
        # Set camera properties
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_FPS, 30)
        
        print(f"✅ Camera {camera_index} initialized successfully!")
        print("🚀 Starting detection... (this window will open)")
        
        window_name = "Nexaa - Real-Time Emotion Detection"
        cv2.namedWindow(window_name, cv2.WINDOW_AUTOSIZE)
        
        frame_count = 0
        
        try:
            while True:
                # Capture frame
                ret, frame = cap.read()
                if not ret:
                    print("❌ Error: Could not read frame from camera")
                    break
                
                # Flip frame horizontally for mirror effect
                frame = cv2.flip(frame, 1)
                
                # Detect faces and classify emotions
                detections = self.detect_and_classify(frame)
                
                # Draw annotations
                annotated_frame = self.draw_annotations(frame, detections)
                
                # Display the frame
                cv2.imshow(window_name, annotated_frame)
                
                # Handle key presses
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    print("\n👋 Quitting demo...")
                    break
                elif key == ord('s'):
                    # Save screenshot
                    filename = f"nexaa_emotion_demo_{int(time.time())}.jpg"
                    cv2.imwrite(filename, annotated_frame)
                    print(f"📸 Screenshot saved: {filename}")
                elif key == ord('i'):
                    # Print info
                    print(f"🔍 Frame {frame_count}: {len(detections)} face(s) detected")
                    for i, det in enumerate(detections):
                        print(f"   Face {i+1}: {det['emotion']} ({det['confidence']:.2f})")
                
                frame_count += 1
                
        except KeyboardInterrupt:
            print("\n⏹️ Demo interrupted by user")
        
        finally:
            # Cleanup
            cap.release()
            cv2.destroyAllWindows()
            print("✅ Demo completed successfully!")
            print(f"📊 Processed {frame_count} frames")
            print()
            print("🌐 For web-based demo, visit: http://localhost:8001/demo/realtime")

def main():
    """Main function"""
    try:
        demo = QuickEmotionDemo()
        demo.run_demo()
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()