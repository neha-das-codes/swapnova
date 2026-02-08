import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { logOut } from '../firebase/auth';
import { calculateProfileCompletion } from '../utils/profilecompletion';
import api from '../services/api';
import { ref, get } from 'firebase/database';  
import { database } from '../firebase/config';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationSeen, setNotificationSeen] = useState(() => {
    const seen = localStorage.getItem(`notification_seen_${currentUser?.uid}`);
    return seen === 'true';
  });
  const [trendingSkills, setTrendingSkills] = useState([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [completedExchanges, setCompletedExchanges] = useState(0); 
  const [totalMatches, setTotalMatches] = useState(0);

  // ✅ Fetch trending skills from backend (PLATFORM-WIDE)
  useEffect(() => {
    const fetchTrendingSkills = async () => {
      if (!currentUser?.uid) return;
      
      setIsLoadingSkills(true);
      try {
        console.log('🔔 Fetching trending skills for UID:', currentUser.uid);
        const result = await api.suggestion.getSuggestions(currentUser.uid);
        console.log('✅ Raw backend response:', JSON.stringify(result, null, 2));
        
        // ✅ Backend returns: { trendingSkills: [...], message, scope }
        if (result?.trendingSkills && Array.isArray(result.trendingSkills)) {
          const skillsList = result.trendingSkills;
          console.log('✅ Got', skillsList.length, 'skills from backend');
          
          // ✅ Skills already have rank, icon, skill, demandCount, etc.
          setTrendingSkills(skillsList);
        } else {
          console.warn('⚠️ No trendingSkills in response, using fallback');
          setTrendingSkills([
            { rank: 1, skill: 'AI & Machine Learning', icon: '🔥', demandCount: 0, supplyCount: 0, gap: 0 },
            { rank: 2, skill: 'Web Development', icon: '📈', demandCount: 0, supplyCount: 0, gap: 0 },
            { rank: 3, skill: 'UI/UX Design', icon: '⭐', demandCount: 0, supplyCount: 0, gap: 0 }
          ]);
        }
      } catch (error) {
        console.error('❌ Error fetching trending skills:', error);
        
        // Fallback on error
        setTrendingSkills([
          { rank: 1, skill: 'AI & Machine Learning', icon: '🔥', demandCount: 0, supplyCount: 0, gap: 0 },
          { rank: 2, skill: 'Web Development', icon: '📈', demandCount: 0, supplyCount: 0, gap: 0 },
          { rank: 3, skill: 'UI/UX Design', icon: '⭐', demandCount: 0, supplyCount: 0, gap: 0 }
        ]);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    fetchTrendingSkills();
  }, [currentUser?.uid]);

  // ✅ FIXED: Fetch completed exchanges count
useEffect(() => {
  const fetchExchangeStats = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const exchangesRef = ref(database, 'exchanges');
      const snapshot = await get(exchangesRef);
      
      let completed = 0;
      let total = 0;
      
      if (snapshot.exists()) {
        const exchanges = snapshot.val();
        
        Object.entries(exchanges).forEach(([chatId, exchange]) => {
          // ✅ FIXED: Check if current user is in the chatId (key format: uid1_uid2)
          if (chatId.includes(currentUser.uid)) {
            total++;
            
            // Check if exchange is fully completed
            if (exchange.fullyCompleted === true) {
              completed++;
            }
          }
        });
      }
      
      setCompletedExchanges(completed);
      setTotalMatches(total);
      
      console.log('📊 Exchange stats:', { completed, total });
      
    } catch (error) {
      console.error('❌ Error fetching exchange stats:', error);
    }
  };
  
  fetchExchangeStats();
}, [currentUser?.uid]);

  // ✅ Use utility function for profile completion
  const profileCompletion = calculateProfileCompletion(userData);

  // Handle logout
  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  // Toggle notification panel
  const toggleNotification = () => {
    setShowNotification(!showNotification);
    if (!notificationSeen) {
      setNotificationSeen(true);
      localStorage.setItem(`notification_seen_${currentUser?.uid}`, 'true');
    }
  };

  // Get first name
  const firstName = userData?.fullName?.split(' ')[0] || 'User';

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="container-custom max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-card p-8 mb-8">
          <div className="flex items-center justify-between">
            {/* Left - Greeting */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Hello, {firstName}! 👋
              </h1>
              {/* Profile Completion */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base font-medium text-gray-700">
                    Your profile is {profileCompletion}% complete
                  </span>
                  {profileCompletion === 100 && (
                    <span className="text-green-500 text-lg">✓</span>
                  )}
                </div>
                <div className="w-64 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      profileCompletion === 100 
                        ? 'bg-green-500' 
                        : 'bg-gradient-primary'
                    }`} 
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Right - Notification & Sign Out */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={toggleNotification}
                  className="relative p-3 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {/* Red dot - only shows if not seen */}
                  {!notificationSeen && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotification && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="p-4 bg-gradient-primary text-white">
                      <h3 className="font-semibold">🔥 Trending Skills</h3>
                      <p className="text-xs text-white/80">Most in-demand on SwapNova</p>
                    </div>
                   
                    <div className="p-2">
                      {isLoadingSkills ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          Loading skills...
                        </div>
                      ) : trendingSkills.length > 0 ? (
                        trendingSkills.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            {/* Rank Badge */}
                            <span className="w-8 h-8 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full text-sm font-bold">
                              {item.rank || index + 1}
                            </span>
                            
                            {/* Skill Name ONLY */}
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-800">{item.skill}</span>
                            </div>
                            
                            {/* Trend Icon */}
                            <span className="text-xl">{item.icon || '🔥'}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No trending skills available
                        </div>
                      )}
                    </div>
                    
                  </div>
                )}
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
          {/* Find Match Card */}
          <Link
            to="/find-match"
            className="group bg-white rounded-2xl shadow-card p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-blue-200"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Find Match</h3>
            <p className="text-gray-500 text-sm">
              Discover people with complementary skills
            </p>
          </Link>

          {/* My Skills Card */}
          <Link
            to="/my-profile"
            className="group bg-white rounded-2xl shadow-card p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-yellow-200"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">My Skills</h3>
            <p className="text-gray-500 text-sm">
              Manage your offered and needed skills
            </p>
          </Link>

          {/* Messages Card */}
          <Link
            to="/messages"
            className="group bg-white rounded-2xl shadow-card p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-purple-200"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Messages</h3>
            <p className="text-gray-500 text-sm">
              Chat with your connections
            </p>
          </Link>
        </div>
      </div>

      {/* Click outside to close notification */}
      {showNotification && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;