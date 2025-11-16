import React from 'react';

const MessageBubble = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 sm:mb-6 animate-slideInUp`}>
      <div className="flex items-end space-x-2 sm:space-x-3 max-w-[85%] sm:max-w-sm md:max-w-md lg:max-w-lg">
        {/* Enhanced AI Avatar */}
        {!isUser && (
          <div className="relative group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white flex items-center justify-center text-sm sm:text-base font-bold mb-1 flex-shrink-0 shadow-lg transition-transform duration-300 group-hover:scale-110">
              AI
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400/40 to-emerald-600/40 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition-all duration-300"></div>
          </div>
        )}
        
        {/* Enhanced Message Content */}
        <div
          className={`relative p-4 sm:p-5 rounded-3xl transition-all duration-300 hover:scale-[1.02] ${
            isUser
              ? 'bg-gradient-to-br from-blue-500/90 via-blue-600/90 to-blue-700/90 text-white ml-2 sm:ml-4 border border-blue-400/40 shadow-xl shadow-blue-500/25'
              : 'bg-gradient-to-br from-gray-800/95 via-gray-700/95 to-gray-900/95 text-white mr-2 sm:mr-4 border border-gray-600/40 shadow-xl shadow-gray-900/40'
          } backdrop-blur-xl`}
        >
          {/* Enhanced Glow Effect */}
          <div 
            className={`absolute inset-0 rounded-3xl ${
              isUser 
                ? 'bg-gradient-to-br from-blue-400/20 via-blue-500/15 to-blue-600/20' 
                : 'bg-gradient-to-br from-white/10 via-gray-400/5 to-white/10'
            } blur-lg -z-10`}
          />
          
          {/* Modern Message Tail */}
          <div 
            className={`absolute top-4 ${
              isUser ? '-right-2' : '-left-2'
            } w-4 h-4 ${
              isUser 
                ? 'bg-gradient-to-br from-blue-500/90 to-blue-600/90 border-blue-400/40' 
                : 'bg-gradient-to-br from-gray-800/95 to-gray-900/95 border-gray-600/40'
            } transform rotate-45 border shadow-lg`}
          />
          
          {/* Message Content with Enhanced Styling */}
          {message.media ? (
            <div className="relative z-10">
              {message.mediaType === 'photo' ? (
                <img 
                  src={message.media} 
                  alt="Shared image" 
                  className="max-w-full max-h-72 rounded-2xl border border-white/30 mb-3 shadow-lg"
                />
              ) : message.mediaType === 'video' ? (
                <video 
                  src={message.media} 
                  controls 
                  className="max-w-full max-h-72 rounded-2xl border border-white/30 mb-3 shadow-lg"
                />
              ) : null}
              {message.text && (
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-white/95">
                  {message.text}
                </p>
              )}
            </div>
          ) : (
            /* Enhanced Message Text */
            <p className="text-sm sm:text-base leading-relaxed relative z-10 whitespace-pre-wrap text-white/95 font-medium">
              {message.text}
            </p>
          )}
          
          {/* Enhanced Timestamp */}
          <div className={`flex items-center justify-between mt-3 relative z-10`}>
            <p className={`text-xs opacity-75 ${
              isUser ? 'text-blue-100' : 'text-gray-300'
            }`}>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
            
            {/* Message Status Indicator */}
            {isUser && (
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                <div className="w-1 h-1 bg-white/80 rounded-full"></div>
              </div>
            )}
          </div>
          
          {/* Enhanced Typing Indicator for AI */}
          {!isUser && message.isTyping && (
            <div className="flex items-center space-x-2 mt-3 relative z-10">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce shadow-lg shadow-emerald-400/50"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-300">Nexa is typing...</span>
            </div>
          )}
        </div>
        
        {/* Enhanced User Avatar */}
        {isUser && (
          <div className="relative group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-white/95 via-blue-100/90 to-white/85 text-gray-800 flex items-center justify-center text-sm sm:text-base font-bold mb-1 flex-shrink-0 shadow-lg border border-white/40 transition-transform duration-300 group-hover:scale-110">
              {message.userInitial || 'U'}
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-white/40 to-blue-200/40 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition-all duration-300"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;