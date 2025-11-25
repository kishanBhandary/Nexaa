import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mic, MicOff, Send, Settings, LogOut, Square, Camera, Video, Image } from 'lucide-react';
import MessageBubble from './MessageBubble';
import VoiceWaveform from './VoiceWaveform';
import mlService from '../services/mlService';

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
  const [hasAnalyzedInitialEmotion, setHasAnalyzedInitialEmotion] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // Welcome message with automatic emotion capture
  useEffect(() => {
    if (speechSynthesis && !hasSpokenWelcome) {
      const timer = setTimeout(async () => {
        const userName = user?.email?.split('@')[0] || 'friend';
        const welcomeMessage = `Hi ${userName}, I'm Nexa, your AI companion! I can see you're here with me. Let me take a moment to understand how you're feeling right now.`;
        speakText(welcomeMessage);
        setHasSpokenWelcome(true);
        
        // Start emotion analysis after welcome
        setTimeout(() => {
          if (!hasAnalyzedInitialEmotion) {
            captureInitialEmotion();
          }
        }, 3000);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [speechSynthesis, hasSpokenWelcome, user, hasAnalyzedInitialEmotion]);

  const captureInitialEmotion = async () => {
    if (hasAnalyzedInitialEmotion) return;
    
    try {
      setHasAnalyzedInitialEmotion(true);
      const userName = user?.email?.split('@')[0] || 'friend';
      
      // Try to access camera for initial emotion capture
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      const video = document.createElement('video');
      video.srcObject = mediaStream;
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      
      video.addEventListener('loadedmetadata', () => {
        setTimeout(async () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            canvas.toBlob(async (blob) => {
              if (blob) {
                mediaStream.getTracks().forEach(track => track.stop());
                await analyzeInitialEmotion(blob, userName);
              }
            }, 'image/jpeg', 0.8);
          } catch (error) {
            console.error('Error capturing frame:', error);
            mediaStream.getTracks().forEach(track => track.stop());
            fallbackGreeting(userName);
          }
        }, 1000);
      });
      
    } catch (error) {
      console.error('Camera access error:', error);
      const userName = user?.email?.split('@')[0] || 'friend';
      fallbackGreeting(userName);
    }
  };

  const analyzeInitialEmotion = async (imageBlob, userName) => {
    try {
      setIsAnalyzingEmotion(true);
      
      const emotionData = await mlService.analyzeVideo(imageBlob, user?.email || 'demo_user');
      
      setIsAnalyzingEmotion(false);
      
      if (emotionData) {
        const emotion = emotionData.predicted_emotion;
        const confidence = emotionData.confidence;
        
        const emotionEmoji = {
          'angry': '😤', 'sad': '😢', 'fear': '😰', 'happy': '😊', 
          'surprise': '😮', 'disgust': '😖', 'neutral': '😌'
        };
        
        setLastDetectedEmotion({
          emotion: emotion,
          confidence: confidence,
          emoji: emotionEmoji[emotion.toLowerCase()] || '😌'
        });
        
        try {
          // Generate personalized welcome using Gemini
          const welcomeMessage = `I can see your emotion from your camera. You seem ${emotion}. Please welcome me warmly and ask how I can help you today.`;
          
          const geminiResponse = await mlService.generateGeminiResponse(
            welcomeMessage,
            user?.email || 'demo_user',
            userName,
            emotion,
            confidence
          );
          
          if (geminiResponse?.response) {
            setTimeout(() => speakText(geminiResponse.response), 100);
          } else {
            // Fallback to original personalized response
            const personalizedResponse = generatePersonalizedWelcome(emotion, userName);
            setTimeout(() => speakText(personalizedResponse), 100);
          }
        } catch (geminiError) {
          console.error('Gemini welcome error:', geminiError);
          const personalizedResponse = generatePersonalizedWelcome(emotion, userName);
          setTimeout(() => speakText(personalizedResponse), 100);
        }
        
      } else {
        fallbackGreeting(userName);
      }
      
    } catch (error) {
      console.error('Error analyzing initial emotion:', error);
      setIsAnalyzingEmotion(false);
      fallbackGreeting(userName);
    }
  };

  const generatePersonalizedWelcome = (emotion, userName) => {
    switch (emotion.toLowerCase()) {
      case 'happy':
        return `Nexa here, ${userName}! I can see that beautiful smile! Your happiness is absolutely radiant. What's bringing you such joy today? I'd love to celebrate with you!`;
        
      case 'sad':
        return `Nexa here, ${userName}. I can see there's some sadness in your expression. You're brave for being here, and I want you to know that you're not alone. What's been weighing on your heart?`;
        
      case 'angry':
        return `Nexa speaking, ${userName}. I can sense some frustration. Those feelings are completely valid, and I'm here to listen. Take a deep breath with me - you're safe here. What's been bothering you?`;
        
      case 'fear':
        return `Nexa here, ${userName}. I notice some worry in your expression. Remember that you're stronger than you know, and you don't have to face anything alone. What's been on your mind?`;

      case 'surprise':
        return `Nexa here, ${userName}! I can see some excitement in your expression! Something wonderful must have happened. Share what's got you so amazed!`;

      case 'disgust':
        return `Nexa speaking, ${userName}. I can sense something is bothering you deeply. Your feelings are completely valid. Let's talk about what's troubling you.`;
        
      default:
        return `Nexa here, ${userName}! I can see you have a calm, thoughtful presence. I'm here with advanced emotion understanding, ready to listen to whatever you'd like to share. How are you feeling today?`;
    }
  };

  const fallbackGreeting = (userName) => {
    setTimeout(() => {
      speakText(`Nexa here, ${userName}! I'm excited to chat with you using advanced emotion recognition. How are you feeling today?`);
    }, 1000);
  };

  const speakText = (text) => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('google') && 
        voice.name.toLowerCase().includes('female')
      ) || voices.find(voice =>
        voice.name.toLowerCase().includes('aria') || 
        voice.name.toLowerCase().includes('zira')
      ) || voices.find(voice =>
        voice.lang.startsWith('en')
      );

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesis) {
      speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }
  };

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const userMessage = {
        id: messages.length + 1,
        text: inputText.trim(),
        sender: 'user',
        timestamp: new Date(),
        userInitial: user?.email?.charAt(0).toUpperCase() || 'U'
      };
      
      setMessages(prev => [...prev, userMessage]);
      const messageText = inputText.trim();
      setInputText('');
      
      // Add typing indicator immediately for better user experience
      const typingMessage = {
        id: messages.length + 2,
        text: '',
        sender: 'ai',
        timestamp: new Date(),
        isTyping: true
      };
      setMessages(prev => [...prev, typingMessage]);

      // Analyze emotion and get Gemini response
      try {
        setIsAnalyzingEmotion(true);
        
        // First analyze emotion
        const emotionResponse = await mlService.analyzeText(messageText, user?.email || 'demo_user');        setIsAnalyzingEmotion(false);

        if (emotionResponse) {
          const emotion = emotionResponse.predicted_emotion;
          const confidence = emotionResponse.confidence;
          
          const emotionEmoji = {
            'angry': '😤', 'sad': '😢', 'fear': '😰', 'happy': '😊', 
            'surprise': '😮', 'disgust': '😖', 'neutral': '😌'
          };
          
          setLastDetectedEmotion({
            emotion: emotion,
            confidence: confidence,
            emoji: emotionEmoji[emotion.toLowerCase()] || '😌'
          });
          
          // Get user name
          const userName = user?.email?.split('@')[0] || 'friend';
          
          // Show instant emotional response first for speed
          const quickResponse = generateEmotionalResponse(emotion, userName, messageText);
          const quickMessage = {
            id: messages.length + 1,
            text: quickResponse,
            sender: 'ai',
            timestamp: new Date(),
            emotion: emotion,
            confidence: confidence,
            source: 'instant'
          };
          
          setMessages(prev => prev.slice(0, -1).concat([quickMessage])); // Replace typing indicator
          setTimeout(() => speakText(quickResponse), 50);
          
          // Then try to get Gemini response and update if successful
          try {
            // Generate Gemini response with emotion context (in background)
            console.log('🔧 DEBUG: Calling Gemini API with:', { 
              message: messageText, 
              userId: user?.email || 'demo_user', 
              userName, 
              emotion, 
              confidence,
              authToken: mlService.authToken ? 'Present' : 'Missing'
            });
            
            const geminiResponse = await mlService.generateGeminiResponse(
              messageText,
              user?.email || 'demo_user',
              userName,
              emotion,
              confidence
            );
            
            console.log('✅ DEBUG: Gemini response received:', geminiResponse);

            if (geminiResponse?.response && geminiResponse.response !== quickResponse) {
              // Update with better Gemini response only if it's different
              const geminiMessage = {
                id: messages.length,
                text: geminiResponse.response,
                sender: 'ai',
                timestamp: new Date(),
                emotion: emotion,
                confidence: confidence,
                source: geminiResponse.source || 'gemini'
              };
              
              setMessages(prev => prev.slice(0, -1).concat([geminiMessage])); // Replace instant response
              // Don't speak again to avoid interruption
            }
            
          } catch (geminiError) {
            console.error('❌ DEBUG: Gemini response error:', geminiError);
            console.log('🔄 DEBUG: Keeping instant emotional response');
            // Keep the instant response - no need to change anything
          }        } else {
          throw new Error('Emotion analysis failed');
        }
        
      } catch (error) {
        console.error('Error processing message:', error);
        setIsAnalyzingEmotion(false);
        
        // Complete fallback
        const fallbackResponse = "I'm here to listen and support you. What would you like to talk about?";
        
        const aiMessage = {
          id: messages.length + 1,
          text: fallbackResponse,
          sender: 'ai',
          timestamp: new Date(),
          source: 'error_fallback'
        };
        
        setMessages(prev => prev.slice(0, -1).concat([aiMessage])); // Replace typing indicator
        setTimeout(() => speakText(fallbackResponse), 25);
      }
    }
  };

  const generateEmotionalResponse = (emotion, userName, userText) => {
    const text = userText.toLowerCase();
    
    // Generate contextual response based on user's text content
    const contextualResponse = generateContextualResponse(userText, userName);
    
    // Add emotion-aware empathy based on detected emotion
    const emotionalEmpathy = generateEmotionalEmpathy(emotion, userName);
    
    // Combine both for a complete ChatGPT-like response
    return `Nexa here, ${userName}! ${contextualResponse} ${emotionalEmpathy}`;
  };

  const generateContextualResponse = (userText, userName) => {
    const text = userText.toLowerCase();
    
    // Question handling
    if (text.includes('?') || text.startsWith('how') || text.startsWith('what') || text.startsWith('why') || text.startsWith('when') || text.startsWith('where')) {
      if (text.includes('weather')) {
        return "I'd recommend checking a weather app for the most accurate forecast. Weather can really affect our mood, doesn't it?";
      } else if (text.includes('time')) {
        return `It's ${new Date().toLocaleTimeString()}. Time has a way of putting things in perspective.`;
      } else if (text.includes('help') || text.includes('advice')) {
        return "I'm here to help! While I'm an AI focused on emotional support, I'll do my best to guide you.";
      } else if (text.includes('feel') || text.includes('emotion')) {
        return "Feelings are complex and valid. I'm designed to understand and respond to emotions, so please share what's on your mind.";
      } else {
        return "That's a thoughtful question! While I specialize in emotional support, I can sense there's something deeper you're exploring.";
      }
    }
    
    // Work/Career topics
    if (text.includes('work') || text.includes('job') || text.includes('career') || text.includes('boss')) {
      return "Work can be both rewarding and challenging. Finding balance and purpose in what we do is so important for our wellbeing.";
    }
    
    // Relationship topics
    if (text.includes('friend') || text.includes('family') || text.includes('relationship') || text.includes('love')) {
      return "Relationships are at the heart of human experience. They bring joy, growth, and sometimes challenges that help us learn about ourselves.";
    }
    
    // Health/Wellness
    if (text.includes('tired') || text.includes('sleep') || text.includes('health') || text.includes('sick')) {
      return "Taking care of your physical health is so important for emotional wellbeing too. Rest and self-care aren't luxuries - they're necessities.";
    }
    
    // Learning/Education
    if (text.includes('learn') || text.includes('study') || text.includes('school') || text.includes('course')) {
      return "Learning is a beautiful journey! Every new piece of knowledge opens doors to understanding ourselves and the world better.";
    }
    
    // Technology/AI
    if (text.includes('ai') || text.includes('technology') || text.includes('computer') || text.includes('robot')) {
      return "Technology like AI can be fascinating! I'm here as your emotional companion, using AI to better understand and support you.";
    }
    
    // Goals/Dreams
    if (text.includes('dream') || text.includes('goal') || text.includes('future') || text.includes('plan')) {
      return "Dreams and goals give our lives direction and meaning. What you're sharing sounds important to you.";
    }
    
    // Problem/Issues
    if (text.includes('problem') || text.includes('issue') || text.includes('difficult') || text.includes('hard')) {
      return "Challenges are part of life's journey. Sometimes talking through problems helps us see new perspectives and solutions.";
    }
    
    // Gratitude/Positivity
    if (text.includes('thank') || text.includes('grateful') || text.includes('appreciate') || text.includes('amazing')) {
      return "Your gratitude and positivity are wonderful to hear! These moments of appreciation are so valuable.";
    }
    
    // General life topics
    if (text.includes('life') || text.includes('world') || text.includes('people')) {
      return "Life is full of experiences that shape who we are. Your perspective on things is unique and valuable.";
    }
    
    // Default response for general conversation
    return "I hear what you're saying, and it sounds meaningful to you.";
  };

  const generateEmotionalEmpathy = (emotion, userName) => {
    switch (emotion.toLowerCase()) {
      case 'angry':
        return "I can sense some frustration in your words. It's completely valid to feel this way, and I'm here to listen without judgment.";
        
      case 'sad':
        return "I notice some sadness in what you've shared. You don't have to carry these feelings alone - I'm here with you.";
        
      case 'fear':
        return "I can detect some worry or concern. Remember, you're stronger than you know, and it's okay to feel uncertain sometimes.";
        
      case 'happy':
        return "Your joy really comes through in your message! It's wonderful to share in your positive energy.";
        
      case 'surprise':
        return "I can sense some excitement or amazement in your words! It's delightful when life brings us unexpected moments.";
        
      case 'disgust':
        return "I can tell something is really bothering you. Your feelings are completely valid, and it's important to acknowledge them.";
        
      case 'neutral':
        return "You seem thoughtful and composed. I appreciate you sharing your thoughts with me.";
        
      default:
        return "I'm here to listen and understand whatever you're experiencing.";
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
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-gray-950 to-black text-white overflow-hidden mobile-full-height">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/10 via-purple-950/5 to-slate-950/20 animate-pulse"></div>
      
      {/* Header - Mobile Optimized */}
      <header className="relative mobile-nav-z p-3 sm:p-4 lg:p-6 border-b border-white/10 backdrop-blur-xl bg-white/5 safe-area-top">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              <div className="w-10 sm:w-12 lg:w-14 h-10 sm:h-12 lg:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/90 via-blue-100/80 to-white/70 text-gray-800 flex items-center justify-center text-base sm:text-lg lg:text-xl font-bold shadow-lg">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            
            <div className="space-y-1 min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Nexa
              </h1>
              <div className="min-h-[1.25rem] sm:min-h-[1.5rem]">
                <p className="text-xs sm:text-sm lg:text-base text-gray-300 flex items-center truncate">
                  {isAnalyzingEmotion ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map(dot => (
                          <div 
                            key={dot}
                            className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-purple-400 rounded-full animate-pulse"
                            style={{ animationDelay: `${dot * 0.2}s` }}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-purple-300 text-xs sm:text-sm">Understanding emotions...</span>
                    </div>
                  ) : isAiSpeaking ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map(dot => (
                          <div 
                            key={dot}
                            className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-emerald-400 rounded-full animate-pulse"
                            style={{ animationDelay: `${dot * 0.2}s` }}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-xs sm:text-sm truncate">
                        {lastDetectedEmotion ? 
                          `Nexa responding (${lastDetectedEmotion.emotion} ${lastDetectedEmotion.emoji})...` : 
                          'Nexa is speaking...'
                        }
                      </span>
                    </div>
                  ) : isListening ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                      <span className="font-medium text-blue-300 text-xs sm:text-sm">Listening...</span>
                    </div>
                  ) : lastDetectedEmotion ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-base sm:text-lg">{lastDetectedEmotion.emoji}</span>
                      <span className="text-gray-400 text-xs sm:text-sm truncate">
                        Last emotion: {lastDetectedEmotion.emotion} • NexaModel V2 (82% accuracy)
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs sm:text-sm">NexaModel V2 - High-Accuracy Emotion AI Ready</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          {/* Action Buttons - Mobile Optimized */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {isAiSpeaking && (
              <button 
                onClick={stopSpeaking}
                className="touch-button group p-2 sm:p-2.5 lg:p-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition-all duration-300 text-red-400 hover:text-red-300 backdrop-blur-sm border border-red-500/30 hover:scale-105"
              >
                <Square className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 group-hover:animate-pulse" />
              </button>
            )}
            <button className="touch-button group p-2 sm:p-2.5 lg:p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-105">
              <Settings className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
            <button 
              onClick={handleSignOut}
              className="touch-button group p-2 sm:p-2.5 lg:p-3 rounded-xl bg-white/10 hover:bg-red-500/20 transition-all duration-300 text-gray-300 hover:text-red-300 backdrop-blur-sm border border-white/20 hover:border-red-500/30 hover:scale-105"
            >
              <LogOut className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Optimized */}
      <div className="relative mobile-modal-z flex flex-col h-[calc(100vh-80px)] sm:h-[calc(100vh-96px)]">
        {/* Messages Area */}
        <div className="flex-1 relative overflow-hidden">
          {messages.filter(message => message.sender === 'user').length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center space-y-6 sm:space-y-8 max-w-md mx-auto">
                <div className="relative mx-auto w-24 sm:w-32 h-24 sm:h-32">
                  <div className="w-24 sm:w-32 h-24 sm:h-32 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/20 via-blue-500/10 to-emerald-500/10 flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl">
                    <Mic className="w-12 sm:w-16 h-12 sm:h-16 text-white/70" />
                  </div>
                </div>
                
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-light text-white/90 leading-tight">
                    <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                      I'm analyzing how you feel
                    </span>
                  </h3>
                  <p className="text-sm sm:text-base lg:text-lg text-gray-300 leading-relaxed max-w-xs sm:max-w-sm mx-auto">
                    Share your thoughts with me, and I'll understand your emotions to help you feel better
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto w-full overflow-y-auto smooth-scroll">
              {messages.filter(message => message.sender === 'user').map((message) => (
                <div key={message.id} className="animate-fadeIn">
                  <MessageBubble message={message} isUser={true} />
                </div>
              ))}

              {/* Emotion Analysis Indicator */}
              {isAiSpeaking && (
                <div className="flex justify-start animate-slideInLeft">
                  <div className="max-w-[85%] sm:max-w-sm lg:max-w-md bg-gradient-to-br from-emerald-500/10 via-white/5 to-emerald-500/5 backdrop-blur-xl border border-emerald-400/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                    <div className="flex items-center space-x-3 sm:space-x-4 mb-2 sm:mb-3">
                      <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-bold shadow-lg text-sm sm:text-base">
                        AI
                      </div>
                      <div className="flex-1">
                        <span className="text-emerald-300 font-medium text-sm sm:text-base">Speaking with empathy...</span>
                      </div>
                    </div>
                    <div className="h-16 sm:h-20 relative">
                      <VoiceWaveform isActive={true} type="speaking" isInline={true} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Voice Waveform Animation (Welcome) - Mobile Optimized */}
        {isAiSpeaking && !hasAnalyzedInitialEmotion && (
          <VoiceWaveform isActive={true} type="speaking" isInline={false} />
        )}

        {/* Input Area - Mobile Optimized */}
        <div className="relative mobile-modal-z p-3 sm:p-4 lg:p-6 border-t border-white/10 backdrop-blur-xl bg-gradient-to-t from-black/20 to-transparent safe-area-bottom">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end space-x-2 sm:space-x-3 lg:space-x-4">
              {/* Voice Button - Mobile Optimized */}
              <button
                onClick={toggleVoiceRecording}
                className={`touch-button group relative p-3 lg:p-3.5 rounded-xl sm:rounded-2xl transition-all duration-300 flex-shrink-0 ${
                  isListening 
                    ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30 scale-110' 
                    : 'bg-gradient-to-br from-white/80 to-white/60 text-gray-800 hover:from-white/90 hover:to-white/70 shadow-lg hover:shadow-xl hover:scale-105'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 text-white" />
                ) : (
                  <Mic className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7" />
                )}
                {isListening && (
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl border-2 border-red-300/50 animate-ping"></div>
                )}
              </button>

              {/* Text Input - Mobile Optimized */}
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts and feelings..."
                  className="w-full p-3 sm:p-4 lg:p-5 pr-10 sm:pr-12 lg:pr-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-800/90 via-gray-800/85 to-slate-900/90 backdrop-blur-xl border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 focus:bg-slate-800/95 resize-none min-h-[48px] sm:min-h-[56px] lg:min-h-[64px] max-h-32 sm:max-h-40 text-sm sm:text-base lg:text-lg font-medium transition-all duration-300 shadow-2xl"
                  rows="1"
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="touch-button absolute right-2 top-1/2 transform -translate-y-1/2 p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-500/90 hover:to-blue-600/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                >
                  <Send className="w-3.5 sm:w-4 lg:w-5 h-3.5 sm:h-4 lg:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatPage;