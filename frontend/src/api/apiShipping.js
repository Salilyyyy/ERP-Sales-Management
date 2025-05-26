import BaseRepository from "./baseRepository";

class ShippingRepository extends BaseRepository {
    constructor() {
        super("/shipments");
    }

    handleError(error, fallbackMessage = "Operation failed") {
        if (error.response) {
            throw new Error(error.response.data.error || fallbackMessage);
        } else if (error.request) {
            throw new Error("No response from server");
        } else {
            throw error;
        }
    }

    async getAll(params = {}) {
        try {
            const response = await this.get("", params);
            return response;
        } catch (error) {
            this.handleError(error, "Failed to fetch shipments");
        }
    }

    async getById(id) {
        try {
            const response = await this.get(`/${id}`);
            return response;
        } catch (error) {
            this.handleError(error, "Failed to fetch shipment");
        }
    }

    async create(data) {
        try {
            const response = await this.post("", data);
            return response;
        } catch (error) {
            this.handleError(error, "Failed to create shipment");
        }
    }

    async update(id, data) {
        try {
            const response = await this.put(`/${id}`, data);
            return response;
        } catch (error) {
            this.handleError(error, "Failed to update shipment");
        }
    }

    async delete(id) {
        try {
            const response = await super.delete(`/${id}`);
            return response;
        } catch (error) {
            this.handleError(error, "Failed to delete shipment");
        }
    }
}

export default new ShippingRepository();
