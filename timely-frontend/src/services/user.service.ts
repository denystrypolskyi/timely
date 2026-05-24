import axiosInstance from "./axiosPrivate";
import { User } from "@/types/user.types";
import { getApiErrorMessage } from "./apiError";

class UserService {
  async getUser(): Promise<User> {
    try {
      const response = await axiosInstance.get<User>("/users/profile");
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch user"));
    }
  }
}

export default new UserService();
