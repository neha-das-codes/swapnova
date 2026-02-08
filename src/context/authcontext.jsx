import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { auth, database } from '../firebase/config';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Listen to user data changes in realtime
        const userRef = ref(database, `users/${user.uid}`);
        const unsubscribeData = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserData(snapshot.val());
          } else {
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
          console.error('Error fetching user data:', error);
          setLoading(false);
        });

        // Return cleanup for data listener
        return () => unsubscribeData();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    // Cleanup subscription
    return () => unsubscribeAuth();
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    isAuthenticated: !!currentUser,
    isAdmin: userData?.role === 'admin',
    isUser: userData?.role === 'user',
    profileCompleted: userData?.profileCompleted || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;