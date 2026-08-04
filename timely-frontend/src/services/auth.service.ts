import { LoginCredentials } from "../types/auth.types";
import axiosPublic from "./axiosPublic";
import { getApiErrorMessage } from "./apiError";

let refreshRequest: Promise<void> | null = null;

class AuthService {
  async login(credentials: LoginCredentials): Promise<void> {
    try {
      await axiosPublic.post("/users/login", credentials);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Login failed"));
    }
  }

  refreshSession(): Promise<void> {
    if (!refreshRequest) {
      refreshRequest = axiosPublic
        .post("/users/refresh")
        .then(() => undefined)
        .finally(() => {
          refreshRequest = null;
        });
    }
    return refreshRequest;
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
