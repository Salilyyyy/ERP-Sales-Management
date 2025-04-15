import BaseRepository from './baseRepository';

class AuthRepository extends BaseRepository {
    constructor() {
        super('/auth');
        this.TOKEN_KEY = 'auth_token';
        this.USER_KEY = 'user';
    }

    async login(email, password) {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        if (typeof email !== 'string' || typeof password !== 'string') {
            throw new Error('Email and password must be strings');
        }

        try {
            const response = await this.post('/login', { email, password });

            if (!response || !response.token) {
                throw new Error('Invalid response: Missing token');
            }

            this.setAuthData(response.token, response.user);
            return response;
        } catch (error) {
            if (error.response) {
                const message = error.response.data?.error || 'Authentication failed';
                throw new Error(`Login failed: ${message}`);
            }
            if (error.request) {
                throw new Error('Server connection failed. Please check your internet connection.');
            }
            throw error;
        }
    }

   
    async logout() {
        try {
            this.clearAuthData();
            return true;
        } catch (error) {
            console.error('[Auth] Logout error:', error);
            throw new Error('Failed to complete logout process');
        }
    }

    getCurrentUser() {
        try {
            const userStr = localStorage.getItem(this.USER_KEY);
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('[Auth] Error getting current user:', error);
            this.clearAuthData(); 
            return null;
        }
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

  
    setAuthData(token, user) {
        if (!token || !user) {
            throw new Error('Invalid authentication data');
        }

        try {
            localStorage.setItem(this.TOKEN_KEY, token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        } catch (error) {
            console.error('[Auth] Error storing auth data:', error);
            throw new Error('Failed to store authentication data');
        }
    }

    clearAuthData() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }
}

export default new AuthRepository();
