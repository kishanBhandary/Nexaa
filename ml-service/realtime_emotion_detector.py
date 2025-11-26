"""
Real-Time Face Emotion Detection with Visualization
==================================================

This module provides real-time emotion detection with visual feedback
similar to OpenCV demos, featuring:
- Live face detection with bounding boxes
- Real-time emotion classification
- Confidence scores and emotion labels
- Multi-face support
- Performance optimized for live video

Author: Nexaa AI Team
Version: 1.0.0
"""

import cv2
import numpy as np
import torch
import time
from typing import Dict, List, Tuple, Optional
import logging
from dataclasses import dataclass

# Import your existing emotion models
try:
    from nexamodel_v2 import NexaModelV2
    MODEL_AVAILABLE = True
except ImportError:
    MODEL_AVAILABLE = False
    logging.warning("NexaModel V2 not available, using basic classification")

try:
    from real_pytorch_emotion_model import RealEmotionRecognizer
    PYTORCH_MODEL_AVAILABLE = True
except ImportError:
    PYTORCH_MODEL_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class FaceDetection:
    """Data class for face detection results"""
    x: int
    y: int
    width: int
    height: int
    emotion: str
    confidence: float
    probabilities: Dict[str, float]

class RealTimeFaceEmotionDetector:
    """
    Real-time face emotion detection with visual overlay
    """
    
    def __init__(self, use_gpu: bool = False):
        """Initialize the real-time face emotion detector"""
        self.device = 'cuda' if use_gpu and torch.cuda.is_available() else 'cpu'
        logger.info(f"🔧 Using device: {self.device}")
        
        # Initialize face detection
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        if self.face_cascade.empty():
            raise RuntimeError("❌ Failed to load face cascade classifier!")
        logger.info("✅ Face detection cascade loaded")
        
        # Initialize emotion recognition models
        self.emotion_model = None
        self._load_emotion_model()
        
        # Emotion labels and colors
        self.emotion_labels = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
        self.emotion_colors = {
            'angry': (0, 0, 255),      # Red
            'disgust': (128, 0, 128),   # Purple
            'fear': (255, 0, 255),      # Magenta
            'happy': (0, 255, 0),       # Green
            'neutral': (128, 128, 128), # Gray
            'sad': (255, 0, 0),         # Blue
            'surprise': (0, 255, 255)   # Yellow
        }
        
        # Performance tracking
        self.fps_counter = 0
        self.fps_start_time = time.time()
        self.current_fps = 0
        
        # Detection parameters
        self.min_face_size = (30, 30)
        self.scale_factor = 1.1
        self.min_neighbors = 5
        
    def _load_emotion_model(self):
        """Load the best available emotion recognition model"""
        try:
            if MODEL_AVAILABLE:
                self.emotion_model = NexaModelV2()
                logger.info("✅ Loaded NexaModel V2 for emotion recognition")
            elif PYTORCH_MODEL_AVAILABLE:
                self.emotion_model = RealEmotionRecognizer()
                logger.info("✅ Loaded PyTorch emotion model")
            else:
                logger.warning("⚠️ No advanced models available, using basic classification")
        except Exception as e:
            logger.error(f"❌ Failed to load emotion model: {e}")
            self.emotion_model = None
    
    def detect_faces_and_emotions(self, frame: np.ndarray) -> List[FaceDetection]:
        """
        Detect faces and classify emotions in a single frame
        
        Args:
            frame: Input BGR image frame
            
        Returns:
            List of FaceDetection objects with emotion predictions
        """
        # Convert to grayscale for face detection
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=self.scale_factor,
            minNeighbors=self.min_neighbors,
            minSize=self.min_face_size,
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        
        detections = []
        
        for (x, y, w, h) in faces:
            # Extract face ROI
            face_roi = frame[y:y+h, x:x+w]
            
            # Classify emotion
            emotion_result = self._classify_emotion(face_roi)
            
            detection = FaceDetection(
                x=x, y=y, width=w, height=h,
                emotion=emotion_result['emotion'],
                confidence=emotion_result['confidence'],
                probabilities=emotion_result['probabilities']
            )
            detections.append(detection)
            
        return detections
    
    def _classify_emotion(self, face_roi: np.ndarray) -> Dict:
        """
        Classify emotion for a single face region
        
        Args:
            face_roi: Face region of interest (BGR image)
            
        Returns:
            Dictionary with emotion classification results
        """
        if self.emotion_model is None:
            return self._basic_emotion_classification(face_roi)
        
        try:
            # Use the loaded model for emotion classification
            if hasattr(self.emotion_model, 'predict_emotion'):
                # NexaModel V2 style
                result = self.emotion_model.predict_emotion(face_image=face_roi)
                return {
                    'emotion': result.get('predicted_emotion', 'neutral'),
                    'confidence': result.get('confidence', 0.5),
                    'probabilities': result.get('all_probabilities', {})
                }
            else:
                # Try other model interfaces
                return self._basic_emotion_classification(face_roi)
                
        except Exception as e:
            logger.error(f"Error in emotion classification: {e}")
            return self._basic_emotion_classification(face_roi)
    
    def _basic_emotion_classification(self, face_roi: np.ndarray) -> Dict:
        """
        Basic emotion classification based on facial features
        
        Args:
            face_roi: Face region of interest
            
        Returns:
            Dictionary with basic emotion classification
        """
        # Convert to grayscale for analysis
        gray_face = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY) if len(face_roi.shape) == 3 else face_roi
        
        # Basic feature analysis
        mean_intensity = np.mean(gray_face)
        std_intensity = np.std(gray_face)
        
        # Simple heuristic-based emotion detection
        if mean_intensity > 140 and std_intensity > 25:
            emotion = 'happy'
            confidence = 0.75
        elif mean_intensity < 80:
            emotion = 'sad'
            confidence = 0.70
        elif std_intensity > 35:
            emotion = 'surprise'
            confidence = 0.65
        elif mean_intensity < 100 and std_intensity > 20:
            emotion = 'angry'
            confidence = 0.60
        else:
            emotion = 'neutral'
            confidence = 0.55
        
        # Create probability distribution
        probabilities = {label: 0.1 for label in self.emotion_labels}
        probabilities[emotion] = confidence
        
        # Normalize probabilities
        total = sum(probabilities.values())
        probabilities = {k: v/total for k, v in probabilities.items()}
        
        return {
            'emotion': emotion,
            'confidence': confidence,
            'probabilities': probabilities
        }
    
    def draw_emotion_overlay(self, frame: np.ndarray, detections: List[FaceDetection]) -> np.ndarray:
        """
        Draw emotion detection overlay on the frame
        
        Args:
            frame: Input BGR image frame
            detections: List of face detections with emotions
            
        Returns:
            Frame with emotion overlay drawn
        """
        annotated_frame = frame.copy()
        
        for detection in detections:
            # Get color for emotion
            color = self.emotion_colors.get(detection.emotion, (255, 255, 255))
            
            # Draw bounding box
            cv2.rectangle(
                annotated_frame,
                (detection.x, detection.y),
                (detection.x + detection.width, detection.y + detection.height),
                color,
                2
            )
            
            # Draw emotion label and confidence
            label = f"{detection.emotion}: {detection.confidence:.2f}"
            label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)[0]
            
            # Background rectangle for text
            cv2.rectangle(
                annotated_frame,
                (detection.x, detection.y - label_size[1] - 10),
                (detection.x + label_size[0], detection.y),
                color,
                -1
            )
            
            # Text label
            cv2.putText(
                annotated_frame,
                label,
                (detection.x, detection.y - 5),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )
            
            # Draw emotion probabilities (top 3)
            sorted_emotions = sorted(
                detection.probabilities.items(),
                key=lambda x: x[1],
                reverse=True
            )[:3]
            
            for i, (emotion, prob) in enumerate(sorted_emotions):
                prob_text = f"{emotion}: {prob:.3f}"
                cv2.putText(
                    annotated_frame,
                    prob_text,
                    (detection.x, detection.y + detection.height + 20 + i * 20),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    color,
                    1
                )
        
        # Draw FPS counter
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
        
        # Draw detection count
        cv2.putText(
            annotated_frame,
            f"Faces: {len(detections)}",
            (10, 70),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )
        
        return annotated_frame
    
    def _update_fps(self):
        """Update FPS counter"""
        self.fps_counter += 1
        if time.time() - self.fps_start_time > 1.0:
            self.current_fps = self.fps_counter
            self.fps_counter = 0
            self.fps_start_time = time.time()
    
    def run_live_detection(self, camera_index: int = 0, window_name: str = "Nexaa - Real-Time Emotion Detection"):
        """
        Run live emotion detection from camera
        
        Args:
            camera_index: Camera index (usually 0 for default camera)
            window_name: OpenCV window name
        """
        # Initialize camera
        cap = cv2.VideoCapture(camera_index)
        if not cap.isOpened():
            raise RuntimeError(f"❌ Could not open camera {camera_index}")
        
        # Set camera properties
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_FPS, 30)
        
        logger.info(f"🎥 Starting live emotion detection on camera {camera_index}")
        logger.info("Press 'q' to quit, 's' to save current frame")
        
        try:
            while True:
                # Capture frame
                ret, frame = cap.read()
                if not ret:
                    logger.error("❌ Failed to capture frame")
                    break
                
                # Flip frame horizontally for mirror effect
                frame = cv2.flip(frame, 1)
                
                # Detect faces and emotions
                detections = self.detect_faces_and_emotions(frame)
                
                # Draw overlay
                annotated_frame = self.draw_emotion_overlay(frame, detections)
                
                # Display frame
                cv2.imshow(window_name, annotated_frame)
                
                # Handle key presses
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    logger.info("👋 Quitting live detection")
                    break
                elif key == ord('s'):
                    # Save current frame
                    filename = f"emotion_detection_{int(time.time())}.jpg"
                    cv2.imwrite(filename, annotated_frame)
                    logger.info(f"📸 Saved frame to {filename}")
                
        except KeyboardInterrupt:
            logger.info("👋 Detection stopped by user")
        
        finally:
            # Cleanup
            cap.release()
            cv2.destroyAllWindows()
    
    def process_image(self, image_path: str, output_path: Optional[str] = None) -> np.ndarray:
        """
        Process a single image for emotion detection
        
        Args:
            image_path: Path to input image
            output_path: Optional path to save annotated image
            
        Returns:
            Annotated image with emotion overlay
        """
        # Load image
        frame = cv2.imread(image_path)
        if frame is None:
            raise ValueError(f"❌ Could not load image: {image_path}")
        
        # Detect emotions
        detections = self.detect_faces_and_emotions(frame)
        
        # Draw overlay
        annotated_frame = self.draw_emotion_overlay(frame, detections)
        
        # Save if output path provided
        if output_path:
            cv2.imwrite(output_path, annotated_frame)
            logger.info(f"💾 Saved annotated image to: {output_path}")
        
        return annotated_frame

def main():
    """Main function to run the emotion detection demo"""
    try:
        # Create detector
        detector = RealTimeFaceEmotionDetector()
        
        # Run live detection
        detector.run_live_detection()
        
    except Exception as e:
        logger.error(f"❌ Error in main: {e}")
        raise

if __name__ == "__main__":
    main()