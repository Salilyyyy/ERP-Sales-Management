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
                const message = error.response?.data?.error || error.message || 'Đã xảy ra lỗi không xác định';
                return Promise.reject(new Error(message));
            }
        );
    }

    normalizePath(path) {
        return path.startsWith('/') ? path : `/${path}`;
    }

    async get(path = '', params = {}) {
        const response = await this.api.get(this.endpoint + this.normalizePath(path), { params });
        return response.data;
    }

    async post(path = '', data = {}) {
        const response = await this.api.post(this.endpoint + this.normalizePath(path), data);
        return response.data;
    }

    async put(path = '', data = {}) {
        const response = await this.api.put(this.endpoint + this.normalizePath(path), data);
        return response.data;
    }

    async delete(path = '') {
        const response = await this.api.delete(this.endpoint + this.normalizePath(path));
        return response.data;
    }
}

export default BaseRepository;
