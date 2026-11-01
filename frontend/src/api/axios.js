import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
});

// Request interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem('gramseva_token') ||
      localStorage.getItem('gramseva_token') ||
      sessionStorage.getItem('token') ||
      localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('gramseva_token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('gramseva_token');
      localStorage.removeItem('token');
      // If unauthorized and currently in admin route, redirect to admin login
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
