import { LoginCredentials } from "../types/auth.types";
import axiosPublic from "./axiosPublic";
import { getApiErrorMessage } from "./apiError";

class AuthService {
  async login(credentials: LoginCredentials): Promise<void> {
    try {
      await axiosPublic.post("/users/login", credentials);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Login failed"));
    }
  }

  async logout(): Promise<void> {
    try {
      await axiosPublic.post("/users/logout");
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Logout failed"));
    }
  }
}

export default new AuthService();
