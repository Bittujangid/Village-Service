import api from './axios';

/**
 * Generate complaint description using Gemini Vision AI from uploaded photo, ward, and category
 * @param {object} payload - { imageBase64, ward, category, language }
 * @returns {Promise<{ success: boolean, description: string, message?: string }>}
 */
export const generateAiDescription = async (payload) => {
  const response = await api.post('/ai/generate-description', payload);
  return response.data;
};
