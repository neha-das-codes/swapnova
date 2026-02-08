import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/authcontext';
import Navbar from './components/common/navbar';
import Home from './pages/home';
import About from './pages/about';
import Privacy from './pages/privacy';
import Terms from './pages/terms';
import Community from './pages/guidelines';
import HelpSupport from './pages/helpsupport';
import Signin from './pages/signin';
import Signup from './pages/signup';
import ProfileSetup from './pages/profilesetup';
import Dashboard from './pages/dashboard';
import FindMatch from './pages/findmatch';
import MyProfile from './pages/myprofile';
import Messages from './pages/messages';
import UserProfile from './pages/userprofile';
import Feedback from './pages/feedback';
import { testAPI } from './services/apiTest';
import Admin from './pages/admin';

// ✅ FIXED: Added skipProfileCheck parameter
const ProtectedRoute = ({ children, skipProfileCheck = false }) => {
  const { isAuthenticated, loading, userData } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" />;
  }
  
  // ✅ Skip profile check for admin
  if (userData?.role === 'admin') {
    return children;
  }
  
  // ✅ FIXED: Only redirect if NOT on profile-setup page AND profile incomplete
  if (!skipProfileCheck && userData && !userData.profileCompleted) {
    return <Navigate to="/profile-setup" />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading, userData } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    // ✅ FIXED: Check profile completion before redirecting
    if (userData && !userData.profileCompleted && userData.role !== 'admin') {
      return <Navigate to="/profile-setup" />;
    }
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  useEffect(() => {
    // Test API on app load (only in development)
    if (process.env.NODE_ENV === 'development') {
      testAPI();
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/guidelines" element={<Community />} />
            <Route path="/help" element={<HelpSupport />} />
            
            <Route 
              path="/signin" 
              element={
                <PublicRoute>
                  <Signin />
                </PublicRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } 
            />

            {/* Protected Routes */}
            {/* ✅ FIXED: Added skipProfileCheck={true} for profile-setup */}
            <Route 
              path="/profile-setup" 
              element={
                <ProtectedRoute skipProfileCheck={true}>
                  <ProfileSetup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/find-match" 
              element={
                <ProtectedRoute>
                  <FindMatch />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-profile" 
              element={
                <ProtectedRoute>
                  <MyProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/:userId" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/feedback/:exchangeId" 
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;