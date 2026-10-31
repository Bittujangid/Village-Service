import api from './axios';

/**
 * Admin login
 * @param {object} credentials - { username, password }
 * @returns {Promise}
 */
export const login = async (credentials) => {
  const response = await api.post('/admin/login', credentials);
  return response.data;
};

/**
 * Fetch complaints list with optional filtering and pagination
 * @param {object} params - { status, ward, page, limit }
 * @returns {Promise}
 */
export const getComplaints = async (params = {}) => {
  const response = await api.get('/admin/complaints', { params });
  return response.data;
};

/**
 * Update complaint status and remarks
 * @param {string|number} id
 * @param {object} data - { status, adminRemarks }
 * @returns {Promise}
 */
export const updateStatus = async (id, data) => {
  const response = await api.patch(`/admin/complaints/${id}/status`, data);
  return response.data;
};

/**
 * Get dashboard stats (Total, Pending, In Progress, Resolved)
 * @returns {Promise}
 */
export const getStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

/**
 * Request password reset link via registered email or username
 * @param {string} emailOrUsername
 * @returns {Promise}
 */
export const forgotPassword = async (emailOrUsername) => {
  const response = await api.post('/admin/forgot-password', { emailOrUsername });
  return response.data;
};

/**
 * Reset password using token received via email
 * @param {string} token
 * @param {object} passwords - { password, confirmPassword }
 * @returns {Promise}
 */
export const resetPassword = async (token, passwords) => {
  const response = await api.post(`/admin/reset-password/${token}`, passwords);
  return response.data;
};

/**
 * Get ward-wise analytics and heatmap insights for all 7 wards
 * @returns {Promise}
 */
export const getWardInsights = async () => {
  const response = await api.get('/admin/analytics/ward-insights');
  return response.data;
};
