import BaseRepository from './baseRepository';

class AuthRepository extends BaseRepository {
    constructor() {
        super('/auth');
    }

    async login(email, password) {
        try {
            const response = await this.post('/login', { email, password });

            if (response.token) {
                localStorage.setItem('auth_token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                return response;
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Login failed');
            } else if (error.request) {
                throw new Error('No response from server');
            } else {
                throw error;
            }
        }
    }

    async logout() {
        try {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            throw new Error('Failed to logout');
        }
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    isAuthenticated() {
        return !!localStorage.getItem('auth_token');
    }
}

export default new AuthRepository();
