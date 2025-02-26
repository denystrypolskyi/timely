import { hoursData } from "@/types/hours.types";
import axiosInstance from "./axiosInterceptor";

class WorkHoursService {
  async getWorkHours(): Promise<hoursData[]> {
    try {
      const response = await axiosInstance.get<hoursData[]>("/hours/user");
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch work hours");
    }
  }
}

export default new WorkHoursService();
