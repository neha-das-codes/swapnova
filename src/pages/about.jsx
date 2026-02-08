import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  const features = [
    {
      id: 1,
      icon: '🤖',
      title: 'AI-Powered Matching',
      description: 'Our intelligent matching system finds the perfect skill exchange partners based on your needs and offerings.',
      bgClass: 'bg-purple-100',
    },
    {
      id: 2,
      icon: '🔒',
      title: 'Verified & Secure Platform',
      description: 'Phone OTP verification ensures genuine users. Rate and review mechanism builds trust within the community.',
      bgClass: 'bg-blue-100',
    },
    {
      id: 3,
      icon: '🌐',
      title: 'Online & Offline',
      description: 'Users can choose to exchange skills via virtual meetings or meet locally in-person. Flexibility that fits your lifestyle.',
      bgClass: 'bg-green-100',
    },
    {
      id: 4,
      icon: '⭐',
      title: 'Credit-Based Exchange',
      description: 'Skill exchanges are tracked using a credit system to ensure fairness and balance between teaching and learning activities.',
      bgClass: 'bg-yellow-100',
    },
    {
      id: 5,
      icon: '💬',
      title: 'Real-Time Chat',
      description: 'Integrated chat functionality allows users to coordinate sessions and maintain seamless communication throughout the exchange.',
      bgClass: 'bg-cyan-100',
    },
  ];

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-primary py-16 sm:py-20">
        <div className="container-custom text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            About SwapNova
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto font-medium">
            Empowering Skill Exchange Through Technology
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed mb-4">
              SwapNova was created with a simple belief: knowledge should be accessible to everyone. 
              We connect users who want to learn with those who want to teach, creating a 
              community-driven platform where skills are exchanged freely.
            </p>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Whether you want to learn guitar and can teach coding, or you're great at photography 
              and want to learn a new language — SwapNova makes it possible without any money changing hands.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="gradient-text">SwapNova</span>?
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Everything you need to exchange skills effectively and safely
            </p>
          </div>

          <div className="flex flex-col items-center">
            {/* Top Row - 3 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 w-full mb-6 sm:mb-8">
              {features.slice(0, 3).map((feature) => (
                <div
                  key={feature.id}
                  className="card p-6 sm:p-8 text-center group hover:-translate-y-2 transition-all duration-300"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 ${feature.bgClass} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl sm:text-4xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom Row - 2 cards centered */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-3xl">
              {features.slice(3, 5).map((feature) => (
                <div
                  key={feature.id}
                  className="card p-6 sm:p-8 text-center group hover:-translate-y-2 transition-all duration-300"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 ${feature.bgClass} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl sm:text-4xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SINGLE FOOTER - Direct Gmail Link */}
      <footer className="bg-gray-900 text-white">
        <div className="container-custom py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            
            {/* Left Section - Brand */}
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-3">SwapNova</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Exchange Skills, Build Expertise, Grow Together.
              </p>
            </div>

            {/* Middle Section - Support & Policies */}
            <div className="text-center">
              <h4 className="text-base font-semibold text-white mb-4">Support & Policies</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/guidelines" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Community Guidelines
                  </Link>
                </li>
                <li>
                  <Link to="/help" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Help & Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Right Section - Contact with Direct Gmail Link */}
            <div className="text-center md:text-right">
              <h4 className="text-base font-semibold text-white mb-4">Contact</h4>
              <a 
                href="https://mail.google.com/mail/?view=cm&fs=1&to=support@swapnova.com&su=SwapNova Support Request"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors text-sm inline-block"
              >
                support@swapnova.com
              </a>
              <p className="text-gray-500 text-xs mt-2"></p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-800 mt-10 pt-8">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} SwapNova. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default About;