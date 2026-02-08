/**
 * API Utility for SwapNova Backend
 * Handles all API calls to FastAPI backend
 */
// Backend URL
const API_BASE_URL = 'http://127.0.0.1:8000/api';
/**
 * Helper function to make API requests
 */
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    // Check if response is ok
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${response.status}`);
    }

    // Return JSON data
    return await response.json();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};
// ============================================
// USER APIs
// ============================================
export const userAPI = {
  /**
   * Get all users
   */
  getAllUsers: async () => {
    return apiRequest('/users/');
  },

  /**
   * Get single user by UID
   */
  getUser: async (uid) => {
    return apiRequest(`/users/${uid}`);
  },

  /**
   * Create new user
   */
  createUser: async (uid, userData) => {
    return apiRequest(`/users/?uid=${uid}`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Update user
   */
  updateUser: async (uid, userData) => {
    return apiRequest(`/users/${uid}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Delete user
   */
  deleteUser: async (uid) => {
    return apiRequest(`/users/${uid}`, {
      method: 'DELETE',
    });
  },

  /**
   * Update user online status
   */
  updateStatus: async (uid, online) => {
    return apiRequest(`/users/${uid}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ online }),
    });
  },
};
// ============================================
// MATCHING APIs
// ============================================
export const matchAPI = {
  /**
   * Get AI-powered matches for a user
   */
  getMatches: async (uid, limit = 10) => {
    return apiRequest(`/matches/${uid}?limit=${limit}`);
  },

  /**
   * Get detailed match between two users
   */
  getDetailedMatch: async (uid, matchUid) => {
    return apiRequest(`/matches/${uid}/detailed?match_uid=${matchUid}`);
  },
};
// ============================================
// SUGGESTIONS APIs
// ============================================
export const suggestionAPI = {
  /**
   * Get AI skill suggestions for a user
   */
  getSuggestions: async (uid) => {
    return apiRequest(`/suggestions/${uid}`);
  },
};
// ============================================
// ADMIN APIs
// ============================================
export const adminAPI = {
  /**
   * Get dashboard statistics
   */
  getStats: async (adminUid) => {
    return apiRequest(`/admin/stats?admin_uid=${adminUid}`);
  },
  /**
   * Get skills analytics
   */
  getSkillsAnalytics: async (adminUid) => {
    return apiRequest(`/admin/skills-analytics?admin_uid=${adminUid}`);
  },
  /**
   * Get all users (admin view)
   */
  getAllUsers: async (adminUid, search = '') => {
    const searchParam = search ? `&search=${search}` : '';
    return apiRequest(`/admin/users?admin_uid=${adminUid}${searchParam}`);
  },
  /**
   * Get single user details (admin view)
   */
  getUserDetails: async (adminUid, uid) => {
    return apiRequest(`/admin/users/${uid}?admin_uid=${adminUid}`);
  },
  /**
   * Get all exchanges
   */
  getExchanges: async (adminUid, statusFilter = '') => {
    const filterParam = statusFilter ? `&status_filter=${statusFilter}` : '';
    return apiRequest(`/admin/exchanges?admin_uid=${adminUid}${filterParam}`);
  },
  /**
   * Get all feedback
   */
  getFeedback: async (adminUid) => {
    return apiRequest(`/admin/feedback?admin_uid=${adminUid}`);
  },
  /**
   * Get all reports
   */
  getReports: async (adminUid, statusFilter = '') => {
    const filterParam = statusFilter ? `&status_filter=${statusFilter}` : '';
    return apiRequest(`/admin/reports?admin_uid=${adminUid}${filterParam}`);
  },
  /**
   * Resolve a report
   */
  resolveReport: async (adminUid, reportId) => {
    return apiRequest(`/admin/reports/${reportId}/resolve?admin_uid=${adminUid}`, {
      method: 'PATCH',
    });
  },
};
// ============================================
// EXPORT DEFAULT (for convenience)
// ============================================
const api = {
  user: userAPI,
  match: matchAPI,
  suggestion: suggestionAPI,
  admin: adminAPI,
};
export default api;
