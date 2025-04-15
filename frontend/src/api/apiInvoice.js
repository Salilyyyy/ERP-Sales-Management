import BaseRepository from './baseRepository';

class InvoiceRepository extends BaseRepository {
    constructor() {
        super('/invoices');
    }

    async getAll() {
        try {
            const response = await this.get();
            return response;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Failed to fetch invoices');
            } else if (error.request) {
                throw new Error('No response from server');
            } else {
                throw error;
            }
        }
    }

    async getById(id) {
        try {
            const response = await this.get(`/${id}`);
            return response;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Failed to fetch invoice');
            } else if (error.request) {
                throw new Error('No response from server');
            } else {
                throw error;
            }
        }
    }

    async create(data) {
        try {
            const response = await this.post('', data);
            return response;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Failed to create invoice');
            } else if (error.request) {
                throw new Error('No response from server');
            } else {
                throw error;
            }
        }
    }

    async update(id, data) {
        try {
            const response = await this.put(`/${id}`, data);
            return response;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Failed to update invoice');
            } else if (error.request) {
                throw new Error('No response from server');
            } else {
                throw error;
            }
        }
    }

    async delete(id) {
        try {
            const response = await this.delete(`/${id}`);
            return response;
        } catch (error) {
            if (error.response) {
                throw new Error(error.response.data.error || 'Failed to delete invoice');
            } else if (error.request) {
                throw new Error('No response from server');
            } else {
                throw error;
            }
        }
    }
}

export default new InvoiceRepository();
