import axios from 'axios';
import { getToken, refreshToken } from './auth';

// Creates an axios instance that will send request to the Django Backend 
const api = axios.create({
    // Gets the url from .env file (fallback to localhost if not set)
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 5000,
});

// Request interceptor: Add JWT token to headers if available.
api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handle token refresh on 401 errors and global error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {  // Added optional chaining for safety
            originalRequest._retry = true;
            
            try {
                await refreshToken(); // Refresh token if expired
                return api(originalRequest); // Retry original request
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;