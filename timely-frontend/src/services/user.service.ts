import axiosInstance, { refreshAccessToken } from "./axiosPrivate";
import { CreateUserRequest, UpdateTimeZoneRequest, User } from "@/types/user.types";
import { getApiErrorMessage } from "./apiError";

class UserService {
  getUser = async (): Promise<User | null> => {
    try {
      let response = await axiosInstance.get<User>("/users/profile");
      if (response.status !== 204) {
        return response.data;
      }
      // An expired access cookie makes the public profile endpoint return 204.
      try {
        await refreshAccessToken();
        response = await axiosInstance.get<User>("/users/profile");
        return response.status === 204 ? null : response.data;
      } catch {
        return null;
      }
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
