import api from './axios';

/**
 * Submit a citizen grievance/complaint (supports multipart with optional image)
 * @param {FormData|object} formData
 * @returns {Promise}
 */
export const submitComplaint = async (formData) => {
  const isFormData = formData instanceof FormData;
  const config = isFormData
    ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    : undefined;

  const response = await api.post('/complaints', formData, config);
  return response.data;
};

/**
 * Track a complaint by tracking ID (e.g. GR-AB12) or 10-digit mobile number
 * @param {string} identifier
 * @returns {Promise}
 */
export const trackComplaint = async (identifier) => {
  const cleanId = String(identifier).trim();
  const response = await api.get(`/complaints/track/${encodeURIComponent(cleanId)}`);
  return response.data;
};

/**
 * Fetch public stats for homepage (resolved count, total wards, total complaints)
 * @returns {Promise}
 */
export const getPublicStats = async () => {
  const response = await api.get('/complaints/public-stats');
  return response.data;
};
