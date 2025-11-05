import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mic, MicOff, Send, Settings, LogOut } from 'lucide-react';
import MessageBubble from './MessageBubble';
import VoiceWaveform from './VoiceWaveform';

const ChatPage = () => {
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hi ${user?.email?.split('@')[0] || 'there'}, how can I help you today?`,
      sender: 'ai',
      timestamp: new Date(),
      userInitial: user?.email?.charAt(0).toUpperCase() || 'U'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
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
  }, []);

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
      
      // Simulate AI thinking/speaking
      setIsAiSpeaking(true);
      
      // Simulate AI response
      setTimeout(() => {
        const aiMessage = {
          id: messages.length + 2,
          text: "I understand your message. This is a simulated AI response that demonstrates the chat interface functionality with enhanced styling and animations.",
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsAiSpeaking(false);
      }, 2000);
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-black/40 to-gray-900/20"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-gray-900/30 to-black/90"></div>
      
      {/* Header */}
      <header className="relative z-10 p-3 sm:p-4 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-white/80 to-gray-300 text-black flex items-center justify-center text-xs sm:text-sm font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Hi {user?.email?.split('@')[0] || 'there'}!
              </h1>
              <p className="text-xs sm:text-sm text-gray-400">How can I help you today?</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
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

      {/* Chat Container */}
      <div className="relative z-10 flex flex-col h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 max-w-4xl mx-auto w-full">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isUser={message.sender === 'user'}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Voice Waveform Animation (Central) */}
        <VoiceWaveform 
          isActive={isListening || isAiSpeaking} 
          type={isListening ? 'listening' : 'speaking'} 
        />

        {/* Input Area */}
        <div className="p-3 sm:p-4 border-t border-white/10 backdrop-blur-sm">
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