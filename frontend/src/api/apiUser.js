import BaseRepository from "./baseRepository";

class UserApi extends BaseRepository {
  route = "/users";

  getProfile = async () => {
    try {
      const response = await this.get(`${this.route}/profile`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  getAllUsers = async () => {
    try {
      const response = await this.get(`${this.route}`);

      if (!response) {
        return [];
      }

      let users = Array.isArray(response) ? response : [response];

      return users;
    } catch (error) {
      throw error;
    }
  };

  getUserById = async (id) => {
    try {
      return await this.get(`${this.route}/${id}`);
    } catch (error) {
      throw error;
    }
  };

  createUser = async (userData) => {
    try {
      return await this.post(this.route, userData);
    } catch (error) {
      throw error;
    }
  };

  updateUser = async (id, userData) => {
    try {
      return await this.put(`${this.route}/${id}`, userData);
    } catch (error) {
      throw error;
    }
  };

  deleteUser = async (id) => {
    try {
      const response = await this.delete(`${this.route}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  changePassword = async (passwordData) => {
    try {
      const response = await this.put(`${this.route}/change-password`, passwordData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  sendInvitationEmail = async (inviteData) => {
    try {
      const response = await this.post(`${this.route}/send-invitation`, inviteData);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  exportToPdf = async (userIds) => {
    try {
      const response = await this.api.post(this.route + '/export-pdf', { userIds }, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      throw error;
    }
  };
}

export const userApi = new UserApi();
