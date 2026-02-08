import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { ref, get, set } from 'firebase/database';
import { database } from '../firebase/config';
import {  sendGoogleMeetEmail } from '../services/emailservice';
import api from '../services/api';

// ✅ Location Database
const LOCATION_DATABASE = {
  cities: {
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Delhi': { lat: 28.7041, lng: 77.1025 },
    'Bangalore': { lat: 12.9716, lng: 77.5946 },
    'Pune': { lat: 18.5204, lng: 73.8567 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 }
  },
  areas: {
    'Mumbai': {
      'Andheri East': { lat: 19.1142, lng: 72.8693},
      'Andheri West':{lat: 19.1192,lng: 72.8458},
      'Bandra East': { lat: 19.0701, lng: 72.8469},
      'Bandra West':{lat: 19.0550 ,lng: 72.8258 },
      'Borivali East': { lat: 19.2298, lng: 72.8609 },
      'Borivali West':{lat: 19.2469, lng: 72.8498},
      'Thane': { lat: 19.2183, lng: 72.9781 },
      'Mulund': { lat: 19.1729, lng: 72.9560 },
      'Mira Road':{lat:19.2869, lng:72.8690},
      'Churchgate':{ lat: 18.9331, lng: 72.8286},
      'Dadar':{ lat: 19.0180, lng: 72.8467},
      'Goregaon':{lat: 19.1550, lng: 72.8500},
      'Juhu':{ lat: 19.0988, lng: 72.8321},
      'Kandivali':{at: 19.2162, lng: 72.8306},
      'Malad':{ lat: 19.1828, lng: 72.8402},
      'Bhayander East':{lat: 19.3043, lng: 72.8593},
      'Bhayander West':{lat: 19.3015,lng:72.8503}
 },
    'Delhi': {
      'Connaught Place': { lat: 28.6315, lng: 77.2167 },
      'Karol Bagh': { lat: 28.6517, lng: 77.1905 },
      'Dwarka': { lat: 28.5921, lng: 77.0460 },
      'Lajpat Nagar':{lat: 28.5693, lng: 77.2441},
      'Defence Colony':{lat: 28.5697, lng: 77.2362},
      'Saket':{lat: 28.5192, lng: 77.2130},
      'Janakpuri':{lat: 28.6196, lng: 77.0881}
    },
    'Pune': {
      'Kothrud': { lat: 18.5074, lng: 73.8077 },
      'Hinjewadi': { lat: 18.5912, lng: 73.7389 },
      'Baner': { lat: 18.5590, lng: 73.7804 }
    },
    'Hyderabad': {
      'Hitech City': { lat: 17.4435, lng: 78.3772 },
      'Gachibowli': { lat: 17.4399, lng: 78.3489 },
      'Madhapur': { lat: 17.4480, lng: 78.3910 }
    }
  }
};

const UserProfile = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { currentUser, userData } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchScore, setMatchScore] = useState(0);

  useEffect(() => {
  const fetchUser = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const fetchedUser = snapshot.val();
        setUser(fetchedUser);
        
        // ✅ Load map AFTER user data is set
        setTimeout(() => loadLeafletMap(fetchedUser), 500);
        
        if (userData && currentUser) {
          try {
            const matches = await api.match.getMatches(currentUser.uid, 100);
            const thisMatch = matches.find(m => m.user.uid === userId);
            if (thisMatch) {
              setMatchScore(Math.round(thisMatch.matchScore));
            }
          } catch (error) {
            console.error('❌ Match score failed:', error);
          }
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  fetchUser();

  // ✅ Cleanup function - remove map when component unmounts
  return () => {
    if (window.userProfileMap) {
      try {
        window.userProfileMap.remove();
        window.userProfileMap = null;
        console.log('✅ Map cleaned up on unmount');
      } catch (e) {
        console.warn('⚠️ Map cleanup error:', e);
      }
    }
  };
}, [userId, userData, currentUser]);

  const loadLeafletMap = (fetchedUser) => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => initializeMap(fetchedUser);
      document.body.appendChild(script);
    } else {
      initializeMap(fetchedUser);
    }
  };

const initializeMap = (fetchedUser) => {
  try {
    const mapContainer = document.getElementById('location-map');
    if (!mapContainer) {
      console.error('❌ Map container not found');
      return;
    }

    // Clear previous map content
    mapContainer.innerHTML = '';
    
    // Remove existing Leaflet map instance if it exists
    if (window.userProfileMap) {
      try {
        window.userProfileMap.remove();
        window.userProfileMap = null;
        console.log('✅ Previous map instance removed');
      } catch (e) {
        console.warn('⚠️ Could not remove previous map:', e);
      }
    }

    const myLocation = getLocationCoordinates(userData?.location?.city, userData?.location?.area);
    const theirLocation = getLocationCoordinates(fetchedUser?.location?.city, fetchedUser?.location?.area);

    if (!myLocation || !theirLocation) {
      console.error('❌ Could not get coordinates');
      mapContainer.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-sm">Location data not available</div>';
      return;
    }

    const centerLat = (myLocation.lat + theirLocation.lat) / 2;
    const centerLng = (myLocation.lng + theirLocation.lng) / 2;

    console.log('🗺️ Initializing map at:', centerLat, centerLng);

    // Create new map instance and store it globally
    window.userProfileMap = window.L.map('location-map', {
      center: [centerLat, centerLng],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: false
    });

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(window.userProfileMap);
    // ✅ Define BOTH icon types FIRST
const redIcon = window.L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = window.L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// ✅ Add markers - YOUR location (BLUE)
window.L.marker([myLocation.lat, myLocation.lng], { icon: blueIcon })
  .addTo(window.userProfileMap)
  .bindPopup(`<b>You</b><br>${userData.location?.city}, ${userData.location?.area}`);

// ✅ Add markers - OTHER user's location (RED)
window.L.marker([theirLocation.lat, theirLocation.lng], { icon: redIcon })
  .addTo(window.userProfileMap)
  .bindPopup(`<b>${fetchedUser.fullName}</b><br>${fetchedUser.location?.city}, ${fetchedUser.location?.area}`);
   
    // Invalidate size after a delay to ensure proper rendering
    setTimeout(() => {
      if (window.userProfileMap) {
        window.userProfileMap.invalidateSize();
        console.log('✅ Map rendered successfully');
      }
    }, 300);

  } catch (error) {
    console.error('❌ Map initialization error:', error);
    const mapContainer = document.getElementById('location-map');
    if (mapContainer) {
      mapContainer.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-sm">Map could not be loaded. Please refresh the page.</div>';
    }
  }
};

  const getLocationCoordinates = (city, area) => {
    if (!city) return { lat: 19.0760, lng: 72.8777 };
    if (area && LOCATION_DATABASE.areas[city]?.[area]) {
      return LOCATION_DATABASE.areas[city][area];
    }
    return LOCATION_DATABASE.cities[city] || { lat: 19.0760, lng: 72.8777 };
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

const startChat = async () => {
  try {
    // Create conversation entries in Firebase
    await set(ref(database, `conversations/${currentUser.uid}/${userId}`), {
      lastMessage: '',
      lastMessageTime: Date.now(),
      otherUserName: user.fullName
    });
    
    await set(ref(database, `conversations/${userId}/${currentUser.uid}`), {
      lastMessage: '',
      lastMessageTime: Date.now(),
      otherUserName: userData.fullName
    });
    
    // Navigate to messages
    navigate(`/messages?user=${userId}`);
  } catch (error) {
    console.error('❌ Error starting chat:', error);
    alert('Failed to start chat. Please try again.');
  }
};

const startMeet = async () => {
  try {
    // ✅ Use your permanent Google Meet link
    const meetUrl = 'https://meet.google.com/uer-usjy-vnf';
    
    console.log('📹 Starting Google Meet');

    // Send email to other user
    if (user.email && userData) {
      sendGoogleMeetEmail(userData, user, meetUrl)
        .then(result => {
          if (result?.success) {
            console.log('✅ Google Meet email sent to', user.email);
          }
        })
        .catch(err => console.warn('⚠️ Email error:', err));
    }

    // Open Google Meet silently (no popups)
    window.open(meetUrl, '_blank', 'noopener,noreferrer');
    
  } catch (error) {
    console.error('❌ Error starting meet:', error);
    alert('Failed to start Google Meet. Please try again.');
  }
};

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < fullStars ? 'text-yellow-500' : 'text-gray-300'}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-6xl mb-4 block">😕</span>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <button
            onClick={() => navigate('/find-match')}
            className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600"
          >
            Go Back to Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="container-custom max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-card p-8 text-center mb-6">
          <div className="w-28 h-28 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-4xl mx-auto mb-4">
            {getInitials(user.fullName)}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.fullName}</h1>
          
          <p className="text-gray-500 flex items-center justify-center gap-1 mb-2">
            <span>📍</span>
            {user.location?.city || 'Unknown'}, {user.location?.area || 'Unknown'}
          </p>

          {user.rating > 0 && (
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex text-lg">{renderStars(user.rating)}</div>
              <span className="text-sm text-gray-600">
                {user.rating.toFixed(1)} ({user.totalRatings || 0} reviews)
              </span>
            </div>
          )}
          
          {matchScore > 0 && (
            <div className={`inline-block px-6 py-2 rounded-full font-semibold mb-4 ${
              matchScore >= 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {matchScore}% Match with You
            </div>
          )}
          
          {user.bio && (
            <p className="text-gray-600 mb-6 max-w-md mx-auto italic">{user.bio}</p>
          )}
          
          <div className="flex justify-center gap-4">
            <button
              onClick={startChat}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors flex items-center gap-2"
            >
              💬 Start Chat
            </button>
            <button
              onClick={startMeet}
              className="px-6 py-3 border-2 border-primary-500 text-primary-600 rounded-xl font-medium hover:bg-primary-50 transition-colors flex items-center gap-2"
            >
              📹 Start Meet
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">✅ Skills They Can Offer</h3>
            <div className="flex flex-wrap gap-2">
              {user.skillsOffered?.length > 0 ? (
                user.skillsOffered.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No skills listed</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Skills They Want to Learn</h3>
            <div className="flex flex-wrap gap-2">
              {user.skillsNeeded?.length > 0 ? (
                user.skillsNeeded.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No skills listed</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Exchange Mode</p>
              <p className="font-medium text-gray-900">
                {user.exchangeMode === 'Online' && '💻 Online'}
                {user.exchangeMode === 'Offline' && '📍 Offline'}
                {user.exchangeMode === 'Both' && '🔄 Online & Offline'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Availability</p>
              <p className="font-medium text-gray-900">
                {user.availability?.days?.join(', ') || 'Not specified'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Location Map</h3>
          <div 
            id="location-map" 
            className="w-full h-64 rounded-xl border-2 border-gray-200"
          ></div>
          <p className="text-xs text-gray-500 mt-2 text-center">
           Markers show your location and {user.fullName}'s location
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;