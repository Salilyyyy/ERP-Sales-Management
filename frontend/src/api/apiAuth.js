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

        try {
            const response = await this.post('/login', { email, password });
            if (!response || !response.token) {
                throw new Error('Invalid response: Missing token');
            }

            this.setAuthData(response.token, response.user);
            return response;

        } catch (error) {
            if (error.response) {
                const serverMessage = error.response.data?.error || "Unknown server error";
                const err = new Error(serverMessage);
                err.status = error.response.status;
                throw err;
            } else {
                throw new Error('Server connection failed. Please check your internet connection.');
            }
        }
    }

    logout() {
        try {
            this.clearAuthData();
            return true;
        } catch (error) {
            console.error('[Auth] Lỗi đăng xuất:', error);
            throw new Error('Không thể đăng xuất');
        }
    }

    getCurrentUser() {
        try {
            const userStr = localStorage.getItem(this.USER_KEY);
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('[Auth] Lỗi khi lấy user:', error);
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
        try {
            localStorage.setItem(this.TOKEN_KEY, token);
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        } catch (error) {
            console.error('Lỗi lưu thông tin đăng nhập:', error);
            throw new Error('Không thể lưu thông tin xác thực');
        }
    }

    clearAuthData() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
    }
}

export default new AuthRepository();
