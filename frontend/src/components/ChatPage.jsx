import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mic, MicOff, Send, Settings, LogOut, Square } from 'lucide-react';
import MessageBubble from './MessageBubble';
import VoiceWaveform from './VoiceWaveform';

const ChatPage = () => {
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [speechSynthesis, setSpeechSynthesis] = useState(null);
  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition and synthesis
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

  // Welcome message effect
  useEffect(() => {
    if (speechSynthesis && !hasSpokenWelcome) {
      const timer = setTimeout(() => {
        const welcomeMessage = `Hi ${user?.email?.split('@')[0] || 'there'}, I'm your AI voice assistant. How can I help you today?`;
        speakText(welcomeMessage);
        setHasSpokenWelcome(true);
      }, 1000); // Wait 1 second after component mounts

      return () => clearTimeout(timer);
    }
  }, [speechSynthesis, hasSpokenWelcome, user]);

  const speakText = (text) => {
    if (speechSynthesis) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;
      
      // Find a female voice if available
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('samantha')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      utterance.onstart = () => {
        setIsAiSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsAiSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsAiSpeaking(false);
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

  const handleSendMessage = () => {
    if (inputText.trim()) {
      const userMessage = {
        id: messages.length + 1,
        text: inputText.trim(),
        sender: 'user',
        timestamp: new Date(),
        userInitial: user?.email?.charAt(0).toUpperCase() || 'U'
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      
      // Generate AI response text (not displayed, only spoken)
      const aiResponses = [
        "I understand what you're saying. Let me think about that for a moment.",
        "That's a really interesting question! Here's what I think about it.",
        "I can definitely help you with that. Let me provide you with some insights.",
        "Great question! I'll do my best to give you a helpful response.",
        "I hear you clearly. Let me process your request and give you a thoughtful answer.",
        "That's something I can assist with. Here's my perspective on the matter.",
        "I appreciate you sharing that with me. Let me give you some useful information.",
        "Thank you for asking. I have some ideas that might help you with this.",
        "Interesting point! Let me break this down for you in a clear way.",
        "I've been thinking about similar topics lately. Here's what I've learned."
      ];
      
      // Add some contextual responses based on keywords
      const userText = inputText.toLowerCase();
      let selectedResponse;
      
      if (userText.includes('hello') || userText.includes('hi') || userText.includes('hey')) {
        selectedResponse = "Hello there! It's great to hear from you. What can I help you with today?";
      } else if (userText.includes('help') || userText.includes('assist')) {
        selectedResponse = "I'm here to help! Tell me more about what you need assistance with.";
      } else if (userText.includes('thank')) {
        selectedResponse = "You're very welcome! I'm always happy to help. Is there anything else I can assist you with?";
      } else if (userText.includes('how are you')) {
        selectedResponse = "I'm doing wonderfully, thank you for asking! I'm here and ready to help with whatever you need.";
      } else {
        selectedResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      }
      
      // Simulate thinking time then speak the response
      setTimeout(() => {
        speakText(selectedResponse);
      }, 500);
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
    <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black/40 to-gray-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-gray-900/30 to-black/90"></div>
      
      {/* Header */}
      <header className="relative z-10 p-3 sm:p-4 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-white/80 to-gray-300 text-black flex items-center justify-center text-xs sm:text-sm font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Voice Assistant
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">
                {isAiSpeaking ? 'AI is speaking...' : isListening ? 'Listening...' : 'Speak or type your message'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            {isAiSpeaking && (
              <button 
                onClick={stopSpeaking}
                className="p-1.5 sm:p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors text-red-400 hover:text-red-300"
              >
                <Square className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            <button className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={handleSignOut}
              className="p-1.5 sm:p-2 rounded-lg bg-white/10 hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Full Screen Centered */}
      <div className="relative z-10 flex flex-col h-[calc(100vh-80px)]">
        {/* Messages Area - Hidden scrollbars, centered content */}
        <div className="flex-1 relative">
          {/* Filter to show only user messages */}
          {messages.filter(message => message.sender === 'user').length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-white/10 to-gray-300/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Mic className="w-10 h-10 text-white/60" />
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white/80 mb-3">Ready to help</h3>
                  <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                    I'll respond with voice only. Use the microphone or type your message to get started.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 p-4 space-y-4 max-w-4xl mx-auto w-full">
              {messages.filter(message => message.sender === 'user').map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isUser={true}
                />
              ))}
            </div>
          )}
        </div>

        {/* Voice Waveform Animation (Full Screen Overlay when active) */}
        <VoiceWaveform 
          isActive={isListening || isAiSpeaking} 
          type={isListening ? 'listening' : 'speaking'} 
        />

        {/* Input Area - Fixed at bottom */}
        <div className="relative z-20 p-3 sm:p-4 border-t border-white/10 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-2 sm:space-x-4">
              {/* Voice Button */}
              <button
                onClick={toggleVoiceRecording}
                className={`p-2.5 sm:p-3 rounded-full transition-all duration-300 flex-shrink-0 ${
                  isListening 
                    ? 'bg-red-500 shadow-lg shadow-red-500/50 scale-110' 
                    : 'bg-gradient-to-r from-white/80 to-gray-300 text-black hover:shadow-lg hover:shadow-white/50'
                }`}
                style={{
                  filter: isListening 
                    ? 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.6))' 
                    : 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.4))'
                }}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                ) : (
                  <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full p-2.5 sm:p-3 pr-10 sm:pr-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent resize-none min-h-[44px] sm:min-h-[50px] max-h-32 text-sm sm:text-base"
                  rows="1"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-white/80 to-gray-300 text-black hover:from-white hover:to-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;