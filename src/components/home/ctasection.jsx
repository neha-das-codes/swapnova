import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/button';

const CTASection = () => {
  return (
    <section className="relative py-20 sm:py-24 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-primary" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 container-custom text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-10">
            Join thousands of learners exchanging skills and growing together.
          </p>
          <Link to="/signup">
            <Button variant="secondary" size="lg" className="min-w-[220px]">
              Join SwapNova Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;