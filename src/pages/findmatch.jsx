import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import api from '../services/api';
import { sendConnectionEmail } from '../services/emailservice';
import { ref, get, set } from 'firebase/database';
import { database } from '../firebase/config';

const FindMatch = () => {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectedUsers, setConnectedUsers] = useState(new Set());

  // ✅ NEW: Load connected users from Firebase on mount
  useEffect(() => {
    const loadConnectedUsers = async () => {
      if (!currentUser) return;
      
      try {
        const connectionsRef = ref(database, `connections/${currentUser.uid}`);
        const snapshot = await get(connectionsRef);
        
        if (snapshot.exists()) {
          const connections = snapshot.val();
          const connectedSet = new Set();
          
          // Check each connection - only show "Connected" if BOTH users clicked connect
          for (const [userId, connectionData] of Object.entries(connections)) {
            if (connectionData.status === 'connected') {
              connectedSet.add(userId);
            }
          }
          
          setConnectedUsers(connectedSet);
        }
      } catch (error) {
        console.error('Error loading connections:', error);
      }
    };
    
    loadConnectedUsers();
  }, [currentUser]);

  // ✅ NEW: Reset connected status after exchange completes
useEffect(() => {
  const checkCompletedExchanges = async () => {
    if (!currentUser || connectedUsers.size === 0) return;
    
    const updatedConnectedUsers = new Set(connectedUsers);
    
    for (const userId of connectedUsers) {
      const chatId = [currentUser.uid, userId].sort().join('_');
      const exchangeRef = ref(database, `exchanges/${chatId}`);
      
      try {
        const snapshot = await get(exchangeRef);
        if (snapshot.exists()) {
          const exchange = snapshot.val();
          
          // If exchange is fully completed, remove from connected list
          if (exchange.fullyCompleted) {
            updatedConnectedUsers.delete(userId);
          }
        }
      } catch (error) {
        console.error('Error checking exchange:', error);
      }
    }
    
    // Update state if any changes
    if (updatedConnectedUsers.size !== connectedUsers.size) {
      setConnectedUsers(updatedConnectedUsers);
    }
  };
  
  checkCompletedExchanges();
}, [currentUser, connectedUsers]);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!userData || !currentUser) {
        console.log('⚠️ Missing userData or currentUser');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching matches from backend for user:', currentUser.uid);
        
        const backendMatches = await api.match.getMatches(currentUser.uid, 20);
        console.log('✅ Backend response:', backendMatches);
        
        if (backendMatches && Array.isArray(backendMatches) && backendMatches.length > 0) {
          console.log('✅ Backend returned', backendMatches.length, 'matches');
          
          const formattedMatches = backendMatches.map(match => ({
            uid: match.user.uid,
            fullName: match.user.fullName,
            email: match.user.email,
            location: match.user.location,
            skillsOffered: match.user.skillsOffered,
            skillsNeeded: match.user.skillsNeeded,
            exchangeMode: match.user.exchangeMode,
            availability: match.user.availability,
            rating: match.user.rating || 0,
            matchScore: Math.round(match.matchScore),
            profileCompleted: match.user.profileCompleted
          }));
          
          console.log('✅ Formatted matches:', formattedMatches);
          setMatches(formattedMatches);
        } else {
          console.warn('⚠️ Backend returned no matches');
          setMatches([]);
        }
        
      } catch (error) {
        console.error('❌ Error fetching matches:', error);
        console.error('❌ Error details:', error.message);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentUser, userData]);

  const getInitials = (name) => {
    if (!name || typeof name !== 'string') {
      console.warn('⚠️ Invalid name for initials:', name);
      return '?';
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

const handleConnect = async (user) => {
  try {
    console.log('🔗 Starting connection with:', user.fullName);
    
    // Validate inputs
    if (!user.uid || !currentUser?.uid) {
      alert('❌ Connection failed. Missing user information.');
      console.error('Missing UIDs:', { userUid: user.uid, currentUid: currentUser?.uid });
      return;
    }

    if (!userData?.fullName || !userData?.email) {
      alert('❌ Your profile is incomplete. Please complete your profile first.');
      return;
    }

    // Send connection email (non-blocking)
    if (user.email && userData.email) {
      console.log('📧 Sending connection email to:', user.email);
      sendConnectionEmail(userData, user)
        .then(result => {
          if (result?.success) {
            console.log('✅ Connection email sent successfully');
          } else {
            console.warn('⚠️ Email failed (continuing):', result?.error);
          }
        })
        .catch(err => console.warn('⚠️ Email error (continuing):', err));
    }
    
    // Step 1: Save MY connection request as "pending"
    console.log('💾 Saving my connection request...');
    const myConnectionRef = ref(database, `connections/${currentUser.uid}/${user.uid}`);
    
    await set(myConnectionRef, {
      status: 'pending',
      requestedAt: Date.now(),
      otherUserName: user.fullName,
      otherUserEmail: user.email || ''
    });
    
    console.log('✅ My connection request saved');
    
    // Step 2: Check if THEY already sent me a request
    console.log('🔍 Checking if other user already requested...');
    const theirConnectionRef = ref(database, `connections/${user.uid}/${currentUser.uid}`);
    const theirSnapshot = await get(theirConnectionRef);
    
    console.log('📊 Their connection status:', theirSnapshot.exists() ? theirSnapshot.val() : 'none');
    
    if (theirSnapshot.exists() && theirSnapshot.val().status === 'pending') {
      // 🎉 BOTH users clicked connect! Make it mutual
      console.log('🎉 Both users clicked! Making connection mutual...');
      
      // Update MY connection to "connected"
      await set(myConnectionRef, {
        status: 'connected',
        connectedAt: Date.now(),
        otherUserName: user.fullName,
        otherUserEmail: user.email || ''
      });
      
      // Update THEIR connection to "connected"
      await set(theirConnectionRef, {
        status: 'connected',
        connectedAt: Date.now(),
        otherUserName: userData.fullName,
        otherUserEmail: userData.email || ''
      });
      
      console.log('✅ Mutual connection established!');
      
      // Update UI to show "Connected"
      setConnectedUsers(prev => new Set(prev).add(user.uid));
      
      alert(`🎉 You are now connected with ${user.fullName}!\n\nYou can now message them directly.`);
    } else {
      // Only I clicked - waiting for them
      console.log('⏳ Connection request sent, waiting for other user...');
      alert(`✅ Connection request sent to ${user.fullName}!\n\nThey'll receive an email. Once they also click "Connect", you'll both be connected.`);
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // User-friendly error messages
    if (error.message?.includes('PERMISSION_DENIED') || error.message?.includes('Permission denied')) {
      alert('❌ Connection failed: Database permission error.\n\nPlease ensure Firebase rules are updated and published.');
    } else if (error.message?.includes('network')) {
      alert('❌ Connection failed: Network error.\n\nPlease check your internet connection.');
    } else {
      alert(`❌ Connection failed: ${error.message}\n\nPlease try again.`);
    }
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
      <div className="container-custom max-w-6xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            AI Suggested Matches 🎯
          </h1>
          <p className="text-gray-500 mt-1">
            {matches.length > 0 
              ? `Found ${matches.length} potential skill exchange partner${matches.length > 1 ? 's' : ''}`
              : 'Finding the best matches for you...'
            }
          </p>
        </div>

        {matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div
                key={match.uid}
                className="bg-white rounded-2xl shadow-card p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {getInitials(match.fullName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{match.fullName}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      📍 {match.location?.city || 'Unknown'}, {match.location?.area || 'Unknown'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    match.matchScore >= 70 
                      ? 'bg-green-100 text-green-700' 
                      : match.matchScore >= 50 
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-orange-100 text-orange-700'
                  }`}>
                    {match.matchScore}% Match
                  </span>
                  
                  {match.rating > 0 && (
                    <span className="flex items-center gap-1 text-sm text-gray-600">
                      <span className="text-yellow-500">⭐</span>
                      {match.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Can teach you:</p>
                  <div className="flex flex-wrap gap-1">
                    {(match.skillsOffered || []).slice(0, 3).map((skill, idx) => (
                      <span
                        key={`${skill}-${idx}`}
                        className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">Wants to learn:</p>
                  <div className="flex flex-wrap gap-1">
                    {(match.skillsNeeded || []).slice(0, 3).map((skill, idx) => (
                      <span
                        key={`${skill}-${idx}`}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span>
                    {match.exchangeMode === 'Online' && '💻 Online'}
                    {match.exchangeMode === 'Offline' && '📍 Offline'}
                    {match.exchangeMode === 'Both' && '🔄 Online & Offline'}
                  </span>
                  {match.availability?.days?.length > 0 && (
                    <span>• {match.availability.days.slice(0, 2).join(', ')}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/user/${match.uid}`}
                    className="flex-1 py-2 text-center bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() => handleConnect(match)}
                    disabled={connectedUsers.has(match.uid)}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors text-sm ${
                      connectedUsers.has(match.uid)
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    }`}
                  >
                    {connectedUsers.has(match.uid) ? '✓ Connected' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card p-12 text-center">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No matches found yet</h3>
            <p className="text-gray-500 mb-4">
              We couldn't find users whose skills match yours. Try updating your skills or check back later!
            </p>
            <Link
              to="/my-profile"
              className="inline-block px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              Update My Skills
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindMatch;