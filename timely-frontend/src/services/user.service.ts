import axiosInstance from "./axiosPrivate";
import { CreateUserRequest, User } from "@/types/user.types";
import { getApiErrorMessage } from "./apiError";
import authService from "./auth.service";
import axiosPublic from "./axiosPublic";

class UserService {
  getUser = async (): Promise<User | null> => {
    try {
      const response = await axiosPublic.get<User>("/users/profile");
      if (response.status !== 204) {
        return response.data;
      }

      return this.restoreUserFromRefreshToken();
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch user"));
    }
  };

  private restoreUserFromRefreshToken = async (): Promise<User | null> => {
    try {
      await authService.refreshSession();
      const response = await axiosPublic.get<User>("/users/profile");
      return response.status === 204 ? null : response.data;
    } catch {
      return null;
    }
  };

  async createUser(request: CreateUserRequest): Promise<User> {
    try {
      const response = await axiosInstance.post<User>("/users/register", request);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to create account"));
    }
  }
}

export default new UserService();
