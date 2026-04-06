import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const api = axios.create({
  // Use your environment variable or fallback to localhost
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. Request Interceptor: Attach the Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // FIX: Check if we are in the browser before accessing localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handle Global Errors (like 401)
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error.response?.status;

    // FIX: Only redirect if we are in the browser
    if (status === 401 && typeof window !== 'undefined') {
      console.warn('Unauthorized! Redirecting to login...');
      localStorage.removeItem('token');
      
      // We use a hard redirect here to ensure all state is cleared
      window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  }
);

export default api;