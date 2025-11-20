import React from 'react';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-black/50 backdrop-blur-sm border-t border-white/20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {/* Stylish Nexaa Text Logo */}
              <div className="relative group">
                {/* Main Brand Text */}
                <h3 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500 tracking-wide leading-tight transform hover:scale-105 transition-transform duration-300 drop-shadow-lg">
                  Nexaa
                </h3>
                
                {/* Underline Decoration */}
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-white to-gray-500 rounded-full opacity-60 animate-pulse"></div>
                
                {/* Floating Sparkles */}
                <div className="absolute -top-2 right-2 w-2 h-2 bg-white/80 rounded-full animate-bounce shadow-lg shadow-white/50"></div>
                <div className="absolute top-1 -left-2 w-1.5 h-1.5 bg-gray-300/80 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-2 right-6 w-1 h-1 bg-white/60 rounded-full animate-ping"></div>
                
                {/* Subtitle */}
                <div className="text-xs text-gray-400 font-medium tracking-widest uppercase opacity-80 italic mt-1">
                  AI Companion
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Your compassionate AI companion for mental wellness. Advanced emotion recognition 
              and voice interaction technology that understands, supports, and empowers your well-being.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com/kishanBhandary" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300">
                <Github size={18} className="text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300">
                <Twitter size={18} className="text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300">
                <Linkedin size={18} className="text-white" />
              </a>
              <a href="mailto:support@nexaa.ai" className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300">
                <Mail size={18} className="text-white" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-semibold mb-4">Features</h4>
            <ul className="space-y-3">
              <li><a href="/chat" className="text-gray-400 hover:text-white transition-colors text-sm">AI Chat Assistant</a></li>
              <li><a href="/emotion-analysis" className="text-gray-400 hover:text-white transition-colors text-sm">Emotion Recognition</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Voice Interaction</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Mental Wellness Tracking</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Personalized Support</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Help Center</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Getting Started</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Mental Health Resources</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Community Forum</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Crisis Support</a></li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-white font-semibold mb-4">About</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Our Mission</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Our Team</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">AI Ethics</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="max-w-md mx-auto text-center lg:text-left lg:max-w-none lg:flex lg:items-center lg:justify-between">
            <div className="lg:flex-1">
              <h4 className="text-white font-semibold mb-2">Stay Connected</h4>
              <p className="text-gray-400 text-sm mb-4 lg:mb-0">
                Get mental wellness tips, AI insights, and Nexaa updates delivered to your inbox.
              </p>
            </div>
            <div className="lg:flex-shrink-0 lg:ml-8">
              <div className="flex gap-3 max-w-sm mx-auto lg:mx-0">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40 text-sm"
                />
                <button className="px-6 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">
                  Join Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20 bg-black/30">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>© 2025 Nexaa. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <span>Empowering mental wellness with</span>
              <Heart size={16} className="text-red-500 animate-pulse" />
              <span>and AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-24 h-24 bg-gray-300/5 rounded-full blur-2xl"></div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </footer>
  );
};

export default Footer;