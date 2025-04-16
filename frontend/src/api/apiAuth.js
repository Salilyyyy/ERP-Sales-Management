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
            }
            return response;
        } catch (error) {
            console.error('Login error:', {
                message: error.message,
                details: error.details,
                status: error.status
            });
            throw error;
        }
    }

    async requestPasswordReset(email) {
        try {
            const response = await this.post('/forgot-password', { email });
            return response;
        } catch (error) {
            console.error('Password reset request error:', {
                message: error.message,
                details: error.details,
                status: error.status
            });
            
            // Pass the error through without modification
            throw error;
        }
    }

    async resetPassword(token, newPassword) {
        try {
            const response = await this.post('/reset-password', {
                token,
                newPassword
            });
            return response;
        } catch (error) {
            console.error('Reset password error:', {
                message: error.message,
                details: error.details,
                status: error.status
            });
            throw error;
        }
    }

    async logout() {
        try {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
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
