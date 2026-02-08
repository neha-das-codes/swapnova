import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authcontext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import api from '../services/api';
import { sendReportResolvedEmail } from '../services/emailservice';

const Admin = () => {
  const navigate = useNavigate();
  const { currentUser, userData } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [stats, setStats] = useState(null);
  const [skillsAnalytics, setSkillsAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [reports, setReports] = useState([]);
  
  // Filter states
  const [userSearch, setUserSearch] = useState('');
  const [exchangeFilter, setExchangeFilter] = useState('');
  const [reportFilter, setReportFilter] = useState('');

  useEffect(() => {
    if (!userData) return;
    
    if (userData.role !== 'admin') {
      alert('❌ Access Denied: Admin privileges required');
      navigate('/dashboard');
      return;
    }

    loadData();
  }, [currentUser, userData, activeTab]);

  // ✅ Reload data when filters change
useEffect(() => {
  if (activeTab === 'exchanges' || activeTab === 'reports') {
    loadData();
  }
}, [exchangeFilter, reportFilter]);

  const loadData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      if (activeTab === 'overview') {
        const [statsData, analyticsData] = await Promise.all([
          api.admin.getStats(currentUser.uid),
          api.admin.getSkillsAnalytics(currentUser.uid)
        ]);
        setStats(statsData);
        setSkillsAnalytics(analyticsData);
      }
      
      if (activeTab === 'users') {
        const data = await api.admin.getAllUsers(currentUser.uid, userSearch);
        // ✅ Filter out admin from users list
        const filteredUsers = (data.users || []).filter(user => user.role !== 'admin');
        setUsers(filteredUsers);
      }
      
        if (activeTab === 'exchanges') {
  // Always fetch all exchanges, filter on frontend
  const data = await api.admin.getExchanges(currentUser.uid, '');
  let filteredExchanges = data.exchanges || [];
  
  // Apply filter
  if (exchangeFilter === 'completed') {
    filteredExchanges = filteredExchanges.filter(ex => ex.fullyCompleted === true);
  } else if (exchangeFilter === 'in-progress') {
    filteredExchanges = filteredExchanges.filter(ex => !ex.fullyCompleted);
  }
  // If exchangeFilter is empty/null, show all
  
  setExchanges(filteredExchanges);
}
    
      if (activeTab === 'feedback') {
        const data = await api.admin.getFeedback(currentUser.uid);
        setFeedback(data.feedback || []);
      }
      
      if (activeTab === 'reports') {
  // Always fetch all reports, filter on frontend
  const data = await api.admin.getReports(currentUser.uid, '');
  let filteredReports = data.reports || [];
  
  // Apply filter
  if (reportFilter === 'pending') {
    filteredReports = filteredReports.filter(r => r.status === 'pending');
  } else if (reportFilter === 'resolved') {
    filteredReports = filteredReports.filter(r => r.status === 'resolved');
  }
  // If reportFilter is empty/null, show all
  
  setReports(filteredReports);
}
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      alert('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out');
    }
  };

const handleResolveReport = async (report) => {
  try {
    // STEP 1: Mark as resolved
    await api.admin.resolveReport(currentUser.uid, report.reportId);
    console.log('✅ Report marked as resolved in database');
    
    // STEP 2: Fetch reporter's email from Firebase
    const { ref, get } = await import('firebase/database');
    const { database } = await import('../firebase/config');
    
    const reporterRef = ref(database, `users/${report.reportedBy}/email`);
    const reporterSnapshot = await get(reporterRef);
    
    if (reporterSnapshot.exists()) {
      const reporterEmail = reporterSnapshot.val();
      console.log('📧 Sending email to:', reporterEmail);
      
      // STEP 3: Send email
      await sendReportResolvedEmail(
        reporterEmail,
        report.reportedByName,
        report.reason
      );
      console.log('✅ Email sent successfully!');
      alert('✅ Report resolved and user notified via email!');
    } else {
      console.warn('⚠️ Email not found for user:', report.reportedBy);
      alert('✅ Report resolved (but email address not found in database)');
    }
    
    loadData();
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Report resolved, but email notification failed');
    loadData();
  }
};

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  if (loading && activeTab === 'overview') {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4">
      <div className="container-custom max-w-7xl mx-auto">
        {/* ✅ NEW: Modern Header Card */}
        <div className="bg-gradient-to-r from-primary-500 to-indigo-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                🔧 Admin Dashboard
              </h1>
              <p className="text-white/80 mt-2">Manage SwapNova Platform</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-6 py-3 bg-white text-primary-600 rounded-xl hover:bg-gray-100 font-semibold transition-all flex items-center gap-2 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 p-2 flex gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'users', label: '👥 Users' },
            { id: 'exchanges', label: '🔄 Exchanges' },
            { id: 'feedback', label: '⭐ Feedback' },
            { id: 'reports', label: '🚨 Reports' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-500 to-indigo-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-primary-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ✅ OVERVIEW TAB - Vertical Cards Like Your Screenshot */}
        {activeTab === 'overview' && stats && (
          <>
            {/* ✅ Platform Overview Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Overview</h2>
            
            {/* ✅ Stats Cards - Vertical Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-md p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-blue-900">Total Users</h3>
                  <span className="text-2xl">👥</span>
                </div>
                <p className="text-4xl font-bold text-blue-900">{stats.totalUsers}+</p>
                <p className="text-xs text-blue-700 mt-2">+{stats.newUsersThisWeek} this week</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-md p-6 border border-green-200">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-semibold text-green-900">Active Users</h3>
    <span className="text-2xl">🟢</span>
  </div>
  <p className="text-4xl font-bold text-green-900">{stats.activeUsers}</p>
  <p className="text-xs text-green-700 mt-2">Currently online</p>
</div>
             
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-md p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-purple-900">Total Exchanges</h3>
                  <span className="text-2xl">🔄</span>
                </div>
                <p className="text-4xl font-bold text-purple-900">{stats.totalExchanges}</p>
                <p className="text-xs text-purple-700 mt-2">{stats.completedExchanges} completed</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl shadow-md p-6 border border-indigo-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-indigo-900">Success Rate</h3>
                  <span className="text-2xl">📈</span>
                </div>
                <p className="text-4xl font-bold text-indigo-900">{stats.successRate}%</p>
                <p className="text-xs text-indigo-700 mt-2">Exchange completion</p>
              </div>
            </div>

            {/* Skills Analytics */}
            {skillsAnalytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Top Offered Skills</h3>
                  <div className="space-y-3">
                    {skillsAnalytics.topOfferedSkills?.slice(0, 5).map((skill, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-gray-800 font-medium">{skill.skill}</span>
                        <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-bold">
                          {skill.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Top Needed Skills</h3>
                  <div className="space-y-3">
                    {skillsAnalytics.topNeededSkills?.slice(0, 5).map((skill, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-gray-800 font-medium">{skill.skill}</span>
                        <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-bold">
                          {skill.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">All Users ({users.length})</h2>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                className="px-4 py-2 border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.uid} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-xs text-gray-500">{user.uid}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{user.email}</td>
                      <td className="py-3 px-4 text-center">
                        {user.status?.online ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            🟢 Online
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            ⚫ Offline
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">
                        {formatDate(user.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EXCHANGES TAB */}
        {activeTab === 'exchanges' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">All Exchanges ({exchanges.length})</h2>
              <select
  value={exchangeFilter}
  onChange={(e) => {
    setExchangeFilter(e.target.value);
  }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Exchanges</option>
                <option value="completed">Completed Only</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Users</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {exchanges.map((exchange, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="text-sm font-medium text-gray-900">
                          {exchange.userNames?.join(' ↔ ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          exchange.fullyCompleted
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {exchange.fullyCompleted ? '✅ Complete' : '⏳ In Progress'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">
                        {exchange.completedAt ? formatDate(exchange.completedAt) : 'Ongoing'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FEEDBACK TAB */}
        {activeTab === 'feedback' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">All Feedback ({feedback.length})</h2>
            
            <div className="space-y-4">
              {feedback.map((item) => (
                <div key={item.feedbackId} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900">{item.fromUserName}</span>
                      <span className="text-gray-500"> → </span>
                      <span className="font-medium text-gray-900">{item.toUserName}</span>
                    </div>
                    <div className="text-xl">{renderStars(item.rating)}</div>
                  </div>
                  {item.comment && (
                    <p className="text-sm text-gray-600 italic">"{item.comment}"</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">{formatDate(item.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">User Reports ({reports.length})</h2>
                <select
  value={reportFilter}
  onChange={(e) => {
    setReportFilter(e.target.value);
  }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Reports</option>
                <option value="pending">Pending Only</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.reportId} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-medium text-gray-900">
                        {report.reportedByName} reported {report.reportedUserName}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Reason: <span className="font-medium text-red-700">{report.reason}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      report.status === 'pending'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {report.status === 'pending' ? '🚨 Pending' : '✅ Resolved'}
                    </span>
                  </div>
                  
                  {report.description && (
                    <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-3 rounded">"{report.description}"</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">{formatDate(report.timestamp)}</p>
                    {report.status === 'pending' && (
                      <button
                        onClick={() => handleResolveReport(report)}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 font-medium transition-colors"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;