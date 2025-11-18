import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mic, MicOff, Send, Settings, LogOut, Square, Camera, Video, Image } from 'lucide-react';
import MessageBubble from './MessageBubble';
import VoiceWaveform from './VoiceWaveform';

const ChatPage = () => {
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAnalyzingEmotion, setIsAnalyzingEmotion] = useState(false);
  const [lastDetectedEmotion, setLastDetectedEmotion] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const cameraRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages])
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
    }

    // Initialize Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
    }
  }, []);

  // Welcome message effect with automatic emotion capture
  useEffect(() => {
    if (speechSynthesis && !hasSpokenWelcome) {
      const timer = setTimeout(async () => {
        const userName = user?.email?.split('@')[0] || 'friend';
        const welcomeMessage = `Hi ${userName}, I'm Nexa, your AI companion! I can see you're here with me. Let me take a moment to understand how you're feeling right now, so I can better support you.`;
        speakText(welcomeMessage);
        setHasSpokenWelcome(true);
        
        // Automatically capture user's emotion after welcome
        setTimeout(() => {
          captureInitialEmotion();
        }, 3000);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [speechSynthesis, hasSpokenWelcome, user]);

  const captureInitialEmotion = async () => {
    try {
      // Automatically start camera for initial emotion capture
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user'
        }
      });
      
      // Create a hidden video element to capture frame
      const video = document.createElement('video');
      video.srcObject = mediaStream;
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      
      // Wait for video to be ready and capture frame
      video.addEventListener('loadedmetadata', () => {
        setTimeout(async () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            // Convert to blob and analyze emotion
            canvas.toBlob(async (blob) => {
              if (blob) {
                // Stop the camera stream
                mediaStream.getTracks().forEach(track => track.stop());
                
                // Analyze emotion from captured image
                await analyzeInitialEmotion(blob);
              }
            }, 'image/jpeg', 0.8);
          } catch (error) {
            console.error('Error capturing frame:', error);
            mediaStream.getTracks().forEach(track => track.stop());
          }
        }, 1000); // Give camera time to adjust
      });
      
    } catch (error) {
      console.error('Error accessing camera for initial capture:', error);
      // Fallback to text-based greeting if camera fails
      setTimeout(() => {
        const userName = user?.email?.split('@')[0] || 'friend';
        speakText(`That's okay ${userName}, we can still chat! Tell me, how are you feeling today?`);
      }, 1000);
    }
  };

  const analyzeInitialEmotion = async (imageBlob) => {
    try {
      setIsAnalyzingEmotion(true);
      
      // Create form data for video analysis
      const formData = new FormData();
      formData.append('video_file', imageBlob, 'initial_capture.jpg');
      
      const response = await fetch('http://localhost:8001/analyze/video', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer demo-token-123`
        },
        body: formData
      });
      
      setIsAnalyzingEmotion(false);
      
      if (response.ok) {
        const emotionData = await response.json();
        const emotion = emotionData.predicted_emotion;
        const confidence = emotionData.confidence;
        
        // Set detected emotion
        const emotionEmoji = {
          'angry': '😤', 'sad': '😢', 'fear': '😰', 'happy': '😊', 
          'surprise': '😮', 'disgust': '😖', 'neutral': '😌'
        };
        
        setLastDetectedEmotion({
          emotion: emotion,
          confidence: confidence,
          emoji: emotionEmoji[emotion.toLowerCase()] || '😌'
        });
        
        // Generate personalized response based on detected emotion
        const userName = user?.email?.split('@')[0] || 'friend';
        const personalizedResponse = generatePersonalizedWelcome(emotion, confidence, userName);
        
        setTimeout(() => {
          speakText(personalizedResponse);
        }, 1500);
        
      } else {
        console.error('Failed to analyze initial emotion');
        // Fallback greeting
        const userName = user?.email?.split('@')[0] || 'friend';
        setTimeout(() => {
          speakText(`Nice to meet you ${userName}! I'm here to listen and support you. What's on your mind today?`);
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error analyzing initial emotion:', error);
      setIsAnalyzingEmotion(false);
      // Fallback greeting
      const userName = user?.email?.split('@')[0] || 'friend';
      setTimeout(() => {
        speakText(`Hello ${userName}! I'm excited to chat with you. How are you feeling today?`);
      }, 1000);
    }
  };

  const generatePersonalizedWelcome = (emotion, confidence, userName) => {
    switch (emotion.toLowerCase()) {
      case 'happy':
        return `I can see that beautiful smile, ${userName}! Your happiness is absolutely radiant and it makes my day brighter too. What's bringing you such joy today? I'd love to celebrate with you!`;
        
      case 'sad':
        return `${userName}, I can see there's some sadness in your eyes, and that's completely okay. You're brave for being here, and I want you to know that you're not alone. What's been weighing on your heart? Sometimes sharing helps lighten the load.`;
        
      case 'angry':
        return `${userName}, I can sense some frustration in your expression. Those feelings are completely valid, and I'm here to listen without judgment. Take a deep breath with me - you're safe here. What's been bothering you? Let's work through this together.`;
        
      case 'fear':
        return `${userName}, I notice some worry in your expression. Whatever is making you anxious, remember that you're stronger than you know, and you don't have to face it alone. I'm here to support you. What's been on your mind that's causing concern?`;
        
      case 'surprise':
        return `${userName}, I can see some surprise in your expression! Life has a way of keeping us on our toes, doesn't it? Whether it's good surprise or unexpected news, I'm here to process it with you. What's caught you off guard?`;
        
      case 'neutral':
      default:
        return `${userName}, I can see you have a calm, thoughtful presence. There's something peaceful about your energy that I appreciate. I'm here and ready to listen to whatever you'd like to share. What's been on your mind lately?`;
    }
  };

  const speakText = (text) => {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Enhanced voice settings for more natural speech
      utterance.rate = 0.85; // Slightly slower for clarity
      utterance.pitch = 1.0; // More natural pitch
      utterance.volume = 0.9; // Slightly louder
      
      // Better voice selection with fallbacks
      const voices = speechSynthesis.getVoices();
      
      // Prioritize high-quality voices
      let selectedVoice = voices.find(voice => 
        // Google voices (high quality)
        voice.name.toLowerCase().includes('google') && 
        (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman'))
      ) || voices.find(voice =>
        // Microsoft voices (good quality)
        (voice.name.toLowerCase().includes('aria') || 
         voice.name.toLowerCase().includes('zira') ||
         voice.name.toLowerCase().includes('eva') ||
         voice.name.toLowerCase().includes('jenny'))
      ) || voices.find(voice =>
        // Apple voices (Mac/iOS)
        (voice.name.toLowerCase().includes('samantha') ||
         voice.name.toLowerCase().includes('victoria') ||
         voice.name.toLowerCase().includes('alex'))
      ) || voices.find(voice =>
        // Generic female voice fallback
        voice.name.toLowerCase().includes('female')
      ) || voices.find(voice =>
        // Any English voice as last resort
        voice.lang.startsWith('en')
      );

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Using voice:', selectedVoice.name);
      }
      
      utterance.onstart = () => {
        setIsAiSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsAiSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsAiSpeaking(false);
      };
      
      utterance.onboundary = (event) => {
        // Add subtle pause effects at word boundaries for more natural speech
        if (event.name === 'sentence') {
          // Small pause between sentences
          setTimeout(() => {
            // Continue with next part if needed
          }, 50);
        }
      };
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }
  };

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleVideoUpload = () => {
    videoInputRef.current?.click();
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user'
        }
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
      // Set up camera video element
      if (cameraRef.current) {
        cameraRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions and try again.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (cameraRef.current) {
      const canvas = document.createElement('canvas');
      const video = cameraRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      // Convert to blob and create data URL
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedMedia(e.target.result);
          setMediaType('photo');
          stopCamera();
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.9);
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileSelect = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedMedia(e.target.result);
        setMediaType(type);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelectedMedia = () => {
    setSelectedMedia(null);
    setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleSendMessage = async () => {
    if (inputText.trim() || selectedMedia) {
      const userMessage = {
        id: messages.length + 1,
        text: inputText.trim(),
        sender: 'user',
        timestamp: new Date(),
        userInitial: user?.email?.charAt(0).toUpperCase() || 'U',
        media: selectedMedia,
        mediaType: mediaType
      };
      
      setMessages(prev => [...prev, userMessage]);
      const messageText = inputText.trim();
      setInputText('');
      clearSelectedMedia();
      
      // Start emotion analysis
      setIsAnalyzingEmotion(true);
      
      // Analyze emotion using ML service and respond appropriately
      try {
        // Analyze emotion from user's message
        const response = await fetch('http://localhost:8001/analyze/text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer demo-token-123` // Use actual token from auth context in production
          },
          body: JSON.stringify({
            text: messageText,
            user_id: user?.email || 'demo_user'
          })
        });

        setIsAnalyzingEmotion(false);

        if (response.ok) {
          const emotionData = await response.json();
          const emotion = emotionData.predicted_emotion;
          const confidence = emotionData.confidence;
          
          // Add visual indicator of emotion detected (subtle)
          const emotionEmoji = {
            'angry': '😤', 'sad': '😢', 'fear': '😰', 'happy': '😊', 
            'surprise': '😮', 'disgust': '😖', 'neutral': '😌'
          };
          
          setLastDetectedEmotion({
            emotion: emotion,
            confidence: confidence,
            emoji: emotionEmoji[emotion.toLowerCase()] || '😌'
          });
          
          console.log(`🎭 Detected emotion: ${emotion} (${(confidence * 100).toFixed(1)}% confidence)`);
          
          // Generate emotion-aware response based on detected emotion
          const generateEmotionalResponse = (emotion, confidence, userText) => {
            const text = userText.toLowerCase();
            
            switch (emotion.toLowerCase()) {
              case 'angry':
                return [
                  "I can sense some frustration in your words. Take a deep breath - you're safe here with me.",
                  "It sounds like you're feeling angry right now. That's completely valid. Let's talk through what's bothering you.",
                  "I notice you might be upset. Remember, anger is just an emotion passing through. What can I do to help you feel calmer?",
                  "Your feelings are heard and understood. When we're angry, it often means something important to us is being challenged. Want to share more?",
                  "I sense some anger there, and that's okay. Let's turn this energy into something positive. What would make you feel better right now?"
                ][Math.floor(Math.random() * 5)];
                
              case 'sad':
                return [
                  "I can hear some sadness in your message. It's okay to feel this way - you don't have to carry it alone.",
                  "I sense you might be feeling down. Remember, tough times don't last, but resilient people like you do.",
                  "Your sadness is valid and I'm here with you. Sometimes talking helps - what's been weighing on your heart?",
                  "I notice some melancholy in your words. You're stronger than you know, and this feeling will pass. How can I brighten your day?",
                  "It seems like you're going through a difficult time. You're brave for sharing with me. What would bring you a little joy right now?"
                ][Math.floor(Math.random() * 5)];
                
              case 'fear':
                return [
                  "I can sense some worry in your message. You're safe here, and whatever you're facing, you don't have to face it alone.",
                  "It sounds like something might be making you anxious. Remember, courage isn't the absence of fear - it's feeling it and moving forward anyway.",
                  "I notice some concern in your words. Fear often tries to protect us, but sometimes it holds us back. What's on your mind?",
                  "Your feelings of uncertainty are completely understandable. You're stronger and more capable than your fears want you to believe.",
                  "I sense some apprehension. Remember, most of our fears never actually happen. Let's focus on what you can control right now."
                ][Math.floor(Math.random() * 5)];
                
              case 'happy':
                return [
                  "I love the positive energy in your message! Your happiness is contagious and brightens my day too.",
                  "What wonderful joy I can hear in your words! It's beautiful to see you in such a great mood.",
                  "Your happiness shines through! I'm so glad you're feeling good - you deserve all the joy in the world.",
                  "The positivity in your message is amazing! Keep that beautiful energy flowing - it's inspiring.",
                  "I can feel your happiness radiating through your words! Thank you for sharing that wonderful energy with me."
                ][Math.floor(Math.random() * 5)];
                
              case 'surprise':
                return [
                  "I can sense some surprise in your message! Life has a way of keeping things interesting, doesn't it?",
                  "It sounds like something unexpected happened! Surprises can be adventures in disguise.",
                  "I notice some amazement in your words. Sometimes the unexpected turns out to be exactly what we needed.",
                  "Your surprise comes through clearly! Life's unexpected moments often lead to the most growth.",
                  "I can hear the wonder in your message. Embrace the surprise - it might be leading you somewhere wonderful."
                ][Math.floor(Math.random() * 5)];
                
              case 'disgust':
                return [
                  "I can sense something is really bothering you. Sometimes we need to express our distaste - it's perfectly human.",
                  "It sounds like something doesn't sit right with you. Trust your instincts - they're usually trying to protect you.",
                  "I notice some strong displeasure in your words. It's okay to feel repulsed by things that don't align with your values.",
                  "Your reaction is completely valid. Sometimes disgust helps us maintain our boundaries and standards.",
                  "I can hear your displeasure clearly. These feelings often guide us toward what truly matters to us."
                ][Math.floor(Math.random() * 5)];
                
              case 'neutral':
              default:
                // For neutral emotions, provide gentle, supportive responses
                if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
                  return [
                    "Hello! I'm here and ready to listen. What's on your mind today?",
                    "Hi there! I sense a calm energy from you. How can I support you right now?",
                    "Hey! I'm glad you're here. What would you like to talk about?"
                  ][Math.floor(Math.random() * 3)];
                } else if (text.includes('how are you')) {
                  return "I'm doing wonderfully, thank you for asking! How are you feeling right now? I'm here to listen.";
                } else {
                  return [
                    "I'm listening and here for you. What's been on your mind lately?",
                    "Thank you for sharing with me. How are you feeling in this moment?",
                    "I appreciate you opening up. What would be most helpful for you right now?",
                    "I'm glad you're here. Sometimes it helps just to have someone listen. What's in your heart today?",
                    "Your thoughts and feelings matter to me. What would you like to explore together?"
                  ][Math.floor(Math.random() * 5)];
                }
            }
          };
          
          const emotionAwareResponse = generateEmotionalResponse(emotion, confidence, messageText);
          
          // Speak the emotion-aware response after a short delay
          setTimeout(() => {
            speakText(emotionAwareResponse);
          }, 800);
          
        } else {
          console.error('Failed to analyze emotion, falling back to basic response');
          setLastDetectedEmotion(null);
          // Fallback to basic response if emotion analysis fails
          setTimeout(() => {
            speakText("I'm here to listen and support you. What would you like to talk about?");
          }, 500);
        }
        
      } catch (error) {
        console.error('Error analyzing emotion:', error);
        setIsAnalyzingEmotion(false);
        setLastDetectedEmotion(null);
        // Fallback response
        setTimeout(() => {
          speakText("I'm here for you. Tell me more about what's on your mind.");
        }, 500);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceRecording = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-gray-950 to-black text-white overflow-hidden">
      {/* Enhanced Background Effects with Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/10 via-purple-950/5 to-slate-950/20 animate-pulse"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/5 via-purple-500/3 to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-blue-500/3 to-transparent"></div>
      
      {/* Floating Orbs Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full opacity-20 blur-sm animate-pulse ${
              i % 2 === 0 ? 'bg-blue-500/30' : 'bg-emerald-500/30'
            }`}
            style={{
              width: `${40 + i * 20}px`,
              height: `${40 + i * 20}px`,
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${6 + i * 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Header with Enhanced Design */}
      <header className="relative z-10 p-4 sm:p-6 border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Enhanced User Avatar */}
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-white/90 via-blue-100/80 to-white/70 text-gray-800 flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-400/20 to-emerald-400/20 rounded-2xl blur-sm"></div>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Nexa
              </h1>
              <p className="text-sm sm:text-base text-gray-300 flex items-center">
                {isAnalyzingEmotion ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map(dot => (
                        <div 
                          key={dot}
                          className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"
                          style={{ animationDelay: `${dot * 0.2}s` }}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-purple-300">Analyzing emotions...</span>
                  </div>
                ) : isAiSpeaking ? (
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map(dot => (
                        <div 
                          key={dot}
                          className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"
                          style={{ animationDelay: `${dot * 0.2}s` }}
                        />
                      ))}
                    </div>
                    <span className="font-medium">
                      {lastDetectedEmotion ? 
                        `Responding with empathy (detected: ${lastDetectedEmotion.emotion} ${lastDetectedEmotion.emoji})...` : 
                        'AI is speaking...'
                      }
                    </span>
                  </div>
                ) : isListening ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                    <span className="font-medium text-blue-300">Listening...</span>
                  </div>
                ) : lastDetectedEmotion ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{lastDetectedEmotion.emoji}</span>
                    <span className="text-gray-400">
                      Last emotion: {lastDetectedEmotion.emotion} • Ready to help you
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">Ready to help you</span>
                )}
              </p>
            </div>
          </div>
          
          {/* Enhanced Action Buttons */}
          <div className="flex items-center space-x-3">
            {isAiSpeaking && (
              <button 
                onClick={stopSpeaking}
                className="group p-2.5 sm:p-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all duration-300 text-red-400 hover:text-red-300 backdrop-blur-sm border border-red-500/30 hover:scale-105"
              >
                <Square className="w-5 h-5 sm:w-6 sm:h-6 group-hover:animate-pulse" />
              </button>
            )}
            <button className="group p-2.5 sm:p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-105">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
            <button 
              onClick={handleSignOut}
              className="group p-2.5 sm:p-3 rounded-xl bg-white/10 hover:bg-red-500/20 transition-all duration-300 text-gray-300 hover:text-red-300 backdrop-blur-sm border border-white/20 hover:border-red-500/30 hover:scale-105"
            >
              <LogOut className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Enhanced Layout */}
      <div className="relative z-10 flex flex-col h-[calc(100vh-96px)]">
        {/* Messages Area with Beautiful Scrolling */}
        <div className="flex-1 relative overflow-hidden">
          {/* Enhanced Empty State */}
          {messages.filter(message => message.sender === 'user').length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-8 max-w-md mx-auto p-6">
                {/* Animated AI Avatar */}
                <div className="relative mx-auto w-32 h-32">
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-white/20 via-blue-500/10 to-emerald-500/10 flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl">
                    <Mic className="w-16 h-16 text-white/70" />
                  </div>
                  {/* Animated rings */}
                  {[1, 2, 3].map(ring => (
                    <div 
                      key={ring}
                      className="absolute inset-0 rounded-3xl border border-white/10 animate-pulse"
                      style={{
                        animation: `ping ${2 + ring}s cubic-bezier(0, 0, 0.2, 1) infinite`,
                        animationDelay: `${ring * 0.5}s`,
                      }}
                    />
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-light text-white/90 leading-tight">
                    <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                      Ready to assist you
                    </span>
                  </h3>
                  <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-sm mx-auto">
                    Share through text, voice, photos, or videos to begin our conversation
                  </p>
                </div>
                
                {/* Feature indicators */}
                <div className="flex justify-center space-x-6 text-gray-400">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Mic className="w-5 h-5" />
                    </div>
                    <span className="text-xs">Voice</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Image className="w-5 h-5" />
                    </div>
                    <span className="text-xs">Photo</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Video className="w-5 h-5" />
                    </div>
                    <span className="text-xs">Video</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Enhanced Messages Container */
            <div 
              className="absolute inset-0 p-4 sm:p-6 space-y-6 max-w-5xl mx-auto w-full overflow-y-auto scrollbar-hide"
              style={{
                scrollBehavior: 'smooth',
              }}
            >
              {messages.filter(message => message.sender === 'user').map((message) => (
                <div key={message.id} className="animate-fadeIn">
                  <MessageBubble
                    message={message}
                    isUser={true}
                  />
                </div>
              ))}
              
              {/* Enhanced Inline Waveform when AI is speaking */}
              {isAiSpeaking && hasSpokenWelcome && (
                <div className="flex justify-start animate-slideInLeft">
                  <div className="max-w-sm sm:max-w-md lg:max-w-lg bg-gradient-to-br from-emerald-500/10 via-white/5 to-emerald-500/5 backdrop-blur-xl border border-emerald-400/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-transparent rounded-3xl"></div>
                    
                    <div className="relative z-10 flex items-center space-x-4 mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-bold shadow-lg">
                        AI
                      </div>
                      <div className="flex-1">
                        <span className="text-emerald-300 font-medium">Speaking...</span>
                        <div className="flex space-x-1 mt-1">
                          {[0, 1, 2, 3].map(dot => (
                            <div 
                              key={dot}
                              className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"
                              style={{ animationDelay: `${dot * 0.1}s` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="h-20 relative">
                      <VoiceWaveform 
                        isActive={true} 
                        type="speaking" 
                        isInline={true}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Enhanced Inline Waveform when listening */}
              {isListening && (
                <div className="flex justify-start animate-slideInLeft">
                  <div className="max-w-sm sm:max-w-md lg:max-w-lg bg-gradient-to-br from-blue-500/10 via-white/5 to-blue-500/5 backdrop-blur-xl border border-blue-400/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-transparent rounded-3xl"></div>
                    
                    <div className="relative z-10 flex items-center space-x-4 mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white shadow-lg">
                        <Mic className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <span className="text-blue-300 font-medium">Listening...</span>
                        <div className="w-8 h-1 bg-blue-500/30 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="h-20 relative">
                      <VoiceWaveform 
                        isActive={true} 
                        type="listening" 
                        isInline={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Voice Waveform Animation (Full Screen Overlay) - Only for welcome message */}
        {isAiSpeaking && !hasSpokenWelcome && (
          <VoiceWaveform 
            isActive={true} 
            type="speaking" 
            isInline={false}
          />
        )}

        {/* Enhanced Input Area with Modern Design */}
        <div className="relative z-20 p-4 sm:p-6 border-t border-white/10 backdrop-blur-xl bg-gradient-to-t from-black/20 to-transparent">
          <div className="max-w-5xl mx-auto">
            {/* Enhanced Media Preview */}
            {selectedMedia && (
              <div className="mb-4 p-4 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl border border-white/20 backdrop-blur-xl shadow-lg animate-slideInUp">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm sm:text-base text-white/90 font-medium">
                    {mediaType === 'photo' ? '📷 Photo attached' : '🎥 Video attached'}
                  </span>
                  <button 
                    onClick={clearSelectedMedia}
                    className="px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
                {mediaType === 'photo' ? (
                  <img 
                    src={selectedMedia} 
                    alt="Selected" 
                    className="max-h-40 rounded-xl border border-white/20 shadow-lg"
                  />
                ) : (
                  <video 
                    src={selectedMedia} 
                    className="max-h-40 rounded-xl border border-white/20 shadow-lg" 
                    controls
                  />
                )}
              </div>
            )}
            
            <div className="flex items-end space-x-3 sm:space-x-4">
              {/* Enhanced Media Buttons */}
              <div className="flex space-x-2">
                {/* Photo Upload Button */}
                <button
                  onClick={handlePhotoUpload}
                  className="group relative p-3 sm:p-3.5 rounded-2xl transition-all duration-300 flex-shrink-0 bg-gradient-to-br from-white/80 to-white/60 text-gray-800 hover:from-white/90 hover:to-white/70 shadow-lg hover:shadow-xl hover:scale-105"
                  title="Upload Photo"
                >
                  <Image className="w-5 h-5 sm:w-6 sm:h-6" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>

                {/* Live Camera Button */}
                <button
                  onClick={startCamera}
                  className="group relative p-3 sm:p-3.5 rounded-2xl transition-all duration-300 flex-shrink-0 bg-gradient-to-br from-blue-500/80 to-blue-600/80 text-white hover:from-blue-500/90 hover:to-blue-600/90 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                  title="Take Live Photo"
                >
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>

              {/* Enhanced Voice Button */}
              <button
                onClick={toggleVoiceRecording}
                className={`group relative p-3 sm:p-3.5 rounded-2xl transition-all duration-300 flex-shrink-0 ${
                  isListening 
                    ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30 scale-110' 
                    : 'bg-gradient-to-br from-white/80 to-white/60 text-gray-800 hover:from-white/90 hover:to-white/70 shadow-lg hover:shadow-xl hover:scale-105'
                }`}
                title={isListening ? "Stop Recording" : "Start Voice Recording"}
              >
                {isListening ? (
                  <MicOff className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                ) : (
                  <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
                )}
                
                {/* Pulsing ring for listening state */}
                {isListening && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-red-300/50 animate-ping"></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>

              {/* Enhanced Text Input */}
              <div className="flex-1 relative">
                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share your thoughts safely..."
                    className="w-full p-4 sm:p-5 pr-12 sm:pr-14 rounded-2xl bg-gradient-to-br from-slate-800/90 via-gray-800/85 to-slate-900/90 backdrop-blur-xl border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 focus:bg-slate-800/95 resize-none min-h-[56px] sm:min-h-[64px] max-h-40 text-base sm:text-lg font-medium transition-all duration-300 shadow-2xl"
                    rows="1"
                    style={{
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                    }}
                  />
                  
                  {/* Enhanced Send Button */}
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() && !selectedMedia}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-500/90 hover:to-blue-600/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105 disabled:hover:scale-100"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e, 'photo')}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => handleFileSelect(e, 'video')}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Live Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl mx-4">
            {/* Camera Header */}
            <div className="mb-4 text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Take a Photo</h3>
              <p className="text-gray-400 text-sm">Position yourself in the frame and click capture</p>
            </div>

            {/* Camera Video */}
            <div className="relative bg-black rounded-2xl overflow-hidden border-2 border-white/20">
              <video
                ref={cameraRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto max-h-96 object-cover"
              />
              
              {/* Camera Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-center space-x-6">
                  {/* Cancel Button */}
                  <button
                    onClick={stopCamera}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-full transition-colors flex items-center space-x-2"
                  >
                    <span>Cancel</span>
                  </button>

                  {/* Capture Button */}
                  <button
                    onClick={capturePhoto}
                    className="w-16 h-16 bg-white hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                    style={{
                      boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
                    }}
                  >
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </button>

                  {/* Switch Camera Button (placeholder for future enhancement) */}
                  <button
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors flex items-center space-x-2 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    <span>Switch</span>
                  </button>
                </div>
              </div>

              {/* Camera Grid Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-30">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white/20"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-xs">
                The photo will be captured directly from your camera and used in the chat
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;