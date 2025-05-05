import BaseRepository from './baseRepository';
import { toast } from 'react-toastify';

class CustomerRepository extends BaseRepository {
    constructor() {
        super('/customers');
    }

    async getAll(params = {}) {
        try {
            console.log('Fetching customers...');
            const data = await this.get('', params);
            console.log('Customer data received:', data);
            
            // Ensure we have valid data
            if (!data) {
                console.error('No data received from server');
                throw new Error('Không nhận được dữ liệu từ máy chủ');
            }

            // Convert response to array if needed
            const customers = Array.isArray(data) ? data : [];
            
            // Log the result
            console.log(`Retrieved ${customers.length} customers`);
            if (customers.length === 0) {
                console.log('Note: Customer list is empty');
            } else {
                console.log('First customer:', customers[0]);
            }

            return customers;
        } catch (error) {
            console.error('Error in getAll customers:', error);
            
            // Check for specific error types
            if (error.response?.status === 401) {
                toast.error('Vui lòng đăng nhập lại để tiếp tục');
                return [];
            }
            
            if (error.response?.status === 403) {
                toast.error('Bạn không có quyền truy cập danh sách khách hàng');
                return [];
            }

            // For other errors, show a generic message
            toast.error('Không thể tải danh sách khách hàng');
            return [];
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
