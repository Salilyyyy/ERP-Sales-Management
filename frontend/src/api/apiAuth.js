import BaseRepository from './baseRepository';

class AuthRepository extends BaseRepository {
    constructor() {
        super('/auth'); 
    }

    async login(email, password) {
        const response = await this.post('/login', { email, password });

        if (response.token) {
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
        }

        return response;
    }

    async logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        return true;
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
