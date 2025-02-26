import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth.types";
import axiosPublic from "./axiosPublic"; 

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await axiosPublic.post<LoginResponse>(
        "/users/login",
        credentials
      );

      return response.data;
    } catch (error) {
      throw new Error("Login failed");
    }
  }

  async register(credentials: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await axiosPublic.post<RegisterResponse>(
        "/users/register",
        credentials
      );

      return response.data;
    } catch (error) {
      throw new Error("Registration failed");
    }
  }
}

export default new AuthService();
