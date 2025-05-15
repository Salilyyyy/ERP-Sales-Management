import BaseRepository from './baseRepository';

class StockInRepository extends BaseRepository {
    constructor() {
        super('/stockins');
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
            const response = await this.get('', params);
            return response;
        } catch (error) {
            this.handleError(error, 'Failed to fetch stock-ins');
        }
    }

    async getById(id) {
        try {
            const response = await this.get(`/${id}`);
            return response;
        } catch (error) {
            this.handleError(error, 'Failed to fetch stock-in');
        }
    }

    async create(data) {
        try {
            const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Unknown';
            const response = await this.post('', {
                stockinDate: data.stockinDate,
                notes: data.notes,
                supplierID: data.supplierID,
                updatedBy: currentUser,
                DetailStockins: data.DetailStockins.map(detail => ({
                    productID: detail.productID,
                    quantity: detail.quantity,
                    unitPrice: detail.unitPrice
                }))
            });
            return response;
        } catch (error) {
            this.handleError(error, 'Failed to create stock-in');
        }
    }

    async update(id, data) {
        try {
            const stockinDate = new Date(data.stockinDate);
            const isoDate = stockinDate.toISOString();
            const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Unknown';

            const response = await this.put(`/${id}`, {
                stockinDate: isoDate,
                notes: data.notes,
                supplierID: data.supplierID,
                updatedBy: currentUser,
                DetailStockins: data.DetailStockins.map(detail => ({
                    ID: detail.ID,
                    productID: detail.productID,
                    quantity: detail.quantity,
                    unitPrice: detail.unitPrice
                }))
            });
            return response;
        } catch (error) {
            this.handleError(error, 'Failed to update stock-in');
        }
    }

    async deleteStockIn(id) {
        try {
            const response = await super.delete(`/${id}`);
            return response;
        } catch (error) {
            this.handleError(error, 'Failed to delete stock-in');
        }
    }

    async getDetailsByStockInId(stockInId) {
        try {
            const response = await this.get(`/${stockInId}/details`);
            return response;
        } catch (error) {
            this.handleError(error, 'Failed to fetch stock-in details');
        }
    }

    async addDetail(stockInId, detailData) {
        try {
            const response = await this.post(`/${stockInId}/details`, {
                productID: detailData.productID,
                quantity: detailData.quantity,
                unitPrice: detailData.unitPrice
            });
            return response;
        } catch (error) {
            this.handleError(error, 'Failed to add stock-in detail');
        }
    }

    async updateDetail(stockInId, detailId, detailData) {
        try {
            const response = await this.put(`/${stockInId}/details/${detailId}`, {
                productID: detailData.productID,
                quantity: detailData.quantity,
                unitPrice: detailData.unitPrice
            });
            return response;
        } catch (error) {
            this.handleError(error, 'Failed to update stock-in detail');
        }
    }

    async deleteDetail(stockInId, detailId) {
        try {
            const response = await super.delete(`/${stockInId}/details/${detailId}`);
            const updatedData = await this.getById(stockInId);
            return updatedData;
        } catch (error) {
            this.handleError(error, 'Failed to delete stock-in detail');
        }
    }
}

export default new StockInRepository();
