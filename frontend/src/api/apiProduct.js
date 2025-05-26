import BaseRepository from './baseRepository';

class ProductRepository extends BaseRepository {
    constructor() {
        super('/products');
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
            this.handleError(error, 'Failed to fetch products');
        }
    }

    async getById(id) {
        try {
            const response = await this.get(`/${id}`);
            return response;
        } catch (error) {
            this.handleError(error, 'Failed to fetch product');
        }
    }

    async create(data) {
        try {
            const response = await this.post('', {
                produceCategoriesID: data.produceCategoriesID,
                unit: data.unit,
                image: data.image,
                name: data.name,
                weight: data.weight,
                length: data.length,
                width: data.width,
                height: data.height,
                supplierID: data.supplierID,
                origin: data.origin,
                inPrice: data.inPrice,
                outPrice: data.outPrice,
                quantity: data.quantity,
                title: data.title,
                description: data.description
            });
            return response;
        } catch (error) {
            this.handleError(error, 'Failed to create product');
        }
    }

    async update(id, data) {
        try {
            const response = await this.put(`/${id}`, {
                produceCategoriesID: data.produceCategoriesID,
                unit: data.unit,
                image: data.image,
                name: data.name,
                weight: data.weight,
                length: data.length,
                width: data.width,
                height: data.height,
                supplierID: data.supplierID,
                origin: data.origin,
                inPrice: data.inPrice,
                outPrice: data.outPrice,
                quantity: data.quantity,
                title: data.title,
                description: data.description
            });
            return response;
        } catch (error) {
            this.handleError(error, 'Failed to update product');
        }
    }

    async delete(id) {
        try {
            const response = await super.delete(`/${id}`);
            return response;
        } catch (error) {
            this.handleError(error, 'Failed to delete product');
        }
    }
}

export default new ProductRepository();
