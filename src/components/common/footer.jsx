import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Left Side - Support & Policies */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support & Policies</h3>
            <div className="space-y-2">
              <Link to="/privacy" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/guidelines" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Community Guidelines
              </Link>
              <Link to="/help" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Help & Support
              </Link>
            </div>
          </div>

          {/* Right Side - Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=support@swapnova.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-gray-400 hover:text-white text-sm transition-colors"
            >
              (Open in Gmail)
            </a>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-gray-500 text-sm">
            © {currentYear} SwapNova. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;