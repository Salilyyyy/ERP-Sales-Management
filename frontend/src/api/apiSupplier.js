import BaseRepository from './baseRepository';

class SupplierRepository extends BaseRepository {
    constructor() {
        super('/suppliers');
    }

    async getAll(params = {}) {
        try {
            if (!localStorage.getItem('auth_token')) {
                throw new Error('No authentication token found');
            }
            const response = await this.get('', params);
            if (!response) {
                throw new Error('No data received from server');
            }
            console.log('Supplier data received:', response);
            return response;
        } catch (error) {
            console.error('Supplier fetch error:', error);
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

    async delete(id) {
        try {
            await this.delete(`/${id}`);
        } catch (error) {
            throw this.handleError(error, 'Failed to delete supplier');
        }
    }

    handleError(error, fallbackMessage = 'Operation failed') {
        console.error('Error details:', error);
        if (error.response) {
            const errorMessage = error.response.data?.error || fallbackMessage;
            console.error('Server error response:', errorMessage);
            throw new Error(errorMessage);
        } else if (error.request) {
            console.error('No response received:', error.request);
            throw new Error('No response from server');
        } else {
            console.error('Error:', error.message);
            throw new Error(fallbackMessage);
        }
    }
}

export default new SupplierRepository();
