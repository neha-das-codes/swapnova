import React from 'react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: January 2026</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using SwapNova, you accept and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. User Eligibility</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be at least 18 years old to use SwapNova</li>
                <li>You must provide accurate and truthful information</li>
                <li>You are responsible for maintaining the security of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Platform Usage</h2>
              <p className="mb-3">SwapNova is a skill exchange platform where users can:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>List skills they can offer and skills they want to learn</li>
                <li>Connect with matched users for skill exchanges</li>
                <li>Communicate through our messaging system</li>
                <li>Provide feedback after exchanges</li>
              </ul>
              <p className="mt-3"><strong>No monetary transactions should occur on SwapNova.</strong> This is a skill-for-skill exchange platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. User Conduct</h2>
              <p className="mb-3">You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Harass, abuse, or harm other users</li>
                <li>Post false or misleading information</li>
                <li>Use the platform for commercial purposes</li>
                <li>Share inappropriate or offensive content</li>
                <li>Attempt to hack or disrupt the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Credits and Wallet System</h2>
              <p>Users earn credits by completing skill exchanges. Credits have no monetary value and cannot be transferred or redeemed for cash. SwapNova reserves the right to adjust credit balances if misuse is detected.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Content Ownership</h2>
              <p>You retain ownership of the content you post. By posting, you grant SwapNova a license to use, display, and distribute your content on the platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Termination</h2>
              <p>SwapNova reserves the right to suspend or terminate accounts that violate these terms or engage in harmful behavior.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Disclaimer</h2>
              <p>SwapNova is a platform that facilitates connections. We are not responsible for the quality of skill exchanges, user interactions, or any disputes between users.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to Terms</h2>
              <p>We may update these terms periodically. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
              <p>For questions about these terms, contact us at:</p>
              <p className="mt-2">
                <a href="mailto:support@swapnova.com" className="text-primary-600 hover:underline">
                  support@swapnova.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;