import axios from "axios";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth.types";
import axiosInstance from "./axiosInterceptor";

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axiosInstance.post<LoginResponse>(
        "/users/login",
        credentials
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data.message || "Login failed");
      } else {
        throw new Error("Login failed");
      }
    }
  }

  async register(credentials: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await axiosInstance.post<RegisterResponse>(
        "/users/register",
        credentials
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data.message || "Registration failed");
      } else {
        throw new Error("Registration failed");
      }
    }
  }
}

export default new AuthService();
