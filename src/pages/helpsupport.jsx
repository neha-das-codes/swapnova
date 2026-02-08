import React from 'react';
import { useNavigate } from 'react-router-dom';

const HelpSupport = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-card p-8 md:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Help & Support</h1>
          <p className="text-gray-600 mb-8">Find answers to common questions and get help</p>

          <div className="space-y-8">
            {/* FAQ Section */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How does SwapNova work?</h3>
                  <p className="text-gray-700">SwapNova connects users who want to exchange skills. You list skills you can offer and skills you want to learn. Our AI matches you with compatible partners based on skills, location, and availability.</p>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Is SwapNova free to use?</h3>
                  <p className="text-gray-700">Yes! SwapNova is completely free. We believe in skill-for-skill exchange without monetary transactions.</p>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I find matches?</h3>
                  <p className="text-gray-700">After completing your profile, visit the "Find Matches" page. Our AI will suggest the best matches based on your skills and preferences. You can then view profiles and connect with users.</p>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What are credits and how do I earn them?</h3>
                  <p className="text-gray-700">Credits are earned by completing skill exchanges. Both users mark the exchange as complete, and you receive credits. Credits help build your credibility on the platform.</p>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I exchange skills online or offline?</h3>
                  <p className="text-gray-700">Both! When setting up your profile, choose your preferred exchange mode: Online, Offline, or Both. The matching algorithm will connect you with users who match your preference.</p>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">How do I report inappropriate behavior?</h3>
                  <p className="text-gray-700">Click the report button on any user's profile, or email us at support@swapnova.com. All reports are reviewed promptly and kept confidential.</p>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I delete my account?</h3>
                  <p className="text-gray-700">Yes. Go to My Profile → Account Settings and select "Delete Account". This will permanently remove your data from our platform.</p>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What if my exchange partner doesn't show up?</h3>
                  <p className="text-gray-700">If someone doesn't honor their commitment, you can report them through their profile. We take reliability seriously and may take action against repeat offenders.</p>
                </div>
              </div>
            </section>

            {/* Contact Section */}
            <section className="bg-primary-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Still need help?</h2>
              <p className="text-gray-700 mb-4">Can't find the answer you're looking for? Our support team is here to help!</p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Email</p>
                    <a href="mailto:support@swapnova.com" className="text-primary-600 hover:underline">
                      support@swapnova.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-gray-900">Response Time</p>
                    <p className="text-gray-700">We typically respond within 24 hours</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;
