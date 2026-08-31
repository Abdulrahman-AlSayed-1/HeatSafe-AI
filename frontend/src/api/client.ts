import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '/api';
  const clean = envUrl.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    // If an API call returned HTML (e.g. Vercel SPA rewrite when backend is not connected), reject cleanly
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE')) {
      return Promise.reject(new Error('Backend API not reached. Please check backend deployment or VITE_API_BASE_URL.'));
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default api;
