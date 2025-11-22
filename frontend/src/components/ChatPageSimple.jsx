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
      
      const formData = new FormData();
      formData.append('video_file', imageBlob, 'initial_capture.jpg');
      
      const response = await fetch(`${import.meta.env.VITE_ML_API_BASE || 'http://localhost:8001'}/analyze/video`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer demo-token-123` },
        body: formData
      });
      
      setIsAnalyzingEmotion(false);
      
      if (response.ok) {
        const emotionData = await response.json();
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
        
        const personalizedResponse = generatePersonalizedWelcome(emotion, userName);
        setTimeout(() => speakText(personalizedResponse), 1500);
        
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
        return `I can see that beautiful smile, ${userName}! Your happiness is absolutely radiant. What's bringing you such joy today? I'd love to celebrate with you!`;
        
      case 'sad':
        return `${userName}, I can see there's some sadness in your expression. You're brave for being here, and I want you to know that you're not alone. What's been weighing on your heart?`;
        
      case 'angry':
        return `${userName}, I can sense some frustration. Those feelings are completely valid, and I'm here to listen. Take a deep breath with me - you're safe here. What's been bothering you?`;
        
      case 'fear':
        return `${userName}, I notice some worry in your expression. Remember that you're stronger than you know, and you don't have to face anything alone. What's been on your mind?`;
        
      default:
        return `${userName}, I can see you have a calm, thoughtful presence. I'm here and ready to listen to whatever you'd like to share. How are you feeling today?`;
    }
  };

  const fallbackGreeting = (userName) => {
    setTimeout(() => {
      speakText(`Hello ${userName}! I'm excited to chat with you. How are you feeling today?`);
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
      
      // Analyze emotion and respond
      try {
        setIsAnalyzingEmotion(true);
        
        const response = await fetch(`${import.meta.env.VITE_ML_API_BASE || 'http://localhost:8001'}/analyze/text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer demo-token-123`
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
          
          const emotionEmoji = {
            'angry': '😤', 'sad': '😢', 'fear': '😰', 'happy': '😊', 
            'surprise': '😮', 'disgust': '😖', 'neutral': '😌'
          };
          
          setLastDetectedEmotion({
            emotion: emotion,
            confidence: confidence,
            emoji: emotionEmoji[emotion.toLowerCase()] || '😌'
          });
          
          const userName = user?.email?.split('@')[0] || 'friend';
          const emotionAwareResponse = generateEmotionalResponse(emotion, userName, messageText);
          
          setTimeout(() => speakText(emotionAwareResponse), 800);
          
        } else {
          setTimeout(() => {
            speakText("I'm here to listen and support you. What would you like to talk about?");
          }, 500);
        }
        
      } catch (error) {
        console.error('Error analyzing emotion:', error);
        setIsAnalyzingEmotion(false);
        setTimeout(() => {
          speakText("I'm here for you. Tell me more about what's on your mind.");
        }, 500);
      }
    }
  };

  const generateEmotionalResponse = (emotion, userName, userText) => {
    const text = userText.toLowerCase();
    
    switch (emotion.toLowerCase()) {
      case 'angry':
        return [
          `${userName}, I can sense some frustration in your words. Take a deep breath - you're safe here with me. What's really bothering you?`,
          `It sounds like you're feeling angry right now, ${userName}. That's completely valid. Let's talk through what's happening.`,
          `I notice you might be upset, ${userName}. Remember, anger is just an emotion passing through. How can I help you feel calmer?`
        ][Math.floor(Math.random() * 3)];
        
      case 'sad':
        return [
          `${userName}, I can hear some sadness in your message. It's okay to feel this way - you don't have to carry it alone.`,
          `I sense you might be feeling down, ${userName}. Remember, tough times don't last, but resilient people like you do.`,
          `Your sadness is valid, ${userName}. Sometimes talking helps - what's been weighing on your heart?`
        ][Math.floor(Math.random() * 3)];
        
      case 'fear':
        return [
          `${userName}, I can sense some worry. You're safe here, and whatever you're facing, you don't have to face it alone.`,
          `It sounds like something might be making you anxious, ${userName}. Remember, courage isn't the absence of fear.`,
          `I notice some concern in your words, ${userName}. What's been on your mind that's causing worry?`
        ][Math.floor(Math.random() * 3)];
        
      case 'happy':
        return [
          `${userName}, I love the positive energy in your message! Your happiness is contagious and brightens my day too!`,
          `What wonderful joy I can hear in your words, ${userName}! It's beautiful to see you in such a great mood.`,
          `Your happiness shines through, ${userName}! Keep that beautiful energy flowing.`
        ][Math.floor(Math.random() * 3)];
        
      default:
        if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
          return `Hello ${userName}! I'm here and ready to listen. What's on your mind today?`;
        } else {
          return `Thank you for sharing that, ${userName}. I'm here to listen. How are you feeling right now?`;
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
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/10 via-purple-950/5 to-slate-950/20 animate-pulse"></div>
      
      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6 border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-white/90 via-blue-100/80 to-white/70 text-gray-800 flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
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
                    <span className="font-medium text-purple-300">Understanding your emotions...</span>
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
          
          {/* Action Buttons */}
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

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-[calc(100vh-96px)]">
        {/* Messages Area */}
        <div className="flex-1 relative overflow-hidden">
          {messages.filter(message => message.sender === 'user').length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-8 max-w-md mx-auto p-6">
                <div className="relative mx-auto w-32 h-32">
                  <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-white/20 via-blue-500/10 to-emerald-500/10 flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl">
                    <Mic className="w-16 h-16 text-white/70" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl sm:text-3xl font-light text-white/90 leading-tight">
                    <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                      I'm analyzing how you feel
                    </span>
                  </h3>
                  <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-sm mx-auto">
                    Share your thoughts with me, and I'll understand your emotions to help you feel better
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 p-4 sm:p-6 space-y-6 max-w-5xl mx-auto w-full overflow-y-auto">
              {messages.filter(message => message.sender === 'user').map((message) => (
                <div key={message.id} className="animate-fadeIn">
                  <MessageBubble message={message} isUser={true} />
                </div>
              ))}

              {/* Emotion Analysis Indicator */}
              {isAiSpeaking && (
                <div className="flex justify-start animate-slideInLeft">
                  <div className="max-w-sm sm:max-w-md lg:max-w-lg bg-gradient-to-br from-emerald-500/10 via-white/5 to-emerald-500/5 backdrop-blur-xl border border-emerald-400/30 rounded-3xl p-6">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-black font-bold shadow-lg">
                        AI
                      </div>
                      <div className="flex-1">
                        <span className="text-emerald-300 font-medium">Speaking with empathy...</span>
                      </div>
                    </div>
                    <div className="h-20 relative">
                      <VoiceWaveform isActive={true} type="speaking" isInline={true} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Voice Waveform Animation (Welcome) */}
        {isAiSpeaking && !hasAnalyzedInitialEmotion && (
          <VoiceWaveform isActive={true} type="speaking" isInline={false} />
        )}

        {/* Input Area */}
        <div className="relative z-20 p-4 sm:p-6 border-t border-white/10 backdrop-blur-xl bg-gradient-to-t from-black/20 to-transparent">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end space-x-3 sm:space-x-4">
              {/* Voice Button */}
              <button
                onClick={toggleVoiceRecording}
                className={`group relative p-3 sm:p-3.5 rounded-2xl transition-all duration-300 flex-shrink-0 ${
                  isListening 
                    ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30 scale-110' 
                    : 'bg-gradient-to-br from-white/80 to-white/60 text-gray-800 hover:from-white/90 hover:to-white/70 shadow-lg hover:shadow-xl hover:scale-105'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                ) : (
                  <Mic className="w-6 h-6 sm:w-7 sm:h-7" />
                )}
                {isListening && (
                  <div className="absolute inset-0 rounded-2xl border-2 border-red-300/50 animate-ping"></div>
                )}
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts and feelings..."
                  className="w-full p-4 sm:p-5 pr-12 sm:pr-14 rounded-2xl bg-gradient-to-br from-slate-800/90 via-gray-800/85 to-slate-900/90 backdrop-blur-xl border border-white/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:border-blue-400/60 focus:bg-slate-800/95 resize-none min-h-[56px] sm:min-h-[64px] max-h-40 text-base sm:text-lg font-medium transition-all duration-300 shadow-2xl"
                  rows="1"
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-500/90 hover:to-blue-600/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
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