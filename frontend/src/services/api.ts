import axios from 'axios';

// When using Vercel Rewrites, we use a relative path.
// This tells the browser: "Send this to the Vercel server I'm currently on."
export const API_URL = '';

const api = axios.create({
    // Vercel will see '/api' and proxy it to Render for you.
    baseURL: '/api',
    withCredentials: true, // Absolute requirement for JSESSIONID cookies
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;

        // Prevent loop: If the error IS from the 'me' endpoint, don't redirect again
        if (error.response?.status === 401 && originalRequest?.url && !originalRequest.url.includes('/user/me')) {
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