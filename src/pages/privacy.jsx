import React from 'react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: January 2026</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
              <p className="mb-3">When you use SwapNova, we collect the following information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (name, email, phone number)</li>
                <li>Profile details (skills offered, skills needed, location, availability)</li>
                <li>Messages and communications with other users</li>
                <li>Feedback and ratings</li>
                <li>Usage data and activity logs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p className="mb-3">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Match you with suitable skill exchange partners</li>
                <li>Facilitate communication between users</li>
                <li>Improve our AI matching algorithm</li>
                <li>Send notifications about your exchanges and matches</li>
                <li>Ensure platform safety and prevent misuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Information Sharing</h2>
              <p className="mb-3">We share your information only in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>With other users when you connect for skill exchanges</li>
                <li>When required by law or legal process</li>
                <li>To protect the rights and safety of SwapNova and its users</li>
              </ul>
              <p className="mt-3"><strong>We never sell your personal information to third parties.</strong></p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Security</h2>
              <p>We implement industry-standard security measures including Firebase Authentication, encrypted connections, and secure data storage to protect your information.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights</h2>
              <p className="mb-3">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of non-essential notifications</li>
                <li>Request a copy of your data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, contact us at:</p>
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

export default Privacy;