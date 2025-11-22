/**
 * NexaModel ML Service API Client
 * 
 * This service handles communication with the FastAPI ML service
 * for emotion recognition and analysis.
 */

const ML_API_BASE = import.meta.env.VITE_ML_API_BASE || 'http://localhost:8001';

class MLService {
  constructor() {
    this.apiBase = ML_API_BASE;
  }

  /**
   * Set authentication token for API requests
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Get headers for API requests
   */
  getHeaders(includeContentType = true) {
    const headers = {};
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.detail || 'API request failed';
      } catch {
        errorMessage = errorText || `HTTP error! status: ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json();
  }

  /**
   * Check ML service health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.apiBase}/health`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Get ML model information
   */
  async getModelInfo() {
    try {
      const response = await fetch(`${this.apiBase}/model/info`, {
        headers: this.getHeaders()
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Model info request failed:', error);
      throw error;
    }
  }

  /**
   * Analyze emotion from text
   */
  async analyzeText(text, userId = null) {
    try {
      const response = await fetch(`${this.apiBase}/analyze/text`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          text: text,
          user_id: userId
        })
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('Text analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze emotion from audio/voice
   */
  async analyzeVoice(audioBlob, userId = null) {
    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.wav');
      
      if (userId) {
        formData.append('user_id', userId);
      }

      const response = await fetch(`${this.apiBase}/analyze/voice`, {
        method: 'POST',
        headers: this.getHeaders(false), // Don't include Content-Type for FormData
        body: formData
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('Voice analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze emotion from video/image
   */
  async analyzeVideo(imageBlob, userId = null) {
    try {
      const formData = new FormData();
      formData.append('video_file', imageBlob, 'frame.jpg');
      
      if (userId) {
        formData.append('user_id', userId);
      }

      const response = await fetch(`${this.apiBase}/analyze/video`, {
        method: 'POST',
        headers: this.getHeaders(false), // Don't include Content-Type for FormData
        body: formData
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('Video analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze emotion from multiple inputs (multimodal)
   */
  async analyzeMultimodal({ text = null, audioBlob = null, imageBlob = null, userId = null }) {
    try {
      const formData = new FormData();
      
      if (text) {
        formData.append('text', text);
      }
      
      if (audioBlob) {
        formData.append('audio_file', audioBlob, 'audio.wav');
      }
      
      if (imageBlob) {
        formData.append('video_file', imageBlob, 'frame.jpg');
      }
      
      if (userId) {
        formData.append('user_id', userId);
      }

      const response = await fetch(`${this.apiBase}/analyze/multimodal`, {
        method: 'POST',
        headers: this.getHeaders(false), // Don't include Content-Type for FormData
        body: formData
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('Multimodal analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get audio response URL
   */
  getAudioUrl(filename) {
    return `${this.apiBase}/audio/${filename}`;
  }

  /**
   * Process audio file for upload
   */
  async processAudioFile(audioFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const audioBlob = new Blob([reader.result], { type: audioFile.type });
        resolve(audioBlob);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(audioFile);
    });
  }

  /**
   * Capture frame from video element
   */
  captureVideoFrame(videoElement, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoElement, 0, 0);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    });
  }

  /**
   * Record audio from media stream
   */
  async recordAudio(stream, duration = null) {
    return new Promise((resolve, reject) => {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const audioChunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        resolve(audioBlob);
      };
      
      mediaRecorder.onerror = reject;
      
      mediaRecorder.start();
      
      if (duration) {
        setTimeout(() => {
          mediaRecorder.stop();
        }, duration);
      }
      
      return mediaRecorder;
    });
  }

  /**
   * Validate service availability
   */
  async validateService() {
    try {
      const health = await this.checkHealth();
      return {
        available: true,
        status: health.status,
        modelLoaded: health.model_loaded
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }

  /**
   * Format emotion result for display
   */
  formatEmotionResult(result) {
    if (!result) return null;

    return {
      ...result,
      formattedConfidence: `${(result.confidence * 100).toFixed(1)}%`,
      sortedProbabilities: Object.entries(result.all_probabilities)
        .sort(([,a], [,b]) => b - a)
        .map(([emotion, probability]) => ({
          emotion,
          probability,
          formattedProbability: `${(probability * 100).toFixed(1)}%`
        }))
    };
  }

  /**
   * Get emotion emoji
   */
  getEmotionEmoji(emotion) {
    const emojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      fear: '😨',
      surprise: '😲',
      disgust: '🤢',
      neutral: '😐'
    };
    return emojis[emotion?.toLowerCase()] || '🤔';
  }

  /**
   * Get emotion color class
   */
  getEmotionColor(emotion) {
    const colors = {
      happy: 'text-yellow-400',
      sad: 'text-blue-400',
      angry: 'text-red-400',
      fear: 'text-purple-400',
      surprise: 'text-pink-400',
      disgust: 'text-green-400',
      neutral: 'text-gray-400'
    };
    return colors[emotion?.toLowerCase()] || 'text-gray-400';
  }
}

// Create singleton instance
const mlService = new MLService();

export default mlService;