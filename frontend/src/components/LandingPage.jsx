import React, { useState } from 'react';
import { ChevronDown, Sparkles, Zap, ArrowRight, X, Mail, Github, Linkedin } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const LandingPage = ({ onNavigateToSignUp, onNavigateToSignIn }) => {
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);

  const developers = [
    {
      id: 1,
      name: "Kishan C Bhandary",
      role: "Lead Developer",
      shortDesc: "Full-stack engineer with AI expertise",
      image: "/kishan.png",
      fullDesc: "Experienced full-stack developer in AI development and system architecture. Specializes in React,SpringBoot, Java, and machine learning frameworks. Led multiple successful AI projects and passionate about creating innovative solutions.",
      skills: ["React", "Spring boot", "Java", "GO", "MongoDb", "MySql","C++","C"],
      email: "kishanbhandary0@gmail.com",
      github: "github.com/kishanBhandary",
      linkedin: "linkedin.com/in/kishan"
    },
    {
      id: 2,
      name: "Lavanya Amin",
      role: "Devops Engineer",
      shortDesc: "DevOps engineer specializing in CI/CD and cloud reliability",
      image: "/lavanya.png",
      fullDesc: "DevOps engineer focused on automating deployments, building reliable CI/CD pipelines, and scaling cloud infrastructure. Experienced with containerization, orchestration, infrastructure as code, monitoring, and SRE best practices to ensure fast, safe delivery and resilient systems.",
      skills: ["CI/CD", "Docker", "Kubernetes", "Terraform", "AWS", "Linux", "Prometheus/Grafana", "Ansible"],
      email: "lavanya@aiproject.com",
      github: "github.com/lavanya",
      linkedin: "linkedin.com/in/lavanya"
    },
    {
      id: 3,
      name: "Diya V Shetty",
      role: "UI/UX Designer",
      shortDesc: "Modern interface designer",
      image: "/diya.png",
      fullDesc: "Creative UI/UX designer with a keen eye for modern, user-centered design. Specializes in creating beautiful, functional interfaces that enhance user experience. Expert in design systems and prototyping.",
      skills: ["Figma", "Adobe Creative Suite", "Prototyping", "User Research", "Design Systems", "Wireframing"],
      email: "diya@aiproject.com",
      github: "github.com/DiyaShettyyy",
      linkedin: "linkedin.com/in/diya"
    },
    {
      id: 4,
      name: "Ashish Kumar",
      role: "AI Specialist",
      shortDesc: "Machine learning expert",
      image: "/ashish.png",
      fullDesc: "PhD in Machine Learning with extensive research focus on neural networks and deep learning algorithms. Experienced in developing AI models for real-world applications and implementing cutting-edge ML solutions.",
      skills: ["TensorFlow", "PyTorch", "Deep Learning", "Neural Networks", "Data Science", "Research"],
      email: "ashish@aiproject.com",
      github: "github.com/ashish19524kumar-create",
      linkedin: "linkedin.com/in/ashish"
    }
  ];

  const openDeveloperModal = (developer) => {
    setSelectedDeveloper(developer);
  };

  const closeDeveloperModal = () => {
    setSelectedDeveloper(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black relative">
      <Navbar 
        onNavigateToSignUp={onNavigateToSignUp}
        onNavigateToSignIn={onNavigateToSignIn}
      />
      
      {/* Deep Space Background with Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-transparent to-gray-800/30"></div>
        
        {/* Animated Stars - Mobile Optimized */}
        {[...Array(typeof window !== 'undefined' && window.innerWidth < 768 ? 30 : 80)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animation: `twinkle ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.8 + 0.2
            }}
          ></div>
        ))}
        
        {/* Mobile-optimized nebulae */}
        <div className="absolute top-1/4 right-1/3 w-24 md:w-32 h-24 md:h-32 bg-gradient-to-r from-white/10 to-gray-500/10 rounded-full blur-2xl md:blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-16 md:w-24 h-16 md:h-24 bg-gradient-to-r from-gray-400/10 to-white/10 rounded-full blur-xl md:blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33% { transform: translateY(-10px) translateX(5px); }
          66% { transform: translateY(5px) translateX(-3px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.8; filter: brightness(1); }
          50% { opacity: 1; filter: brightness(1.2); }
        }
        @keyframes circuit {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes energy-pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(300%) rotate(45deg); }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(100px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes premium-glow {
          0%, 100% { 
            filter: brightness(1.05) drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
          }
          50% { 
            filter: brightness(1.1) drop-shadow(0 0 40px rgba(255, 255, 255, 0.4));
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 1s ease-out forwards;
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-glow {
          animation: premium-glow 4s ease-in-out infinite;
        }
        .animate-energy-pulse {
          animation: energy-pulse 4s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-8 sm:pb-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-10 animate-fadeInUp z-10 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-white/10 to-gray-500/10 backdrop-blur-sm px-3 sm:px-5 py-2 sm:py-3 rounded-full border border-white/20 shadow-2xl shadow-white/10">
              <Sparkles className="text-white" size={16} />
              <span className="bg-gradient-to-r from-white to-gray-300 text-black text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">AI POWERED</span>
              <span className="text-gray-100 text-xs sm:text-sm font-medium">Compassionate Technology</span>
            </div>

            <div className="space-y-4 sm:space-y-8">
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tight">
                Your AI Companion for
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500 animate-glow">
                  Mental Wellness
                </span>
              </h1>
              
              <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-white to-gray-500 rounded-full animate-float"></div>
              
              {/* Subtitle Section */}
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-lg sm:text-2xl md:text-3xl font-medium text-gray-200 tracking-wide">
                  AI Powered Compassion
                </h2>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-lg font-light">
                  Combining advanced artificial intelligence with genuine human empathy to gently support your emotional well-being.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 pt-6 sm:pt-8">
              <button 
                onClick={onNavigateToSignUp}
                className="mobile-button tablet-button desktop-button touch-feedback group bg-gradient-to-r from-white via-gray-200 to-gray-300 text-black font-semibold flex items-center justify-center gap-2 sm:gap-3 hover:shadow-2xl hover:shadow-white/30 transition-all duration-500 transform hover:scale-[1.02] border border-white/20 text-base sm:text-lg focus-ring rounded-2xl w-full sm:w-auto"
              >
                <Zap className="group-hover:rotate-12 transition-transform duration-300" size={20} />
                Start Your Journey
                <ArrowRight className="group-hover:translate-x-1 transition-transform duration-300" size={20} />
              </button>
              
              <button 
                onClick={onNavigateToSignIn}
                className="mobile-button tablet-button desktop-button touch-feedback group bg-white/5 backdrop-blur-sm text-white font-semibold border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 focus-ring rounded-2xl w-full sm:w-auto"
              >
                Talk to Nexa
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </button>
            </div>

            {/* Mental Health Stats - Mobile Optimized */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 sm:pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">24/7</div>
                <div className="text-xs sm:text-sm text-gray-400">Always Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">100K+</div>
                <div className="text-xs sm:text-sm text-gray-400">Lives Supported</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">95%</div>
                <div className="text-xs sm:text-sm text-gray-400">Feel Better</div>
              </div>
            </div>
          </div>

          {/* Right - AI Image - Mobile Optimized */}
          <div className="relative animate-fadeInUp flex items-center justify-center w-full order-1 lg:order-2" style={{ animationDelay: '0.3s' }}>
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-6xl flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[600px]">
              {/* Mobile-optimized Background Effects */}
              <div className="absolute -inset-6 sm:-inset-12 bg-gradient-radial from-white/10 via-white/5 to-transparent blur-xl sm:blur-2xl opacity-75 animate-pulse"></div>
              <div className="absolute -inset-4 sm:-inset-8 bg-gradient-radial from-gray-100/8 via-white/3 to-transparent blur-lg sm:blur-xl opacity-65"></div>
              <div className="absolute -inset-3 sm:-inset-6 bg-gradient-radial from-white/4 via-transparent to-transparent blur-md sm:blur-lg opacity-55 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              
              {/* AI Image Container - Mobile Optimized */}
              <div className="relative w-full h-full flex items-center justify-center scale-110 sm:scale-130 transform hover:scale-105 sm:hover:scale-105 transition-all duration-500 hover:-translate-y-2">
                
                {/* Mobile-optimized Ambient Glow Effects */}
                <div className="absolute -inset-8 sm:-inset-20 bg-gradient-radial from-white/30 via-white/15 to-transparent blur-2xl sm:blur-4xl opacity-80 animate-pulse"></div>
                <div className="absolute -inset-6 sm:-inset-16 bg-gradient-radial from-white/25 via-white/12 to-transparent blur-xl sm:blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute -inset-4 sm:-inset-12 bg-gradient-radial from-white/20 via-white/10 to-transparent blur-lg sm:blur-2xl opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute -inset-2 sm:-inset-8 bg-gradient-radial from-white/15 via-white/8 to-transparent blur-md sm:blur-xl opacity-50 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                
                {/* Mobile-optimized Floating Particles */}
                <div className="absolute -top-2 sm:-top-4 left-1/4 w-2 sm:w-3 h-2 sm:h-3 bg-white/60 rounded-full animate-float opacity-80" style={{ animationDelay: '0s' }}></div>
                <div className="absolute -top-4 sm:-top-8 right-1/3 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 rounded-full animate-float opacity-70" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-1/4 -left-3 sm:-left-6 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/55 rounded-full animate-float opacity-75" style={{ animationDelay: '0.8s' }}></div>
                <div className="absolute top-3/4 -right-2 sm:-right-4 w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/45 rounded-full animate-float opacity-65" style={{ animationDelay: '2.2s' }}></div>
                <div className="absolute -bottom-3 sm:-bottom-6 left-1/3 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/50 rounded-full animate-float opacity-70" style={{ animationDelay: '1.8s' }}></div>
                <div className="absolute bottom-1/4 -right-4 sm:-right-8 w-2.5 sm:w-3 h-2.5 sm:h-3 bg-white/40 rounded-full animate-float opacity-60" style={{ animationDelay: '0.5s' }}></div>
                
                {/* Mobile-optimized Energy Rings */}
                <div className="absolute -inset-3 sm:-inset-6 rounded-full border border-white/20 opacity-40 animate-pulse" style={{ animationDuration: '4s' }}></div>
                <div className="absolute -inset-5 sm:-inset-10 rounded-full border border-white/15 opacity-30 animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
                
                {/* Mobile-optimized Corner Brackets */}
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-l-2 border-white/40 opacity-60 animate-pulse"></div>
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 w-6 sm:w-8 h-6 sm:h-8 border-t-2 border-r-2 border-white/40 opacity-60 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-l-2 border-white/40 opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 w-6 sm:w-8 h-6 sm:h-8 border-b-2 border-r-2 border-white/40 opacity-60 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                
                {/* Main AI Image - Mobile Optimized */}
                <div className="relative w-full h-full group">
                  {/* Mobile-optimized Glowing Border Container */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/40 via-white/25 to-white/40 p-0.5 sm:p-1 animate-pulse opacity-80 group-hover:opacity-95 transition-all duration-500" 
                       style={{ 
                         boxShadow: '0 0 30px rgba(255, 255, 255, 0.6), 0 0 60px rgba(255, 255, 255, 0.4), 0 0 90px rgba(255, 255, 255, 0.2), inset 0 0 20px rgba(255, 255, 255, 0.15)',
                         animationDuration: '2.5s'
                       }}>
                    <div className="w-full h-full rounded-full border border-white/60 bg-black/10 backdrop-blur-sm" 
                         style={{ 
                           boxShadow: 'inset 0 0 30px rgba(255, 255, 255, 0.1), 0 0 40px rgba(255, 255, 255, 0.3)' 
                         }}></div>
                  </div>
                  
                  {/* Mobile-optimized Shadow Layers */}
                  <div className="absolute inset-0 bg-black/20 blur-md sm:blur-xl transform translate-y-3 sm:translate-y-6 translate-x-1 sm:translate-x-2 opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-black/15 blur-lg sm:blur-2xl transform translate-y-4 sm:translate-y-8 translate-x-1.5 sm:translate-x-3 opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-white/10 blur-xl sm:blur-3xl transform translate-y-2 sm:translate-y-4 translate-x-0.5 sm:translate-x-1 opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                  
                  <img 
                    src="/AI Model.png" 
                    alt="AI Technology" 
                    className="relative z-20 w-full h-full object-contain transition-all duration-500 hover:brightness-115 hover:scale-103 rounded-full"
                    style={{
                      filter: 'brightness(1.1) contrast(1.15) saturate(1.1) drop-shadow(0 4px 15px rgba(0, 0, 0, 0.3)) drop-shadow(0 8px 25px rgba(0, 0, 0, 0.2)) drop-shadow(0 0 30px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 60px rgba(255, 255, 255, 0.3))',
                      imageRendering: 'crisp-edges'
                    }}
                  />
                  
                  {/* Mobile-optimized Glow System */}
                  <div className="absolute -inset-4 sm:-inset-10 bg-gradient-radial from-white/20 via-white/10 to-transparent blur-lg sm:blur-3xl opacity-70 group-hover:opacity-90 transition-opacity duration-500"></div>
                  <div className="absolute -inset-3 sm:-inset-8 bg-gradient-radial from-white/15 via-white/8 to-transparent blur-md sm:blur-2xl opacity-60 group-hover:opacity-85 transition-opacity duration-500"></div>
                  <div className="absolute -inset-2 sm:-inset-6 bg-gradient-radial from-white/12 via-white/6 to-transparent blur-sm sm:blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
                  
                  {/* Mobile-optimized Circular Highlight */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-white/6 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500 rounded-full"></div>
                  
                  {/* Mobile-optimized Additional Glow Layers */}
                  <div className="absolute -inset-2 sm:-inset-4 bg-gradient-radial from-white/25 via-white/12 to-transparent blur-md sm:blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-500 animate-pulse" style={{ animationDelay: '0.8s' }}></div>
                  <div className="absolute -inset-1 sm:-inset-2 bg-gradient-radial from-white/20 via-white/10 to-transparent blur-sm sm:blur-md opacity-35 group-hover:opacity-65 transition-opacity duration-500 animate-pulse" style={{ animationDelay: '1.2s' }}></div>
                </div>

              </div>
              

            </div>
          </div>
        </div>
      </div>

      {/* Developers Section - Mobile Optimized */}
      <div className="relative py-16 sm:py-32 px-4 sm:px-6 bg-gradient-to-b from-black/80 via-gray-900/20 to-black/80">
        {/* Simple Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-white/3 rounded-full blur-2xl sm:blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-24 sm:w-48 h-24 sm:h-48 bg-white/2 rounded-full blur-xl sm:blur-2xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-20">
            {/* Simple Header */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 sm:mb-6 animate-fadeInUp">Our Team</h2>
              <div className="w-16 sm:w-24 h-0.5 bg-white mx-auto mb-4 sm:mb-6"></div>
              <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Meet the talented developers behind this AI project
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {developers.map((developer, index) => (
              <div 
                key={developer.id}
                onClick={() => openDeveloperModal(developer)}
                className="mobile-card tablet-card desktop-card touch-feedback group bg-gray-800/30 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 hover:bg-gray-800/40 animate-fadeInUp cursor-pointer hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-white/20 focus-ring" 
                style={{ animationDelay: `${index * 0.1}s` }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openDeveloperModal(developer)}
              >
                <div className="text-center">
                  {/* Photo */}
                  <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full mb-3 sm:mb-4 overflow-hidden border-2 border-white/30 shadow-lg mx-auto group-hover:border-white/50 transition-all duration-300 group-hover:shadow-white/20">
                    <img 
                      src={developer.image} 
                      alt={developer.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {/* Info */}
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-1 group-hover:text-gray-200 transition-colors">{developer.name}</h3>
                  <p className="text-sm text-gray-300 mb-2 group-hover:text-gray-200 transition-colors">{developer.role}</p>
                  <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors line-clamp-2">{developer.shortDesc}</p>
                  
                  {/* Click indicator */}
                  <div className="mt-3 sm:mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-5 sm:w-6 h-5 sm:h-6 bg-white/20 rounded-full mx-auto flex items-center justify-center">
                      <ArrowRight size={10} className="text-white sm:w-3 sm:h-3" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Developer Modal - Mobile Optimized */}
      {selectedDeveloper && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm mobile-modal-z flex items-end sm:items-center justify-center p-2 sm:p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-800/90 via-gray-900/90 to-black/90 backdrop-blur-xl rounded-t-3xl sm:rounded-2xl border border-white/20 w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto smooth-scroll animate-slideUp">
            {/* Modal Header */}
            <div className="relative p-4 sm:p-8 pb-4 sm:pb-6">
              {/* Mobile handle indicator */}
              <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-4 sm:hidden"></div>
              
              <button
                onClick={closeDeveloperModal}
                className="absolute top-4 sm:top-6 right-4 sm:right-6 w-10 h-10 touch-button bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors duration-300 group"
              >
                <X size={20} className="text-white group-hover:text-gray-200" />
              </button>
              
              {/* Developer Photo and Basic Info */}
              <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
                <div className="w-24 sm:w-32 h-24 sm:h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl mb-4 sm:mb-6 animate-pulse">
                  <img 
                    src={selectedDeveloper.image} 
                    alt={selectedDeveloper.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{selectedDeveloper.name}</h2>
                <div className="mb-4">
                  <span className="bg-gradient-to-r from-white/30 to-white/20 text-white px-4 sm:px-6 py-2 rounded-full text-sm font-semibold backdrop-blur-sm border border-white/30">
                    {selectedDeveloper.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-4 sm:px-8 pb-6 sm:pb-8 safe-area-bottom">
              {/* Description */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">About</h3>
                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">{selectedDeveloper.fullDesc}</p>
              </div>

              {/* Skills */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {selectedDeveloper.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-white/10 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-colors duration-300 touch-button"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Get in Touch</h3>
                <div className="space-y-2 sm:space-y-3">
                  <a 
                    href={`mailto:${selectedDeveloper.email}`}
                    className="touch-button flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-300 group"
                  >
                    <Mail size={18} className="text-gray-400 group-hover:text-white flex-shrink-0" />
                    <span className="text-gray-300 group-hover:text-white text-sm sm:text-base truncate">{selectedDeveloper.email}</span>
                  </a>
                  <a 
                    href={`https://${selectedDeveloper.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="touch-button flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-300 group"
                  >
                    <Github size={18} className="text-gray-400 group-hover:text-white flex-shrink-0" />
                    <span className="text-gray-300 group-hover:text-white text-sm sm:text-base truncate">{selectedDeveloper.github}</span>
                  </a>
                  <a 
                    href={`https://${selectedDeveloper.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="touch-button flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-300 group"
                  >
                    <Linkedin size={18} className="text-gray-400 group-hover:text-white flex-shrink-0" />
                    <span className="text-gray-300 group-hover:text-white text-sm sm:text-base truncate">{selectedDeveloper.linkedin}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;