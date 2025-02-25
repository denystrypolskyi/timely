import axios from "axios";
import axiosInstance from "./axiosInterceptor";

class UserService {
  async getUser(): Promise<{ username: string | undefined }> {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        return { username: undefined };
      }
      const response = await axiosInstance.get<{ username: string }>(
        "/users/profile"
      );
      return response.data;
    } catch (error) {
      localStorage.removeItem("jwtToken");
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data.message || "Failed to fetch username"
        );
      } else {
        throw new Error("Failed to fetch username");
      }
    }
  }
}

export default new UserService();
