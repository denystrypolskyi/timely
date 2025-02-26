import axiosInstance from "./axiosPrivate";
import { userData } from "@/types/user.types";

class UserService {
  async getUser(): Promise<userData> {
    try {
      const response = await axiosInstance.get<userData>("/users/profile");
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch user");
    }
  }
}

export default new UserService();
