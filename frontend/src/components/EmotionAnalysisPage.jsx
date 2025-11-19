import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Camera, CameraOff, MessageCircle, Send, Volume2, VolumeX, Loader, LogOut, MessageSquare, ArrowLeft } from 'lucide-react';

const EmotionAnalysisPage = ({ user, authToken, onSignOut, onNavigateToChat }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioResponse, setAudioResponse] = useState(null);
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);
  const [error, setError] = useState(null);
  
  // Continuous emotion detection states
  const [isContinuousMode, setIsContinuousMode] = useState(false);
  const [continuousResults, setContinuousResults] = useState([]);
  const [isCapturingContinuous, setIsCapturingContinuous] = useState(false);

  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const audioElementRef = useRef(null);
  
  // Continuous mode refs
  const continuousIntervalRef = useRef(null);
  const continuousStreamRef = useRef(null);

  const API_BASE = 'http://localhost:8001';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      // Clean up continuous mode
      if (continuousIntervalRef.current) {
        clearInterval(continuousIntervalRef.current);
      }
      if (continuousStreamRef.current) {
        continuousStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await analyzeAudio(audioBlob);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  };

  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Start video
  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setIsVideoOn(true);
      setError(null);
    } catch (err) {
      console.error('Error starting video:', err);
      setError('Failed to start video. Please check camera permissions.');
    }
  };

  // Stop video
  const stopVideo = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsVideoOn(false);
  };

  // Capture video frame
  const captureFrame = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob(async (blob) => {
        await analyzeVideo(blob);
      }, 'image/jpeg', 0.8);
    }
  };

  // Analysis functions
  const analyzeText = async () => {
    if (!textInput.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/analyze/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          text: textInput,
          user_id: user?.id
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
      
      if (result.voice_response_url) {
        setAudioResponse(`${API_BASE}${result.voice_response_url}`);
      }
    } catch (err) {
      console.error('Text analysis error:', err);
      setError('Failed to analyze text. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeAudio = async (audioBlob) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.wav');

      const response = await fetch(`${API_BASE}/analyze/voice`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
      
      if (result.voice_response_url) {
        setAudioResponse(`${API_BASE}${result.voice_response_url}`);
      }
    } catch (err) {
      console.error('Audio analysis error:', err);
      setError('Failed to analyze audio. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeVideo = async (imageBlob) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('video_file', imageBlob, 'frame.jpg');

      const response = await fetch(`${API_BASE}/analyze/video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
      
      if (result.voice_response_url) {
        setAudioResponse(`${API_BASE}${result.voice_response_url}`);
      }
    } catch (err) {
      console.error('Video analysis error:', err);
      setError('Failed to analyze video. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeMultimodal = async () => {
    if (!textInput.trim() && !isVideoOn && !isRecording) {
      setError('Please provide at least one input (text, video, or audio)');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      
      if (textInput.trim()) {
        formData.append('text', textInput);
      }

      // Capture video frame if video is on
      if (isVideoOn && videoRef.current) {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);
        
        const imageBlob = await new Promise(resolve => {
          canvas.toBlob(resolve, 'image/jpeg', 0.8);
        });
        
        formData.append('video_file', imageBlob, 'frame.jpg');
      }

      const response = await fetch(`${API_BASE}/analyze/multimodal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
      
      if (result.voice_response_url) {
        setAudioResponse(`${API_BASE}${result.voice_response_url}`);
      }
    } catch (err) {
      console.error('Multimodal analysis error:', err);
      setError('Failed to analyze inputs. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Continuous Emotion Detection Functions
  const startContinuousDetection = async () => {
    if (isCapturingContinuous) return;
    
    try {
      setIsCapturingContinuous(true);
      setError(null);
      setContinuousResults([]);
      
      // Get access to camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      continuousStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Start continuous capture every 3 seconds
      continuousIntervalRef.current = setInterval(async () => {
        await captureContinuousEmotion();
      }, 3000);
      
    } catch (err) {
      console.error('Failed to start continuous detection:', err);
      setError('Failed to access camera/microphone');
      setIsCapturingContinuous(false);
    }
  };

  const stopContinuousDetection = () => {
    setIsCapturingContinuous(false);
    
    // Stop interval
    if (continuousIntervalRef.current) {
      clearInterval(continuousIntervalRef.current);
      continuousIntervalRef.current = null;
    }
    
    // Stop media stream
    if (continuousStreamRef.current) {
      continuousStreamRef.current.getTracks().forEach(track => track.stop());
      continuousStreamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureContinuousEmotion = async () => {
    if (!continuousStreamRef.current || !videoRef.current) return;
    
    try {
      // Capture video frame
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
      
      // Capture audio (2 seconds)
      const audioRecorder = new MediaRecorder(continuousStreamRef.current);
      const audioChunks = [];
      
      audioRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      const audioBlob = await new Promise((resolve) => {
        audioRecorder.onstop = () => {
          resolve(new Blob(audioChunks, { type: 'audio/wav' }));
        };
        
        audioRecorder.start();
        setTimeout(() => {
          audioRecorder.stop();
        }, 2000);
      });
      
      // Send to continuous analysis endpoint
      const formData = new FormData();
      formData.append('video_file', imageBlob, 'frame.jpg');
      formData.append('audio_file', audioBlob, 'audio.wav');
      formData.append('text', textInput || ''); // Include any text input
      
      const response = await fetch(`${API_BASE}/analyze/continuous`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Add timestamp and update results
      const timestampedResult = {
        ...result,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setContinuousResults(prev => [...prev.slice(-9), timestampedResult]); // Keep last 10 results
      
    } catch (err) {
      console.error('Continuous capture error:', err);
    }
  };

  // Play audio response
  const playAudioResponse = () => {
    if (audioResponse && audioElementRef.current) {
      setIsPlayingResponse(true);
      audioElementRef.current.play()
        .then(() => {
          // Audio playing
        })
        .catch(err => {
          console.error('Audio play error:', err);
          setError('Failed to play audio response');
          setIsPlayingResponse(false);
        });
    }
  };

  const getEmotionColor = (emotion) => {
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
  };

  const getEmotionBg = (emotion) => {
    const colors = {
      happy: 'bg-yellow-400/20',
      sad: 'bg-blue-400/20',
      angry: 'bg-red-400/20',
      fear: 'bg-purple-400/20',
      surprise: 'bg-pink-400/20',
      disgust: 'bg-green-400/20',
      neutral: 'bg-gray-400/20'
    };
    return colors[emotion?.toLowerCase()] || 'bg-gray-400/20';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">NexaModel Emotion Analysis</h1>
            <p className="text-gray-300">Analyze emotions through voice, video, and text</p>
            {user && (
              <p className="text-gray-400 text-sm mt-2">Welcome, {user.name || user.email}</p>
            )}
            
            {/* Mode Toggle */}
            <div className="mt-4 flex items-center gap-4">
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={isContinuousMode}
                  onChange={(e) => {
                    setIsContinuousMode(e.target.checked);
                    if (!e.target.checked && isCapturingContinuous) {
                      stopContinuousDetection();
                    }
                  }}
                  className="rounded text-blue-600"
                />
                <span>Continuous Detection Mode</span>
              </label>
              
              {isContinuousMode && (
                <button
                  onClick={isCapturingContinuous ? stopContinuousDetection : startContinuousDetection}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    isCapturingContinuous
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isCapturingContinuous ? (
                    <>
                      <CameraOff size={20} />
                      Stop Continuous
                    </>
                  ) : (
                    <>
                      <Camera size={20} />
                      Start Continuous
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex gap-4">
            {onNavigateToChat && (
              <button
                onClick={onNavigateToChat}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <MessageSquare size={20} />
                Chat
              </button>
            )}
            <button
              onClick={onSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Text Input */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <MessageCircle size={24} />
                Text Analysis
              </h2>
              <div className="space-y-4">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter your thoughts or feelings here..."
                  className="w-full h-32 bg-white/5 border border-white/20 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:border-white focus:outline-none"
                />
                <button
                  onClick={analyzeText}
                  disabled={isAnalyzing || !textInput.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  {isAnalyzing ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
                  Analyze Text
                </button>
              </div>
            </div>

            {/* Voice Input */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Mic size={24} />
                Voice Analysis
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isAnalyzing}
                    className={`flex-1 ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors`}
                  >
                    {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                  </button>
                </div>
                {isRecording && (
                  <div className="text-center text-red-400 animate-pulse">
                    🔴 Recording in progress...
                  </div>
                )}
              </div>
            </div>

            {/* Video Input */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Camera size={24} />
                Video Analysis
              </h2>
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-48 bg-black rounded-lg object-cover"
                    muted
                    playsInline
                  />
                  {!isVideoOn && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <CameraOff size={48} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={isVideoOn ? stopVideo : startVideo}
                    disabled={isAnalyzing}
                    className={`flex-1 ${isVideoOn ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors`}
                  >
                    {isVideoOn ? <CameraOff size={20} /> : <Camera size={20} />}
                    {isVideoOn ? 'Stop Video' : 'Start Video'}
                  </button>
                  <button
                    onClick={captureFrame}
                    disabled={isAnalyzing || !isVideoOn}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    📸 Capture & Analyze
                  </button>
                </div>
              </div>
            </div>

            {/* Multimodal Analysis */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Multimodal Analysis</h2>
              <button
                onClick={analyzeMultimodal}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
              >
                {isAnalyzing ? <Loader className="animate-spin" size={20} /> : '🧠'}
                Analyze All Inputs
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Analysis Results */}
            {analysisResult && (
              <div className={`${getEmotionBg(analysisResult.predicted_emotion)} backdrop-blur-sm rounded-xl p-6 border border-white/20`}>
                <h2 className="text-xl font-semibold text-white mb-4">Analysis Results</h2>
                
                <div className="space-y-4">
                  {/* Main Result */}
                  <div className="text-center">
                    <div className={`text-6xl mb-2 ${getEmotionColor(analysisResult.predicted_emotion)}`}>
                      {analysisResult.predicted_emotion === 'happy' && '😊'}
                      {analysisResult.predicted_emotion === 'sad' && '😢'}
                      {analysisResult.predicted_emotion === 'angry' && '😠'}
                      {analysisResult.predicted_emotion === 'fear' && '😨'}
                      {analysisResult.predicted_emotion === 'surprise' && '😲'}
                      {analysisResult.predicted_emotion === 'disgust' && '🤢'}
                      {analysisResult.predicted_emotion === 'neutral' && '😐'}
                    </div>
                    <h3 className={`text-2xl font-bold capitalize ${getEmotionColor(analysisResult.predicted_emotion)}`}>
                      {analysisResult.predicted_emotion}
                    </h3>
                    <p className="text-gray-300">
                      Confidence: {(analysisResult.confidence * 100).toFixed(1)}%
                    </p>
                  </div>

                  {/* Emotion Breakdown */}
                  <div className="space-y-2">
                    <h4 className="text-white font-medium">Emotion Breakdown:</h4>
                    {Object.entries(analysisResult.all_probabilities).map(([emotion, probability]) => (
                      <div key={emotion} className="flex items-center justify-between">
                        <span className="text-gray-300 capitalize">{emotion}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getEmotionColor(emotion).replace('text-', 'bg-')}`}
                              style={{ width: `${probability * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-400 text-sm">
                            {(probability * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Individual Model Results */}
                  {(analysisResult.face_only || analysisResult.audio_only || analysisResult.text_only) && (
                    <div className="border-t border-white/20 pt-4">
                      <h4 className="text-white font-medium mb-2">Individual Analysis:</h4>
                      {analysisResult.face_only && (
                        <p className="text-gray-300 text-sm">
                          Face: {analysisResult.face_only.emotion} ({(analysisResult.face_only.confidence * 100).toFixed(1)}%)
                        </p>
                      )}
                      {analysisResult.audio_only && (
                        <p className="text-gray-300 text-sm">
                          Voice: {analysisResult.audio_only.emotion} ({(analysisResult.audio_only.confidence * 100).toFixed(1)}%)
                        </p>
                      )}
                      {analysisResult.text_only && (
                        <p className="text-gray-300 text-sm">
                          Text: {analysisResult.text_only.emotion} ({(analysisResult.text_only.confidence * 100).toFixed(1)}%)
                        </p>
                      )}
                    </div>
                  )}

                  {/* Voice Response */}
                  {audioResponse && (
                    <div className="border-t border-white/20 pt-4">
                      <h4 className="text-white font-medium mb-2">AI Voice Response:</h4>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={playAudioResponse}
                          disabled={isPlayingResponse}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                          {isPlayingResponse ? <VolumeX size={16} /> : <Volume2 size={16} />}
                          {isPlayingResponse ? 'Playing...' : 'Play Response'}
                        </button>
                      </div>
                      <audio
                        ref={audioElementRef}
                        src={audioResponse}
                        onEnded={() => setIsPlayingResponse(false)}
                        onError={() => {
                          setIsPlayingResponse(false);
                          setError('Failed to play audio response');
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Continuous Mode Results */}
            {isContinuousMode && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl text-white font-semibold mb-4 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isCapturingContinuous ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                  Continuous Emotion Stream
                </h3>
                
                {isCapturingContinuous ? (
                  <div className="space-y-3">
                    <p className="text-gray-300 text-sm mb-4">
                      Real-time emotion detection active • Capturing every 3 seconds
                    </p>
                    
                    {continuousResults.length > 0 ? (
                      <div className="max-h-96 overflow-y-auto space-y-3">
                        {continuousResults.map((result, index) => (
                          <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs text-gray-400">{result.timestamp}</span>
                              {result.overall_emotion && (
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getEmotionBg(result.overall_emotion.emotion)}`}>
                                  {result.overall_emotion.emotion} • {(result.overall_emotion.confidence * 100).toFixed(0)}%
                                </span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-3 gap-3 text-sm">
                              {result.face_emotion && (
                                <div>
                                  <p className="text-gray-400 text-xs">Face</p>
                                  <p className={`${getEmotionColor(result.face_emotion.emotion)} font-medium`}>
                                    {result.face_emotion.emotion} ({(result.face_emotion.confidence * 100).toFixed(0)}%)
                                  </p>
                                </div>
                              )}
                              
                              {result.voice_emotion && (
                                <div>
                                  <p className="text-gray-400 text-xs">Voice</p>
                                  <p className={`${getEmotionColor(result.voice_emotion.emotion)} font-medium`}>
                                    {result.voice_emotion.emotion} ({(result.voice_emotion.confidence * 100).toFixed(0)}%)
                                  </p>
                                </div>
                              )}
                              
                              {result.text_emotion && (
                                <div>
                                  <p className="text-gray-400 text-xs">Text</p>
                                  <p className={`${getEmotionColor(result.text_emotion.emotion)} font-medium`}>
                                    {result.text_emotion.emotion} ({(result.text_emotion.confidence * 100).toFixed(0)}%)
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <div className="animate-pulse">
                          <div className="w-16 h-16 bg-gray-600 rounded-full mx-auto mb-4"></div>
                          <p>Waiting for first emotion capture...</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Camera size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Click "Start Continuous" to begin real-time emotion detection</p>
                    <p className="text-sm mt-2">This will analyze your face, voice, and text continuously</p>
                  </div>
                )}
              </div>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                <Loader className="animate-spin mx-auto mb-4 text-white" size={48} />
                <h3 className="text-xl text-white font-semibold mb-2">Analyzing Your Emotions</h3>
                <p className="text-gray-300">NexaModel is processing your input...</p>
              </div>
            )}

            {/* Welcome Message */}
            {!analysisResult && !isAnalyzing && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                <div className="text-6xl mb-4">🧠</div>
                <h3 className="text-2xl text-white font-semibold mb-2">Ready for Analysis</h3>
                <p className="text-gray-300 mb-4">
                  Choose your preferred input method and let NexaModel analyze your emotions.
                </p>
                <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-400">
                  <div>
                    <MessageCircle className="mx-auto mb-1" size={24} />
                    Text Analysis
                  </div>
                  <div>
                    <Mic className="mx-auto mb-1" size={24} />
                    Voice Analysis
                  </div>
                  <div>
                    <Camera className="mx-auto mb-1" size={24} />
                    Video Analysis
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionAnalysisPage;