import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { updateUserData } from '../firebase/auth';
import { ref, get, onValue } from 'firebase/database';
import { database } from '../firebase/config';

const SKILL_SUGGESTIONS = [
  'Web Development', 'Python', 'JavaScript', 'React', 'Node.js',
  'Graphic Design', 'UI/UX Design', 'Photoshop', 'Illustrator', 'Figma',
  'Video Editing', 'Photography', 'Content Writing', 'Copywriting', 'SEO',
  'Digital Marketing', 'Social Media', 'Data Analysis', 'Excel', 'SQL',
  'Machine Learning', 'AI', 'Mobile Development', 'Flutter', 'Android',
  'Music Production', 'Guitar', 'Piano', 'Singing', 'Dance',
  'Language Teaching', 'English', 'Hindi', 'Spanish', 'French',
  'Cooking', 'Fitness Training', 'Yoga', 'Public Speaking', 'Communication'
];

const MyProfile = () => {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [newSkillOffer, setNewSkillOffer] = useState('');
  const [newSkillNeed, setNewSkillNeed] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showOfferSuggestions, setShowOfferSuggestions] = useState(false);
  const [showNeedSuggestions, setShowNeedSuggestions] = useState(false);
  
  // Dynamic stats
  const [walletCredits, setWalletCredits] = useState(10);
  const [totalMatches, setTotalMatches] = useState(0);
  const [completedExchanges, setCompletedExchanges] = useState(0);
  const [starRating, setStarRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  // Fetch dynamic stats from Firebase
  useEffect(() => {
    if (!currentUser) return;

    // Listen to wallet changes
    const walletRef = ref(database, `users/${currentUser.uid}/wallet`);
    const walletUnsubscribe = onValue(walletRef, (snapshot) => {
      setWalletCredits(snapshot.exists() ? snapshot.val() : 10);
    });

    // Listen to rating changes
    const ratingRef = ref(database, `users/${currentUser.uid}/rating`);
    const ratingUnsubscribe = onValue(ratingRef, (snapshot) => {
      setStarRating(snapshot.exists() ? snapshot.val() : 0);
    });

    const totalRatingsRef = ref(database, `users/${currentUser.uid}/totalRatings`);
    const totalRatingsUnsubscribe = onValue(totalRatingsRef, (snapshot) => {
      setTotalRatings(snapshot.exists() ? snapshot.val() : 0);
    });

// Fetch connections count
    const fetchStats = async () => {
      try {
        console.log('📊 Fetching stats for UID:', currentUser.uid);
        
        // Count connections/matches
        const connectionsRef = ref(database, 'conversations');
        const connectionsSnap = await get(connectionsRef);
        
        if (connectionsSnap.exists()) {
          const allConversations = connectionsSnap.val();
          let userConnections = 0;
          Object.entries(allConversations).forEach(([key, conv]) => {
            if (key.includes(currentUser.uid)) {
              userConnections++;
            }
          });
          console.log('✅ Found', userConnections, 'connections');
          setTotalMatches(userConnections);
        } else {
          console.log('ℹ️ No conversations found');
          setTotalMatches(0);
        }

         // Count completed exchanges
const exchangesRef = ref(database, 'exchanges');
const exchangesSnap = await get(exchangesRef);
if (exchangesSnap.exists()) {
  const exchanges = exchangesSnap.val();
  let completed = 0;
  
  Object.entries(exchanges).forEach(([chatId, exchange]) => {
    // ✅ FIXED: Check if user is in the chatId (format: uid1_uid2)
    // OR check if user is in users array (if it exists)
    const isUserInExchange = chatId.includes(currentUser.uid) || 
                             exchange.users?.includes(currentUser.uid);
    
    if (isUserInExchange && exchange.fullyCompleted === true) {
      completed++;
    }
  });
  
  console.log('✅ Found', completed, 'completed exchanges');
  setCompletedExchanges(completed);
} else {
  console.log('ℹ️ No exchanges found');
  setCompletedExchanges(0);
} 
        
      } catch (error) {
        console.error('❌ Error fetching stats:', error);
        console.error('❌ Error details:', error.message);
        // Use defaults on error
        setTotalMatches(0);
        setCompletedExchanges(0);
      }
    };

    fetchStats();

    return () => {
      walletUnsubscribe();
      ratingUnsubscribe();
      totalRatingsUnsubscribe();
    };
  }, [currentUser]);

  const startEditing = () => {
    setEditData({
      fullName: userData?.fullName || '',
      bio: userData?.bio || '',
      location: userData?.location || { city: '', area: '' },
      skillsOffered: userData?.skillsOffered || [],
      skillsNeeded: userData?.skillsNeeded || [],
      exchangeMode: userData?.exchangeMode || '',
      availability: userData?.availability || { days: [], time: [] },
      socialLinks: userData?.socialLinks || {}
    });
    setIsEditing(true);
  };

  const calculateCompletion = () => {
    if (!userData) return 0;
    let completed = 0;
    const requiredFields = 6;
    
    if (userData.fullName) completed++;
    if (userData.location?.city && userData.location?.area) completed++;
    if (userData.skillsOffered?.length > 0) completed++;
    if (userData.skillsNeeded?.length > 0) completed++;
    if (userData.exchangeMode) completed++;
    if (userData.availability?.days?.length > 0) completed++;
    
    let percentage = Math.round((completed / requiredFields) * 86);
    
    // Optional fields add remaining 14%
    if (userData.bio && userData.bio.trim() !== '') percentage += 7;
    if (userData.socialLinks && Object.values(userData.socialLinks).some(v => v && v.trim() !== '')) percentage += 7;
    
    return Math.min(percentage, 100);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const addSkillOffer = () => {
    if (newSkillOffer.trim() && !editData.skillsOffered.includes(newSkillOffer.trim())) {
      setEditData({
        ...editData,
        skillsOffered: [...editData.skillsOffered, newSkillOffer.trim()]
      });
      setNewSkillOffer('');
    }
  };

  const addSkillNeed = () => {
    if (newSkillNeed.trim() && !editData.skillsNeeded.includes(newSkillNeed.trim())) {
      setEditData({
        ...editData,
        skillsNeeded: [...editData.skillsNeeded, newSkillNeed.trim()]
      });
      setNewSkillNeed('');
    }
  };

  const removeSkillOffer = (skill) => {
    setEditData({
      ...editData,
      skillsOffered: editData.skillsOffered.filter(s => s !== skill)
    });
  };

  const removeSkillNeed = (skill) => {
    setEditData({
      ...editData,
      skillsNeeded: editData.skillsNeeded.filter(s => s !== skill)
    });
  };

  const saveChanges = async () => {
    setIsLoading(true);
    const result = await updateUserData(currentUser.uid, editData);
    setIsLoading(false);
    
    if (result.success) {
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Error updating profile. Please try again.');
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData(null);
  };

  const completion = calculateCompletion();

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="text-yellow-500">★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-500">★</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);
      }
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="container-custom max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Success Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${
            message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-3xl">
              {getInitials(userData?.fullName)}
            </div>
            
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-between gap-4 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{userData?.fullName}</h1>
                {!isEditing && (
                  <button
                    onClick={startEditing}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center gap-2"
                  >
                    <span>✏️</span> Edit Profile
                  </button>
                )}
              </div>
              
              <p className="text-gray-500 mt-1 flex items-center justify-center sm:justify-start gap-1">
                📍 {userData?.location?.city}, {userData?.location?.area}
              </p>
                {/* Star Rating Display - ONLY show if rating > 0 */}
{starRating > 0 ? (
  <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
    <div className="flex text-lg">{renderStars(starRating)}</div>
    <span className="text-sm text-gray-600">
      {starRating.toFixed(1)} ({totalRatings} review{totalRatings !== 1 ? 's' : ''})
    </span>
  </div>
) : (
  <div className="mt-2 flex items-center justify-center sm:justify-start gap-2">
    <span className="text-sm text-gray-400">No reviews yet</span>
  </div>
)}
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded-full text-sm">
                Profile {completion}% Complete {completion === 100 && '✓'}
              </div>

              {userData?.bio && (
                <p className="mt-4 text-gray-600">{userData.bio}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
  {/* Total Matches Card */}
  <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
    <h3 className="text-3xl font-bold text-gray-900">{totalMatches}</h3>
    <p className="text-sm text-gray-600 mt-1">Total Matches</p>
  </div>
  
  {/* Completed Exchanges Card */}
  <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
    <h3 className="text-3xl font-bold text-gray-900">{completedExchanges}</h3>
    <p className="text-sm text-gray-600 mt-1">Completed Exchanges</p>
  </div>
</div>

        {/* Digital Wallet - Dynamic */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">💳 Digital Wallet</h3>
              <p className="text-white/80 text-sm">Your skill exchange credits</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{walletCredits}</p>
              <p className="text-white/80 text-sm">Credits</p>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          {/* Skills I Offer */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                ✅ Skills I Can Offer
              </h3>
              {isEditing && (
                <div className="flex gap-2 relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={newSkillOffer}
                      onChange={(e) => {
                        setNewSkillOffer(e.target.value);
                        setShowOfferSuggestions(true);
                      }}
                      onFocus={() => setShowOfferSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowOfferSuggestions(false), 200)}
                      onKeyDown={(e) => e.key === 'Enter' && addSkillOffer()}
                      placeholder="Add skill"
                      className="px-3 py-1.5 border rounded-lg text-sm w-40"
                    />
                    {showOfferSuggestions && newSkillOffer && (
                      <div className="absolute z-20 w-48 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                        {SKILL_SUGGESTIONS.filter(
                          skill => skill.toLowerCase().includes(newSkillOffer.toLowerCase()) &&
                          !editData?.skillsOffered?.includes(skill)
                        ).slice(0, 5).map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => {
                              setEditData({
                                ...editData,
                                skillsOffered: [...(editData?.skillsOffered || []), skill]
                              });
                              setNewSkillOffer('');
                              setShowOfferSuggestions(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-green-50 text-sm"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={addSkillOffer}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium"
                  >
                    + Add
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(isEditing ? editData?.skillsOffered : userData?.skillsOffered)?.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm"
                >
                  {skill}
                  {isEditing && (
                    <button onClick={() => removeSkillOffer(skill)} className="ml-1 hover:text-green-900">×</button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Skills I Need */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                🎯 Skills I'm Looking For
              </h3>
              {isEditing && (
                <div className="flex gap-2 relative">
                  <div className="relative">
                    <input
                      type="text"
                      value={newSkillNeed}
                      onChange={(e) => {
                        setNewSkillNeed(e.target.value);
                        setShowNeedSuggestions(true);
                      }}
                      onFocus={() => setShowNeedSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowNeedSuggestions(false), 200)}
                      onKeyDown={(e) => e.key === 'Enter' && addSkillNeed()}
                      placeholder="Add skill"
                      className="px-3 py-1.5 border rounded-lg text-sm w-40"
                    />
                    {showNeedSuggestions && newSkillNeed && (
                      <div className="absolute z-20 w-48 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-32 overflow-y-auto">
                        {SKILL_SUGGESTIONS.filter(
                          skill => skill.toLowerCase().includes(newSkillNeed.toLowerCase()) &&
                          !editData?.skillsNeeded?.includes(skill)
                        ).slice(0, 5).map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => {
                              setEditData({
                                ...editData,
                                skillsNeeded: [...(editData?.skillsNeeded || []), skill]
                              });
                              setNewSkillNeed('');
                              setShowNeedSuggestions(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-blue-50 text-sm"
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={addSkillNeed}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium"
                  >
                    + Add
                  </button>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {(isEditing ? editData?.skillsNeeded : userData?.skillsNeeded)?.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm"
                >
                  {skill}
                  {isEditing && (
                    <button onClick={() => removeSkillNeed(skill)} className="ml-1 hover:text-blue-900">×</button>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          {/* Exchange Mode */}
          <div className="flex items-center justify-between py-4 border-b">
            <div>
              <p className="font-semibold text-gray-800">Exchange Mode</p>
              <p className="text-sm text-gray-500">
                {userData?.exchangeMode === 'Online' && '💻 Online only'}
                {userData?.exchangeMode === 'Offline' && '📍 Offline only'}
                {userData?.exchangeMode === 'Both' && '🔄 Online & Offline'}
              </p>
            </div>
            {isEditing && (
              <select
                value={editData?.exchangeMode || ''}
                onChange={(e) => setEditData({...editData, exchangeMode: e.target.value})}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:border-primary-500"
              >
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Both">Both</option>
              </select>
            )}
          </div>

          {/* Availability */}
          <div className="py-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-gray-800">Availability</p>
            </div>
            {!isEditing ? (
              <p className="text-sm text-gray-500">
                {userData?.availability?.days?.join(', ') || 'Not set'} | {userData?.availability?.time?.join(', ') || ''}
              </p>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Days</p>
                  <div className="flex flex-wrap gap-2">
                    {['Weekdays', 'Weekends', 'All Days'].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const days = editData?.availability?.days || [];
                          const newDays = days.includes(day) ? days.filter(d => d !== day) : [...days, day];
                          setEditData({ ...editData, availability: { ...editData?.availability, days: newDays } });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          editData?.availability?.days?.includes(day)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Time</p>
                  <div className="flex flex-wrap gap-2">
                    {['Morning', 'Afternoon', 'Evening'].map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => {
                          const times = editData?.availability?.time || [];
                          const newTimes = times.includes(time) ? times.filter(t => t !== time) : [...times, time];
                          setEditData({ ...editData, availability: { ...editData?.availability, time: newTimes } });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          editData?.availability?.time?.includes(time)
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
                {/* Portfolio & Links */}
          <div className="py-4">
            <p className="font-semibold text-gray-800 mb-3">Portfolio & Links</p>
            <div className="space-y-2">
              {userData?.socialLinks?.linkedin && (
                <a 
                  href={userData.socialLinks.linkedin.startsWith('http') ? userData.socialLinks.linkedin : `https://${userData.socialLinks.linkedin}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline text-sm flex items-center gap-2"
                >
                  💼 LinkedIn Profile
                </a>
              )}
              {userData?.socialLinks?.portfolio && (
                <a 
                  href={userData.socialLinks.portfolio.startsWith('http') ? userData.socialLinks.portfolio : `https://${userData.socialLinks.portfolio}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline text-sm flex items-center gap-2"
                >
                  🌐 Portfolio / Website
                </a>
              )}
              {userData?.socialLinks?.googleDrive && (
                <a 
                  href={userData.socialLinks.googleDrive.startsWith('http') ? userData.socialLinks.googleDrive : `https://${userData.socialLinks.googleDrive}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline text-sm flex items-center gap-2"
                >
                  📁 Google Drive
                </a>
              )}
              {userData?.socialLinks?.dropbox && (
                <a 
                  href={userData.socialLinks.dropbox.startsWith('http') ? userData.socialLinks.dropbox : `https://${userData.socialLinks.dropbox}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline text-sm flex items-center gap-2"
                >
                  📦 Dropbox
                </a>
              )}
              {!userData?.socialLinks?.linkedin && 
               !userData?.socialLinks?.portfolio && 
               !userData?.socialLinks?.googleDrive && 
               !userData?.socialLinks?.dropbox && (
                <p className="text-gray-400 text-sm">No links added yet</p>
              )}
            </div>
          </div>  
        </div>
        {/* Save/Cancel Buttons when Editing */}
        {isEditing && (
          <div className="flex gap-4">
            <button
              onClick={cancelEditing}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              disabled={isLoading}
              className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default MyProfile;