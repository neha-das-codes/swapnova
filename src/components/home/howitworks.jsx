import React from 'react';
import { HOW_IT_WORKS_STEPS } from '../../utils/constants';

const StepCard = ({ step, title, description, isLast }) => {
  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Step Number */}
      <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow mb-4 sm:mb-6">
        <span className="text-2xl sm:text-3xl font-bold text-white">{step}</span>
      </div>

      {/* Connector Line - Desktop Only */}
      {!isLast && (
        <div className="hidden lg:block absolute top-8 sm:top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary-400 to-primary-200" />
      )}

      {/* Content */}
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
        {title}
      </h3>
      <p className="text-gray-600 text-sm sm:text-base max-w-xs leading-relaxed">
        {description}
      </p>
    </div>
  );
};

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="section-padding bg-gray-50">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Get started in just four simple steps
          </p>
        </div>

        {/* Steps - Vertical on mobile, Horizontal on desktop */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-8">
          {HOW_IT_WORKS_STEPS.map((stepData, index) => (
            <StepCard
              key={stepData.step}
              step={stepData.step}
              title={stepData.title}
              description={stepData.description}
              isLast={index === HOW_IT_WORKS_STEPS.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;