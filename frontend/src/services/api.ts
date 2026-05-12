import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    withCredentials: true, // Required for JSESSIONID cookies
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        // Prevent loop: If the error IS from the 'me' endpoint, don't redirect again
        if (error.response?.status === 401 && !originalRequest.url.includes('/user/me')) {
            if (typeof window !== 'undefined') {
                // Only redirect if NOT already on the landing page
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;