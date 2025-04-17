import BaseRepository from "./baseRepository";

class PostOfficeRepository extends BaseRepository {
    constructor() {
        super("/post-offices");
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
            this.handleError(error, "Failed to fetch post offices");
        }
    }

    async getById(id) {
        try {
            const response = await this.get(`/${id}`);
            return response;
        } catch (error) {
            this.handleError(error, "Failed to fetch post office");
        }
    }

    async create(data) {
        try {
            const response = await this.post("", data);
            return response;
        } catch (error) {
            this.handleError(error, "Failed to create post office");
        }
    }

    async update(id, data) {
        try {
            const response = await this.put(`/${id}`, data);
            return response;
        } catch (error) {
            this.handleError(error, "Failed to update post office");
        }
    }

    async delete(id) {
        try {
            const response = await this.delete(`/${id}`);
            return response;
        } catch (error) {
            this.handleError(error, "Failed to delete post office");
        }
    }
}
export default new PostOfficeRepository();
