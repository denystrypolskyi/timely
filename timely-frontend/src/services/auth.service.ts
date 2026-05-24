import {
  AuthTokenResponse,
  LoginCredentials,
  RegisteredUser,
  RegisterPayload,
} from "../types/auth.types";
import axiosPublic from "./axiosPublic";
import { getApiErrorMessage } from "./apiError";

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthTokenResponse> {
    try {
      const response = await axiosPublic.post<AuthTokenResponse>(
        "/users/login",
        credentials
      );

      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Login failed"));
    }
  }

  async register(credentials: RegisterPayload): Promise<RegisteredUser> {
    try {
      const response = await axiosPublic.post<RegisteredUser>(
        "/users/register",
        credentials
      );

      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Registration failed"));
    }
  }
}

export default new AuthService();
