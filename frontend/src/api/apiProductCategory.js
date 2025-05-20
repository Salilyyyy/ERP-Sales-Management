import BaseRepository from './baseRepository';

class ProductCategoryRepository extends BaseRepository {
    constructor() {
        super('/product-categories');
    }

    async getAll(params = {}) {
        try {
            const response = await this.get('', params);
            return Array.isArray(response) ? response : [];
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch product categories');
        }
    }

    async getById(id) {
        try {
            const response = await this.get(`/${id}`);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch product category');
        }
    }

    async create(data) {
        try {
            const response = await this.post('', data);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to create product category');
        }
    }

    async update(id, data) {
        try {
            const response = await this.put(`/${id}`, data);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to update product category');
        }
    }

    async delete(id) {
        try {
            await this.delete(`/${id}`);
        } catch (error) {
            throw this.handleError(error, 'Failed to delete product category');
        }
    }

    async deleteMultiple(ids) {
        try {
            await this.post('/delete-multiple', { ids });
        } catch (error) {
            throw this.handleError(error, 'Failed to delete product categories');
        }
    }

    async export() {
        try {
            const response = await this.api.get(this.endpoint + '/export', {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error, 'Failed to export product categories');
        }
    }

    handleError(error, fallbackMessage = 'Operation failed') {
        if (error.response) {
            throw new Error(error.response.data.error || fallbackMessage);
        } else if (error.request) {
            throw new Error('No response from server');
        } else {
            throw new Error(fallbackMessage);
        }
    }

    isAuthenticated() {
        const token = localStorage.getItem('auth_token');
        console.log('Checking authentication, token:', token);
        return !!token;
    }
}

export default new ProductCategoryRepository();
