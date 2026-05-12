import axios from 'axios';

export const API_URL = '';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;
        const isAuthCheck = originalRequest?.url?.includes('/user/me');
        const isLandingPage = typeof window !== 'undefined' && window.location.pathname === '/';

        // 1. If we are on the landing page, NEVER redirect (prevents the loop)
        if (isLandingPage) {
            return Promise.reject(error);
        }

        // 2. If it's a 401 and NOT the initial auth check, send them home
        if (error.response?.status === 401 && !isAuthCheck) {
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export default api;