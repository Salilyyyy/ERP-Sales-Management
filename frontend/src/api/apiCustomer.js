import BaseRepository from './baseRepository';
import { toast } from 'react-toastify';

class CustomerRepository extends BaseRepository {
    constructor() {
        super('/customers');
    }

    async getAll(params = {}) {
        try {
            const data = await this.get('', params);
            
            if (!data) {
                throw new Error('Không nhận được dữ liệu từ máy chủ');
            }

            const customers = Array.isArray(data) ? data : [];
            

            return customers;
        } catch (error) {
            
            if (error.response?.status === 401) {
                toast.error('Vui lòng đăng nhập lại để tiếp tục');
                return [];
            }
            
            if (error.response?.status === 403) {
                toast.error('Bạn không có quyền truy cập danh sách khách hàng');
                return [];
            }

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

    async deleteCustomer(id) {
        try {
            const result = await super.delete(`/${id}`);
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

    async getNewCustomers() {
        try {
            const response = await this.get('/new-customers');
            return response || [];
        } catch (error) {
            toast.error('Không thể tải danh sách khách hàng mới');
            return [];
        }
    }

    async getNewCustomersCount() {
        try {
            const response = await this.get('/new-customers-count');
            return response.count || 0;
        } catch (error) {
            toast.error('Không thể tải số lượng khách hàng mới');
            return 0;
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
