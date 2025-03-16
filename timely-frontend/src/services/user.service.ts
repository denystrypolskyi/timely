import axiosInstance from "./axiosPrivate";
import { UserData } from "@/types/user.types";

class UserService {
  async getUser(): Promise<UserData> {
    try {
      const response = await axiosInstance.get<UserData>("/users/profile");
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch user");
    }
  }
}

export default new UserService();
