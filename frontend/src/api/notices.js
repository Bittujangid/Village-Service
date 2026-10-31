import api from './axios';

/**
 * Fetch all active village public notices
 * @returns {Promise}
 */
export const getNotices = async () => {
  const response = await api.get('/notices');
  return response.data;
};

/**
 * Create a new village public notice (Admin)
 * @param {object} data - { title, description, category }
 * @returns {Promise}
 */
export const createNotice = async (data) => {
  const response = await api.post('/notices', data);
  return response.data;
};

/**
 * Delete a village notice by ID (Admin)
 * @param {string|number} id
 * @returns {Promise}
 */
export const deleteNotice = async (id) => {
  const response = await api.delete(`/notices/${id}`);
  return response.data;
};
