import BaseRepository from "./baseRepository";

class PromotionRepository extends BaseRepository {
    constructor() {
        super("/promotions");
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
            this.handleError(error, "Failed to fetch promotions");
        }
    }

    async getById(id) {
        try {
            const response = await this.get(`/${id}`);
            return response;
        } catch (error) {
            this.handleError(error, "Failed to fetch promotion");
        }
    }

    async create(data) {
        try {
            const response = await this.post("", data);
            return response;
        } catch (error) {
            this.handleError(error, "Failed to create promotion");
        }
    }

    async update(id, data) {
        try {
            const response = await this.put(`/${id}`, data);
            return response;
        } catch (error) {
            this.handleError(error, "Failed to update promotion");
        }
    }

    async deletePromotion(id) {
        try {
            const response = await this.api.delete(`${this.endpoint}/${id}`);
            return response.data;
        } catch (error) {
            this.handleError(error, "Failed to delete promotion");
        }
    }
}

export default new PromotionRepository();
