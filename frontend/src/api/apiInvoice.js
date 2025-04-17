import BaseRepository from './baseRepository';

class InvoiceRepository extends BaseRepository {
    constructor() {
        super('/invoices');
    }

    handleError(error, fallbackMessage = 'Operation failed') {
        if (error.response) {
            throw new Error(error.response.data.error || fallbackMessage);
        } else if (error.request) {
            throw new Error('No response from server');
        } else {
            throw error;
        }
    }

    async getAll(params = {}) {
        try {
            const response = await this.get('', {
                page: params.page || 1,
                limit: params.limit || 10,
                customerID: params.customerID,
                startDate: params.startDate,
                endDate: params.endDate,
                paymentMethod: params.paymentMethod,
                sortBy: params.sortBy || 'exportTime',
                sortOrder: params.sortOrder || 'desc'
            });

            const formattedData = response.data?.map(this.formatInvoiceResponse);
            return { ...response, data: formattedData };
        } catch (error) {
            this.handleError(error, 'Failed to fetch invoices');
        }
    }

    async getById(id) {
        try {
            const response = await this.get(`/${id}`);
            return response; // Return full response without formatting
        } catch (error) {
            this.handleError(error, 'Failed to fetch invoice');
        }
    }

    async create(data) {
        try {
            const response = await this.post('', data);
            return response;
        } catch (error) {
            this.handleError(error, 'Failed to create invoice');
        }
    }

    async update(id, data) {
        try {
            const response = await this.put(`/${id}`, data);
            return response;
        } catch (error) {
            this.handleError(error, 'Failed to update invoice');
        }
    }
    async delete(id) {
        try {
            const response = await super.delete(`/${id}`);
            return response;
        } catch (error) {
            this.handleError(error, 'Failed to delete invoice');
        }
    }

    formatInvoiceResponse(invoice) {
        return {
            id: invoice.ID,
            createdAt: invoice.exportTime,
            customerName: invoice.Customers?.name || 'Không xác định',
            totalAmount: parseFloat(invoice.totalAmount).toFixed(2), 
            isPaid: !!invoice.isPaid, 
            isDelivered: !!invoice.isDelivery 
        };
    }
}

export default new InvoiceRepository();
