import axiosInstance from "./axiosPrivate";
import { CreateUserRequest, UpdateTimeZoneRequest, User } from "@/types/user.types";
import { getApiErrorMessage } from "./apiError";
import axiosPublic from "./axiosPublic";

class UserService {
  getUser = async (): Promise<User | null> => {
    try {
      const response = await axiosPublic.get<User>("/users/profile");
      if (response.status !== 204) {
        return response.data;
      }

      return null;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch user"));
    }
  };

  async createUser(request: CreateUserRequest): Promise<User> {
    try {
      const response = await axiosInstance.post<User>("/users/register", request);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to create account"));
    }
  }

  async updateTimeZone(request: UpdateTimeZoneRequest): Promise<User> {
    try {
      const response = await axiosInstance.patch<User>("/users/timezone", request);
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, "Failed to update time zone"));
    }
  }
}

export default new UserService();
