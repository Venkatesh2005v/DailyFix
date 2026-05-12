import axios from 'axios';

export const API_URL = '';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const url = error.config?.url || "";
        // 1. Define "Safe" endpoints that should NEVER trigger a redirect loop
        const isAuthCheck = url.includes('/user/me') || url.includes('/dashboard/stats');
        const isLandingPage = window.location.pathname === '/';

        // 2. ONLY redirect if it's a 401 AND it's NOT an auth check AND we aren't already home
        if (error.response?.status === 401 && !isAuthCheck && !isLandingPage) {
            window.location.href = '/';
        }

        return Promise.reject(error);
    }
);
export default api;