import BaseRepository from './baseRepository';

class AuthRepository extends BaseRepository {
    constructor() {
        super('/auth');
    }

    async login(email, password, rememberMe = false) {
        try {
            const response = await this.post('/login', { email, password, rememberMe });
                localStorage.setItem('auth_token', `Bearer ${response.token}`);
                localStorage.setItem('user', JSON.stringify(response.user));
            return response;
        } catch (error) {
            throw error;
        }
    }

    async requestPasswordReset(email) {
        try {
            const response = await this.post('/forgot-password', { email });
            return response;
        } catch (error) {
            
            throw error;
        }
    }

    async verifyResetToken(token) {
        try {
            const response = await this.get(`/verify-reset-token/${token}`);
            return response;
        } catch (error) {
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
            throw error;
        }
    }

    async logout() {
        try {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            return true;
        } catch (error) {
            throw error;
        }
    }

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    isAuthenticated() {
        const token = localStorage.getItem('auth_token');
        return !!token;
    }
}

export default new AuthRepository();
