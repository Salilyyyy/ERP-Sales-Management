import axios from 'axios';

class BaseRepository {
    constructor(endpoint = '') {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:10000';
        this.endpoint = endpoint;
        this.api = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
            maxRedirects: 0, 
            validateStatus: status => status < 500 
        });

        if (process.env.NODE_ENV === 'development') {
            console.log('Base URL:', this.baseURL);
            console.log('Endpoint:', this.endpoint);
        }

        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                if (process.env.NODE_ENV === 'development') {
                    console.log('Final Request URL:', config.baseURL + config.url);
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error('API Error:', error.response || error.message);
                return Promise.reject(this.handleError(error));
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

    handleError(error) {
        if (error.response) {
            const errorMessage = error.response.data.error || error.response.data.message || 'Đã xảy ra lỗi từ server.';
            return new Error(errorMessage);
        } else if (error.request) {
            return new Error('Không nhận được phản hồi từ server.');
        } else {
            return new Error(`Lỗi: ${error.message}`);
        }
    }
}

export default BaseRepository;
