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
        this.cache = new Map();
        this.cacheTimeout = 60000; 

        this.api = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 30000 
        });

        this.api.interceptors.request.use(async (config) => {
            const token = localStorage.getItem('auth_token');

            if (!token && !config.url.includes('/auth')) {
                throw new Error('Authentication required');
            }

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

                if (error.response?.status === 401 || error.response?.status === 403) {
                    const isTokenError = error.response?.data?.error?.includes('Invalid or expired token');
                    const rememberMe = localStorage.getItem('remember_me') === 'true';
                    
                    if (isTokenError && !rememberMe && !window.location.pathname.includes('login')) {
                        localStorage.removeItem('auth_token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                        const errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                        toast.error(errorMessage);
                        return Promise.reject(new Error(errorMessage));
                    }
                    
                    const errorMessage = error.response?.data?.error || 'Bạn không có quyền truy cập';
                    toast.error(errorMessage);
                    return Promise.reject(new Error(errorMessage));
                }

                if (error.response?.data?.error?.includes("Unique constraint failed on the fields: (`email`)")) {
                    const errorMessage = "Email đã được đăng ký. Vui lòng sử dụng email khác";
                    toast.error(errorMessage);
                    const enhancedError = new Error(errorMessage);
                    enhancedError.status = error.response?.status;
                    enhancedError.isValidationError = true;
                    return Promise.reject(enhancedError);
                }

                const errorMessage = error.response?.data?.error || error.message;
                toast.error(errorMessage);

                const enhancedError = new Error(errorMessage);
                enhancedError.status = error.response?.status;
                enhancedError.details = error.response?.data?.details;
                enhancedError.originalError = error;

                return Promise.reject(enhancedError);
            }
        );
    }

    normalizePath(path) {
        return path.startsWith('/') ? path : `/${path}`;
    }

    async waitForAuth() {
        let attempts = 0;
        const maxAttempts = 5;
        const delay = 100;

        while (attempts < maxAttempts) {
            const token = localStorage.getItem('auth_token');
            if (token) return true;
            await new Promise(resolve => setTimeout(resolve, delay));
            attempts++;
        }
        return false;
    }

    async get(path = '', params = {}, maxRetries = 3) {
        if (!path.includes('/auth')) {
            await this.waitForAuth();
        }
        const requestKey = `${this.endpoint}${this.normalizePath(path)}`;
        const cacheKey = `${requestKey}${JSON.stringify(params)}`;
        
        const cachedData = this.cache.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < this.cacheTimeout)) {
            return cachedData.data;
        }

        BaseRepository.setLoadingState(requestKey, true);
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                const response = await this.api.get(this.endpoint + this.normalizePath(path), { params });
                BaseRepository.setLoadingState(requestKey, false);

                if (!response || !response.data) {
                    return [];
                }

                this.cache.set(cacheKey, {
                    data: response.data,
                    timestamp: Date.now()
                });

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

    async post(path = '', data = {}, config = {}, maxRetries = 3) {
        const requestKey = `${this.endpoint}${this.normalizePath(path)}`;
        BaseRepository.setLoadingState(requestKey, true);

        let attempts = 0;
        const backoffDelay = 1000; 

        while (attempts < maxRetries) {
            try {
                const response = await this.api.post(
                    this.endpoint + this.normalizePath(path),
                    data,
                    {
                        ...config,
                    timeout: 30000 // Increased timeout for larger data fetches
                    }
                );
                BaseRepository.setLoadingState(requestKey, false);

                this.invalidateRelatedCache(path);

                if (response.status === 204) return null;
                if (!response || !response.data) {
                    throw new Error('Invalid API response received');
                }

                return response.data;
            } catch (error) {
                attempts++;
                
                if (attempts === maxRetries || error.isValidationError) {
                    BaseRepository.setLoadingState(requestKey, false);
                    throw error;
                }

                const jitter = Math.random() * 100;
                const delay = Math.min(backoffDelay * Math.pow(2, attempts) + jitter, 5000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    async put(path = '', data = {}, maxRetries = 3) {
        const requestKey = `${this.endpoint}${this.normalizePath(path)}`;
        BaseRepository.setLoadingState(requestKey, true);

        let attempts = 0;
        const backoffDelay = 1000;

        while (attempts < maxRetries) {
            try {
                const response = await this.api.put(
                    this.endpoint + this.normalizePath(path),
                    data,
                    { timeout: 30000 } // Increased timeout for larger data fetches
                );
                BaseRepository.setLoadingState(requestKey, false);

                this.invalidateRelatedCache(path);

                return response.data;
            } catch (error) {
                attempts++;
                if (attempts === maxRetries) {
                    BaseRepository.setLoadingState(requestKey, false);
                    throw error;
                }

                const jitter = Math.random() * 100;
                const delay = Math.min(backoffDelay * Math.pow(2, attempts) + jitter, 5000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    async delete(path = '', maxRetries = 3) {
        const requestKey = `${this.endpoint}${this.normalizePath(path)}`;
        BaseRepository.setLoadingState(requestKey, true);

        let attempts = 0;
        const backoffDelay = 1000;

        while (attempts < maxRetries) {
            try {
                const response = await this.api.delete(
                    this.endpoint + this.normalizePath(path),
                    { timeout: 30000 } // Increased timeout for larger data fetches
                );
                BaseRepository.setLoadingState(requestKey, false);

                this.invalidateRelatedCache(path);

                return response.data;
            } catch (error) {
                attempts++;
                if (attempts === maxRetries) {
                    BaseRepository.setLoadingState(requestKey, false);
                    throw error;
                }

                const jitter = Math.random() * 100;
                const delay = Math.min(backoffDelay * Math.pow(2, attempts) + jitter, 5000);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    invalidateRelatedCache(path) {
        const pathSegments = path.split('/').filter(Boolean);
        if (pathSegments.length === 0) return;

        const resourceType = pathSegments[0];
        
        // Clear all cached data for this resource type and related queries
        for (const [key] of this.cache) {
            // Clear exact resource matches
            if (key.includes(resourceType)) {
                this.cache.delete(key);
            }
            // Clear list queries that might contain this resource
            if (key.includes(`${this.endpoint}`) || key.includes('?')) {
                this.cache.delete(key);
            }
        }
        
        // Force cache invalidation for the base endpoint
        this.cache.delete(this.endpoint);
    }
}

export default BaseRepository;
