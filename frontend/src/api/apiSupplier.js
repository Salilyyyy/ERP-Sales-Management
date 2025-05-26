import BaseRepository from './baseRepository';

class SupplierRepository extends BaseRepository {
    constructor() {
        super('/suppliers');
    }

    async getAll(params = {}) {
        try {
            const response = await this.get('', params);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch suppliers');
        }
    }

    async getById(id) {
        try {
            const response = await this.get(`/${id}`);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch supplier');
        }
    }

    async create(data) {
        try {
            const response = await this.post('', data);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to create supplier');
        }
    }

    async update(id, data) {
        try {
            const response = await this.put(`/${id}`, data);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to update supplier');
        }
    }

    async deleteSupplier(id) {
        try {
            const response = await this.delete(`/${id}`);
            return response;
        } catch (error) {
            throw this.handleError(error, 'Failed to delete supplier');
        }
    }

    handleError(error, fallbackMessage = 'Operation failed') {
        console.error('Error details:', error);
        if (error.response) {
            const errorMessage = error.response.data?.error || fallbackMessage;
            throw new Error(errorMessage);
        } else if (error.request) {
            throw new Error('No response from server');
        } else {
            throw new Error(fallbackMessage);
        }
    }
}

export default new SupplierRepository();
