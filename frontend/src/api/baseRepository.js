import axios from 'axios';

class BaseRepository {
    constructor(endpoint = '') {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:10000/';
        this.endpoint = endpoint;

        this.api = axios.create({
            baseURL: this.baseURL,
            headers: { 
                'Content-Type': 'application/json',
            },
            // Add timeout
            timeout: 5000
        });

        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                // Ensure token format is correct
                const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
                config.headers.Authorization = formattedToken;
                console.log('Setting Authorization header:', formattedToken);
            } else {
                console.warn('No auth token found in localStorage');
            }
            return config;
        });

        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                // Log the complete error for debugging
                console.error('API Error:', {
                    status: error.response?.status,
                    error: error.response?.data?.error,
                    details: error.response?.data?.details,
                    message: error.message
                });

                // Only redirect for auth errors if we're not already on the login page
                if ((error.response?.status === 401 || error.response?.status === 403) && 
                    !window.location.pathname.includes('login')) {
                    console.error('Authentication error:', error.response?.data);
                    localStorage.removeItem('auth_token');
                    window.location.href = '/login';
                    return Promise.reject(new Error('Unauthorized - Please log in again'));
                }

                const enhancedError = new Error(error.response?.data?.error || error.message);
                enhancedError.status = error.response?.status;
                enhancedError.details = error.response?.data?.details;
                enhancedError.originalError = error;

                if (error.response?.data?.error) {
                    enhancedError.message = error.response.data.error;
                }

                return Promise.reject(enhancedError);
            }
        );
    }

    normalizePath(path) {
        return path.startsWith('/') ? path : `/${path}`;
    }

    async get(path = '', params = {}) {
        try {
            console.log('Making GET request to:', this.endpoint + this.normalizePath(path));
            console.log('With params:', params);
            console.log('Auth token:', localStorage.getItem('auth_token'));
            
            const response = await this.api.get(this.endpoint + this.normalizePath(path), { params });
            console.log('Response:', response);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async post(path = '', data = {}) {
        try {
            const response = await this.api.post(this.endpoint + this.normalizePath(path), data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async put(path = '', data = {}) {
        try {
            const response = await this.api.put(this.endpoint + this.normalizePath(path), data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    async delete(path = '') {
        try {
            const response = await this.api.delete(this.endpoint + this.normalizePath(path));
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default BaseRepository;
