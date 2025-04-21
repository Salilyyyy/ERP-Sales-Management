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
      console.log('Making getAllUsers request');
      const response = await this.get(`${this.route}`);
      console.log('getAllUsers raw response:', response);

      if (!response) {
        console.log('No response data, returning empty array');
        return [];
      }

      // Convert single object to array if needed
      let users = Array.isArray(response) ? response : [response];
      console.log('Processed users array:', users);

      users.forEach(user => {
        console.log('User data:', {
          ID: user.ID,
          name: user.name,
          email: user.email,
          userType: user.userType,
          department: user.department,
        });
      });

      return users;
    } catch (error) {
      console.error('Error in getAllUsers:', error);
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
      const response = await this.post(this.route, userData);
      return response.data;
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
}

export const userApi = new UserApi();
