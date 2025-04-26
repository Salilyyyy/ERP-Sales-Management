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
            const data = await this.get('', params);
            if (!data) {
                throw new Error('No data received from server');
            }
            return data;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch customers');
        }
    }

    async getById(id) {
        try {
            const data = await this.get(`/${id}`);
            return data;
        } catch (error) {
            throw this.handleError(error, 'Failed to fetch customer');
        }
    }

    async create(data) {
        try {
            const result = await this.post('', data);
            return result;
        } catch (error) {
            throw this.handleError(error, 'Failed to create customer');
        }
    }

    async update(id, data) {
        try {
            const result = await this.put(`/${id}`, data);
            return result;
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
            const data = await this.get('/export', {
                responseType: 'blob'
            });
            return data;
        } catch (error) {
            throw this.handleError(error, 'Failed to export customers');
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

export default new CustomerRepository();
