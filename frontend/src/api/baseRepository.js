import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const loadingStates = new Map();

class BaseRepository {
    static getLoadingState(key) {
        return loadingStates.get(key) || false;
    }

    static setLoadingState(key, value) {
        loadingStates.set(key, value);
    }

    constructor(endpoint = '') {
        this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:10000/';
        this.endpoint = endpoint;

        this.api = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000
        });

        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem('auth_token');

            if (token) {
                const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
                config.headers.Authorization = formattedToken;
            }
            return config;
        }, (error) => {
            return Promise.reject(error);
        });

        this.api.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                console.error('API Error:', error);
                console.error('Error response:', error.response);

                if (error.response?.status === 401) {
                    const errorMessage = error.response?.data?.error || 'Vui lòng đăng nhập để tiếp tục';
                    toast.error(errorMessage);
                    if (!window.location.pathname.includes('login')) {
                        localStorage.removeItem('auth_token');
                        window.location.href = '/login';
                    }
                    return Promise.reject(new Error(errorMessage));
                }

                if (error.response?.status === 403) {
                    const errorMessage = error.response?.data?.error || 'Bạn không có quyền truy cập';
                    toast.error(errorMessage);
                    return Promise.reject(new Error(errorMessage));
                }

                const errorMessage = error.response?.data?.error || error.message;
                toast.error(errorMessage);

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

    async get(path = '', params = {}, maxRetries = 3) {
        const requestKey = `${this.endpoint}${this.normalizePath(path)}`;
        BaseRepository.setLoadingState(requestKey, true);

        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                const response = await this.api.get(this.endpoint + this.normalizePath(path), { params });

                BaseRepository.setLoadingState(requestKey, false);

                if (response && response.data === null) {
                    return [];
                }

                if (!response || !response.data) {
                    throw new Error('Invalid API response received');
                }

                if (Array.isArray(response.data)) {
                    return response.data;
                }

                return response.data;
            } catch (error) {
                attempts++;

                if (attempts === maxRetries) {
                    BaseRepository.setLoadingState(requestKey, false);
                    throw error;
                }

                await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempts), 2000)));
            }
        }
    }

    async post(path = '', data = {}, maxRetries = 3) {
        const requestKey = `${this.endpoint}${this.normalizePath(path)}`;
        BaseRepository.setLoadingState(requestKey, true);

        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                const response = await this.api.post(this.endpoint + this.normalizePath(path), data);
                BaseRepository.setLoadingState(requestKey, false);
                return response.data;
            } catch (error) {
                attempts++;

                if (attempts === maxRetries) {
                    BaseRepository.setLoadingState(requestKey, false);
                    throw error;
                }

                await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempts), 5000)));
            }
        }
    }

    async put(path = '', data = {}, maxRetries = 3) {
        const requestKey = `${this.endpoint}${this.normalizePath(path)}`;
        BaseRepository.setLoadingState(requestKey, true);

        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                const response = await this.api.put(this.endpoint + this.normalizePath(path), data);
                BaseRepository.setLoadingState(requestKey, false);
                return response.data;
            } catch (error) {
                attempts++;
                console.error(`PUT request attempt ${attempts} failed:`, error);

                if (attempts === maxRetries) {
                    BaseRepository.setLoadingState(requestKey, false);
                    throw error;
                }

                await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempts), 5000)));
            }
        }
    }

    async delete(path = '', maxRetries = 3) {
        const requestKey = `${this.endpoint}${this.normalizePath(path)}`;
        BaseRepository.setLoadingState(requestKey, true);

        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                const response = await this.api.delete(this.endpoint + this.normalizePath(path));
                BaseRepository.setLoadingState(requestKey, false);
                return response.data;
            } catch (error) {
                attempts++;

                if (attempts === maxRetries) {
                    BaseRepository.setLoadingState(requestKey, false);
                    throw error;
                }

                await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempts), 5000)));
            }
        }
    }
}

export default BaseRepository;
