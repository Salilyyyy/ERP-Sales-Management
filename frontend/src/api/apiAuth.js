import BaseRepository from './baseRepository';

class AuthRepository extends BaseRepository {
    constructor() {
        super('/auth');
    }

    async login(email, password) {
        try {
            const response = await this.post('/login', { email, password });
            console.log('Login response:', response);
            if (response.token) {
                // Store token with Bearer prefix
                localStorage.setItem('auth_token', `Bearer ${response.token}`);
                localStorage.setItem('user', JSON.stringify(response.user));
                console.log('Auth token stored:', localStorage.getItem('auth_token'));
            } else {
                console.error('No token in login response');
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
        const token = localStorage.getItem('auth_token');
        console.log('Checking authentication, token:', token);
        return !!token;
    }
}

export default new AuthRepository();
