import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/button';

const HeroSection = () => {
return (
<section className="relative min-h-screen flex items-center overflow-hidden">
  {/* Background Gradient with Animation */}
  <div className="absolute inset-0 bg-gradient-primary" />
  
  {/* Animated Mesh Gradient */}
  <div 
    className="absolute inset-0 opacity-50"
    style={{
      background: `
        radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 20%, rgba(99, 102, 241, 0.2) 0%, transparent 50%)
      `,
      animation: 'meshMove 15s ease-in-out infinite'
    }}
  />

  {/* Decorative Glow Elements */}
  <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
  <div className="absolute bottom-40 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" 
       style={{ animation: 'glowPulse 4s ease-in-out infinite' }} />

  {/* Content */}
  <div className="relative z-10 container-custom pt-28 sm:pt-32 pb-32 sm:pb-40">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      
      {/* Left Side - Text Content */}
      <div className="text-center lg:text-left order-2 lg:order-1">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Exchange Skills,
          <br />
          Build Expertise,
          <br />
          <span className="text-purple-200">Grow Together.</span>
        </h1>

        <div className="space-y-3 mb-6 text-left">
          <div className="flex items-start space-x-3">
            <span className="text-xl">🤝</span>
            <p className="text-white/90 text-sm sm:text-base">
              <span className="font-semibold">Peer-to-Peer Skill Exchange</span>
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-xl">🌐</span>
            <p className="text-white/90 text-sm sm:text-base">
              <span className="font-semibold">Community-Driven Learning</span>
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="text-xl">💸</span>
            <p className="text-white/90 text-sm sm:text-base">
              <span className="font-semibold">Zero Monetary Dependency</span>
            </p>
          </div>
        </div>

        <p className="text-sm sm:text-base text-white/80 max-w-xl mb-8 leading-relaxed">
          SwapNova enables verified users to exchange skills through intelligent matching, supporting secure and structured learning experiences both online and in person.
        </p> 
        
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
          <Link to="/signup">
            <Button variant="secondary" size="lg" className="min-w-[160px]">
              Get Started
            </Button>
          </Link>
          <Link to="/signin">
            <Button variant="outline" size="lg" className="min-w-[160px]">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      {/* Right Side - Simple Exchange Visual */}
      <div className="flex justify-center items-center order-1 lg:order-2 mb-8 lg:mb-0">
        <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg h-96 sm:h-[500px] flex items-center justify-center">
          
          {/* Floating Particles */}
          <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-white rounded-full opacity-0" 
               style={{ animation: 'particleFloat 3s ease-in-out infinite' }} />
          <div className="absolute top-3/5 right-1/4 w-2 h-2 bg-white rounded-full opacity-0" 
               style={{ animation: 'particleFloat 3s ease-in-out infinite 1s' }} />
          <div className="absolute bottom-1/3 left-2/5 w-2 h-2 bg-white rounded-full opacity-0" 
               style={{ animation: 'particleFloat 3s ease-in-out infinite 2s' }} />

          {/* Left side - Skill Box */}
          <div 
            className="absolute left-4 top-1/2 -translate-y-1/2 w-28 h-28 bg-white/90 backdrop-blur rounded-2xl shadow-2xl flex flex-col items-center justify-center"
            style={{ animation: 'slideRight 3s ease-in-out infinite' }}
          >
            <span className="text-5xl mb-2">💻</span>
            <span className="text-xs font-bold text-gray-700">CODING</span>
          </div>

          {/* Right side - Skill Box */}
          <div 
            className="absolute right-4 top-1/2 -translate-y-1/2 w-28 h-28 bg-white/90 backdrop-blur rounded-2xl shadow-2xl flex flex-col items-center justify-center"
            style={{ animation: 'slideLeft 3s ease-in-out infinite' }}
          >
            <span className="text-5xl mb-2">🎨</span>
            <span className="text-xs font-bold text-gray-700">DESIGN</span>
          </div>

          {/* Center - Swap Icon */}
           <div className="absolute top-1/2 left-1/2.5 -translate-x-1/2 -mt-10 w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl z-10"
     style={{ animation: 'hubPulse 2s ease-in-out infinite' }}>
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>

          {/* Connecting line - horizontal */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

         

        </div>
      </div>
    </div>
  </div>

  {/* Bottom Wave */}
  <div className="absolute bottom-0 left-0 right-0">
    <svg viewBox="0 0 1440 150" fill="none" xmlns="http://www.w3.org/2000/svg" 
         className="w-full h-auto" preserveAspectRatio="none">
      <path d="M0 150L60 135C120 120 240 90 360 75C480 60 600 60 720 67.5C840 75 960 90 1080 97.5C1200 105 1320 105 1380 105L1440 105V150H1380C1320 150 1200 150 1080 150C960 150 840 150 720 150C600 150 480 150 360 150C240 150 120 150 60 150H0Z"
            fill="white" />
    </svg>
  </div>

  {/* CSS Animations */}
  <style jsx>{`
    @keyframes meshMove {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.1); }
    }

    @keyframes glowPulse {
      0%, 100% { opacity: 0.2; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.2); }
    }

    @keyframes hubPulse {
      0%, 100% { transform: scale(1); box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
      50% { transform: scale(1.05); box-shadow: 0 25px 80px rgba(0,0,0,0.3); }
    }

    @keyframes slideRight {
      0%, 100% {
        transform: translateY(-50%) translateX(0);
      }
      50% {
        transform: translateY(-50%) translateX(20px);
      }
    }

    @keyframes slideLeft {
      0%, 100% {
        transform: translateY(-50%) translateX(0);
      }
      50% {
        transform: translateY(-50%) translateX(-20px);
      }
    }

    @keyframes particleFloat {
      0% { opacity: 0; transform: translate(0, 0) scale(0); }
      50% { opacity: 0.8; transform: translate(50px, -50px) scale(1); }
      100% { opacity: 0; transform: translate(100px, -100px) scale(0); }
    }
  `}</style>
</section>
);
};

export default HeroSection;