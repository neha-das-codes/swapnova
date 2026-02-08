import React from 'react';
import HeroSection from '../components/home/herosection';
import HowItWorks from '../components/home/howitworks';
import CTASection from '../components/home/ctasection';

const Home = () => {
  return (
    <main>
      <HeroSection />
      <HowItWorks />
      <CTASection />
    </main>
  );
};

export default Home;