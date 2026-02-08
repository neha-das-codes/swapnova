import React from 'react';
import { useNavigate } from 'react-router-dom';

const Community = () => {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Community Guidelines</h1>
          <p className="text-sm text-gray-500 mb-8">Building a safe and respectful community</p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h2>
              <p>SwapNova is built on the principles of mutual respect, collaborative learning, and skill sharing. These guidelines help maintain a positive environment for everyone.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">✅ Do's</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Be Respectful:</strong> Treat everyone with kindness and respect, regardless of their skill level</li>
                <li><strong>Be Honest:</strong> Accurately represent your skills and availability</li>
                <li><strong>Be Reliable:</strong> Honor your commitments and show up for scheduled exchanges</li>
                <li><strong>Be Patient:</strong> Everyone learns at their own pace</li>
                <li><strong>Communicate Clearly:</strong> Set expectations and provide constructive feedback</li>
                <li><strong>Report Issues:</strong> Flag inappropriate behavior to help keep the community safe</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">❌ Don'ts</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>No Harassment:</strong> Any form of bullying, discrimination, or hate speech is strictly prohibited</li>
                <li><strong>No Spam:</strong> Don't send unsolicited promotional content or excessive messages</li>
                <li><strong>No Monetary Exchange:</strong> SwapNova is for skill-for-skill trading only, not for paid services</li>
                <li><strong>No False Information:</strong> Don't misrepresent your skills or identity</li>
                <li><strong>No Inappropriate Content:</strong> Keep all content professional and appropriate</li>
                <li><strong>No Ghosting:</strong> Communicate if you need to cancel or reschedule</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Safety Tips</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>For offline meetings, choose public locations</li>
                <li>Don't share sensitive personal information too quickly</li>
                <li>Trust your instincts - if something feels wrong, report it</li>
                <li>Keep all communications within the platform initially</li>
                <li>Verify skills through conversation before committing to an exchange</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Consequences of Violations</h2>
              <p>Violations of these guidelines may result in:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Warning and account review</li>
                <li>Temporary suspension</li>
                <li>Permanent account termination</li>
                <li>Reporting to authorities for serious violations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Reporting</h2>
              <p>If you encounter behavior that violates these guidelines, please report it immediately through:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>The report button on user profiles</li>
                <li>Our contact email: <a href="mailto:support@swapnova.com" className="text-primary-600 hover:underline">support@swapnova.com</a></li>
              </ul>
              <p className="mt-3">All reports are reviewed confidentially and promptly.</p>
            </section>

            <section className="bg-primary-50 p-6 rounded-lg mt-8">
              <p className="text-center text-primary-800 font-semibold">
                Together, we can build a community where everyone feels safe to learn and share skills!
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;