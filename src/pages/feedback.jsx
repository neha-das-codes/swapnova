import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { ref, get, update, push } from 'firebase/database';
import { database } from '../firebase/config';
import { sendFeedbackThankYouEmail, sendReportAcknowledgmentEmail, sendFeedbackToAdmin, sendReportToAdmin } from '../services/emailservice';

const Feedback = () => {
  const navigate = useNavigate();
  const { exchangeId } = useParams();
  const { currentUser, userData } = useAuth();
  
  // Feedback Form State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  
  // Report Form State
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  
  // Other user info
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExchangeData = async () => {
      try {
        const exchangeRef = ref(database, `exchanges/${exchangeId}`);
        const snapshot = await get(exchangeRef);
        
        if (snapshot.exists()) {
          const exchange = snapshot.val();
          
          // Check if already submitted feedback
          if (exchange[`feedback_${currentUser.uid}`]) {
            setFeedbackSubmitted(true);
          }
          
          // Get other user
          const otherUserId = exchange.users?.find(id => id !== currentUser.uid);
          if (otherUserId) {
            const userRef = ref(database, `users/${otherUserId}`);
            const userSnapshot = await get(userRef);
            if (userSnapshot.exists()) {
              setOtherUser({ uid: otherUserId, ...userSnapshot.val() });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching exchange:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && exchangeId) {
      fetchExchangeData();
    }
  }, [currentUser, exchangeId]);

  // ✅ FIXED: Submit Feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setFeedbackSubmitting(true);

    try {
      // ✅ 1. Save feedback to exchange (in Firebase)
      await update(ref(database, `exchanges/${exchangeId}`), {
        [`feedback_${currentUser.uid}`]: {
          rating,
          feedback: feedbackText,
          timestamp: Date.now()
        }
      });

      // ✅ 2. Save to feedback collection (for admin dashboard)
      const feedbackData = {
        fromUserId: currentUser.uid,
        fromUserName: userData.fullName,
        toUserId: otherUser.uid,
        toUserName: otherUser.fullName,
        exchangeId: exchangeId,
        rating: rating,
        comment: feedbackText,
        timestamp: Date.now()
      };
      
      const feedbackRef = ref(database, 'feedback');
      await push(feedbackRef, feedbackData);

      // ✅ 3. Update other user's rating
      if (otherUser) {
        const userRef = ref(database, `users/${otherUser.uid}`);
        const userSnapshot = await get(userRef);
        
        if (userSnapshot.exists()) {
          const user = userSnapshot.val();
          const currentRating = user.rating || 0;
          const totalRatings = user.totalRatings || 0;
          
          const newTotalRatings = totalRatings + 1;
          const newRating = ((currentRating * totalRatings) + rating) / newTotalRatings;
          
          await update(ref(database, `users/${otherUser.uid}`), {
            rating: newRating,
            totalRatings: newTotalRatings
          });
        }
      }

      // ✅ 4. Send thank you email to user
      if (userData?.email) {
        await sendFeedbackThankYouEmail(userData, otherUser.fullName);
        console.log('✅ Thank you email sent to user');
      }

      // ✅ 5. Send notification email to admin
      await sendFeedbackToAdmin(userData, otherUser.fullName, { rating, feedback: feedbackText });
      console.log('✅ Feedback notification sent to admin');

      setFeedbackSubmitted(true);
      alert('✅ Feedback submitted successfully!');
    } catch (error) {
      console.error('❌ Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  // ✅ FIXED: Submit Report
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason) {
      alert('Please select a reason');
      return;
    }

    setReportSubmitting(true);

    try {
      // ✅ 1. Save report to database
      const reportData = {
        reportedBy: currentUser.uid,
        reportedByName: userData.fullName,
        reportedUser: otherUser?.uid,
        reportedUserName: otherUser?.fullName,
        exchangeId: exchangeId,
        reason: reportReason,
        description: reportDescription,
        status: 'pending',
        timestamp: Date.now()
      };

      const reportsRef = ref(database, 'reports');
      await push(reportsRef, reportData);

      // ✅ 2. Send acknowledgment email to user
      if (userData?.email) {
        await sendReportAcknowledgmentEmail(userData, reportReason);
        console.log('✅ Acknowledgment email sent to user');
      }

      // ✅ 3. Send alert email to admin
      await sendReportToAdmin(userData, otherUser, { reason: reportReason, description: reportDescription });
      console.log('✅ Report alert sent to admin');

      setReportSubmitted(true);
      alert('✅ Report submitted successfully! Our team will review it.');
    } catch (error) {
      console.error('❌ Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="container-custom max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>

        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Feedback & Reports
        </h1>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Feedback Form */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              ⭐ Feedback Form
            </h2>
            
            {feedbackSubmitted ? (
              <div className="text-center py-8">
                <span className="text-5xl block mb-4">✅</span>
                <h3 className="text-lg font-semibold text-green-600 mb-2">Thank You!</h3>
                <p className="text-gray-500">Your feedback has been submitted successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit}>
                {/* Who are you rating */}
                {otherUser && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Rating exchange with:</p>
                    <p className="font-semibold text-gray-800">{otherUser.fullName}</p>
                  </div>
                )}

                {/* Star Rating */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Rate your experience *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-3xl transition-transform hover:scale-110"
                      >
                        {star <= (hoverRating || rating) ? '⭐' : '☆'}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </p>
                </div>

                {/* Feedback Text */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share your experience (optional)
                  </label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="What went well? What could be improved?"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={feedbackSubmitting || rating === 0}
                  className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>

          {/* RIGHT: Report Issue Form */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🚨 Report Issue
            </h2>
            
            {reportSubmitted ? (
              <div className="text-center py-8">
                <span className="text-5xl block mb-4">📨</span>
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Report Submitted</h3>
                <p className="text-gray-500">We'll look into this issue and take appropriate action.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit}>
                {/* Who are you reporting */}
                {otherUser && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-500">Reporting user:</p>
                    <p className="font-semibold text-gray-800">{otherUser.fullName}</p>
                  </div>
                )}

                {/* Report Reason */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for report *
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a reason</option>
                    <option value="no_show">Did not show up</option>
                    <option value="inappropriate">Inappropriate behavior</option>
                    <option value="spam">Spam or fake profile</option>
                    <option value="harassment">Harassment</option>
                    <option value="poor_quality">Poor quality exchange</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe the issue (optional)
                  </label>
                  <textarea
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Please provide more details about the issue..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={reportSubmitting || !reportReason}
                  className="w-full py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {reportSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;