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
            // Handle specific error cases from baseRepository
            const errorMessage = error.message;
            if (errorMessage.includes('Invalid email or password')) {
                throw new Error('EMAIL_PASSWORD_INVALID');
            } else if (errorMessage.includes('User not found')) {
                throw new Error('USER_NOT_FOUND');
            } else if (errorMessage.includes('Account is locked')) {
                throw new Error('ACCOUNT_LOCKED');
            } else if (errorMessage.includes('Account is not verified')) {
                throw new Error('ACCOUNT_NOT_VERIFIED');
            } else if (!navigator.onLine) {
                throw new Error('NETWORK_ERROR');
            } else {
                throw new Error('SERVER_ERROR');
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

    async requestPasswordReset(email) {
        try {
            const response = await this.post('/forgot-password', { email });
            return response;
        } catch (error) {
            const errorMessage = error.message;
            if (errorMessage.includes('User not found')) {
                throw new Error('USER_NOT_FOUND');
            } else if (errorMessage.includes('Email not verified')) {
                throw new Error('EMAIL_NOT_VERIFIED');
            } else if (!navigator.onLine) {
                throw new Error('NETWORK_ERROR');
            } else {
                throw new Error('SERVER_ERROR');
            }
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
            const errorMessage = error.message;
            if (errorMessage.includes('Invalid or expired token')) {
                throw new Error('INVALID_RESET_TOKEN');
            } else if (errorMessage.includes('Password too weak')) {
                throw new Error('WEAK_PASSWORD');
            } else if (!navigator.onLine) {
                throw new Error('NETWORK_ERROR');
            } else {
                throw new Error('SERVER_ERROR');
            }
        }
    }

    async verifyResetToken(token) {
        try {
            const response = await this.get(`/verify-reset-token/${token}`);
            return response;
        } catch (error) {
            const errorMessage = error.message;
            if (errorMessage.includes('Invalid or expired token')) {
                throw new Error('INVALID_RESET_TOKEN');
            } else if (!navigator.onLine) {
                throw new Error('NETWORK_ERROR');
            } else {
                throw new Error('SERVER_ERROR');
            }
        }
    }
}

export default new AuthRepository();
