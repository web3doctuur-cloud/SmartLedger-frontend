import axios from 'axios';

const API_URL = "https://smartledger-api-o7hy.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for cold starts
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Request Config:', {
    baseURL: config.baseURL,
    url: config.url,
    fullURL: config.baseURL + config.url,
    method: config.method,
  });
  return config;
});

// Log responses for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`API ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code,
    });
    return Promise.reject(error);
  }
);

export default api;