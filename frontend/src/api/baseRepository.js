import axios from 'axios';

class BaseRepository {
    constructor(endpoint = '') {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:10000/';
        this.endpoint = endpoint;

        this.api = axios.create({
            baseURL: this.baseURL,
            headers: { 'Content-Type': 'application/json' },
        });

        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
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

                // Create enhanced error with API response details
                const enhancedError = new Error(error.response?.data?.error || error.message);
                enhancedError.status = error.response?.status;
                enhancedError.details = error.response?.data?.details;
                enhancedError.originalError = error;

                // For 404 and other status codes, use the error message from the API
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
            const response = await this.api.get(this.endpoint + this.normalizePath(path), { params });
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
