import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Proxy to backend
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            if (typeof window !== 'undefined') {
                // Clear all auth data
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');

                // Redirect to login only if not already there (avoid loops)
                const path = window.location.pathname;
                if (!path.includes('/login') && !path.includes('/signup')) {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
