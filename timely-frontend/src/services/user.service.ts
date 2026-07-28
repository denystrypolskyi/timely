import axiosInstance from "./axiosPrivate";
import { CreateUserRequest, User } from "@/types/user.types";
import { getApiErrorMessage } from "./apiError";

class UserService {
  async getUser(): Promise<User | null> {
    try {
      const response = await axiosInstance.get<User>("/users/profile");
      return response.status === 204 ? null : response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch user"));
    }
  }

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
