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
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-white to-gray-300 shadow-lg shadow-white/50"></div>
              <h3 className="text-xl font-bold text-white">AI Project</h3>
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Cutting-edge AI technology that transforms the way you work. 
              Building the future of artificial intelligence, one innovation at a time.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300">
                <Github size={18} className="text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300">
                <Twitter size={18} className="text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300">
                <Linkedin size={18} className="text-white" />
              </a>
              <a href="mailto:dev@aiproject.com" className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all duration-300">
                <Mail size={18} className="text-white" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">AI Assistant</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Analytics Dashboard</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Automation Tools</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">API Integration</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Enterprise Solutions</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">API Reference</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Tutorials</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Community</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Support Center</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Our Mission</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="max-w-md mx-auto text-center lg:text-left lg:max-w-none lg:flex lg:items-center lg:justify-between">
            <div className="lg:flex-1">
              <h4 className="text-white font-semibold mb-2">Stay Updated</h4>
              <p className="text-gray-400 text-sm mb-4 lg:mb-0">
                Get the latest AI insights and product updates delivered to your inbox.
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
                  Subscribe
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
              <span>© 2025 AI Project. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <span>Made with</span>
              <Heart size={16} className="text-red-500 animate-pulse" />
              <span>by our amazing team</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-24 h-24 bg-gray-300/5 rounded-full blur-2xl"></div>
      </div>
    </footer>
  );
};

export default Footer;