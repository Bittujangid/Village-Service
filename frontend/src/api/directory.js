import api from './axios';

/**
 * Fetch village emergency directory contacts
 * @returns {Promise}
 */
export const getDirectory = async () => {
  const response = await api.get('/directory');
  return response.data;
};
