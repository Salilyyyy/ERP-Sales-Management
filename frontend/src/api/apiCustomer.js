import BaseRepository from './baseRepository';

class CustomerRepository extends BaseRepository {
    constructor() {
        super('/customers');
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
            console.log('Customer data received:', response);
            return response;
        } catch (error) {
            console.error('Customer fetch error:', error);
            throw this.handleError(error, 'Failed to fetch customers');
        }
    }

    async getById(id) {
        try {
            const response = await this.get(`/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch customer');
        }
    }

    async create(data) {
        try {
            const response = await this.post('', data);
            return response.data;
        } catch (error) {
            throw this.handleError(error, 'Failed to create customer');
        }
    }

    async update(id, data) {
        try {
            const response = await this.put(`/${id}`, data);
            return response.data;
        } catch (error) {
            throw this.handleError(error, 'Failed to update customer');
        }
    }

    async delete(id) {
        try {
            await this.remove(`/${id}`);
        } catch (error) {
            throw this.handleError(error, 'Failed to delete customer');
        }
    }

    async deleteMultiple(ids) {
        try {
            await this.post('/delete-multiple', { ids });
        } catch (error) {
            throw this.handleError(error, 'Failed to delete customers');
        }
    }

    async export() {
        try {
            const response = await this.get('/export', {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error, 'Failed to export customers');
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

export default new CustomerRepository();
