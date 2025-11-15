import React from 'react';

const MessageBubble = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4`}>
      <div className="flex items-end space-x-1.5 sm:space-x-2 max-w-[85%] sm:max-w-xs md:max-w-md lg:max-w-lg">
        {/* AI Avatar */}
        {!isUser && (
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-white/80 to-gray-300 text-black flex items-center justify-center text-xs font-semibold mb-1 flex-shrink-0">
            <span className="hidden sm:inline">AI</span>
            <span className="sm:hidden text-[10px]">AI</span>
          </div>
        )}
        
        {/* Message Content */}
        <div
          className={`relative p-3 sm:p-4 rounded-2xl ${
            isUser
              ? 'bg-gradient-to-br from-white/20 via-gray-300/20 to-white/20 text-white ml-2 sm:ml-4 border border-white/30'
              : 'bg-gradient-to-br from-gray-800/90 via-gray-700/90 to-gray-800/90 text-white mr-2 sm:mr-4 border border-white/20'
          } backdrop-blur-sm shadow-lg`}
          style={{
            filter: isUser 
              ? 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.3))' 
              : 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.2))'
          }}
        >
          {/* Glowing Edge Effect */}
          <div 
            className={`absolute inset-0 rounded-2xl ${
              isUser 
                ? 'bg-gradient-to-br from-white/20 to-gray-300/20' 
                : 'bg-gradient-to-br from-white/10 to-gray-500/10'
            } blur-sm -z-10`}
          />
          
          {/* Message Tail */}
          <div 
            className={`absolute top-3 ${
              isUser ? '-right-2' : '-left-2'
            } w-4 h-4 ${
              isUser 
                ? 'bg-gradient-to-br from-white/20 to-gray-300/20 border-white/30' 
                : 'bg-gradient-to-br from-gray-800/90 to-gray-700/90 border-white/20'
            } transform rotate-45 border`}
          />
          
          {/* Message Content */}
          {message.media ? (
            <div className="relative z-10">
              {message.mediaType === 'photo' ? (
                <img 
                  src={message.media} 
                  alt="Shared image" 
                  className="max-w-full max-h-64 rounded-lg border border-white/20 mb-2"
                />
              ) : message.mediaType === 'video' ? (
                <video 
                  src={message.media} 
                  controls 
                  className="max-w-full max-h-64 rounded-lg border border-white/20 mb-2"
                />
              ) : null}
              {message.text && (
                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {message.text}
                </p>
              )}
            </div>
          ) : (
            /* Message Text */
            <p className="text-xs sm:text-sm leading-relaxed relative z-10 whitespace-pre-wrap">
              {message.text}
            </p>
          )}
          
          {/* Timestamp */}
          <p className="text-[10px] sm:text-xs opacity-70 mt-1.5 sm:mt-2 relative z-10">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
          
          {/* Typing Indicator for AI */}
          {!isUser && message.isTyping && (
            <div className="flex items-center space-x-1 mt-2">
              <div className="flex space-x-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* User Avatar */}
        {isUser && (
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-white/80 to-gray-300 text-black flex items-center justify-center text-xs font-semibold mb-1 flex-shrink-0">
            <span className="text-[10px] sm:text-xs">{message.userInitial || 'U'}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;