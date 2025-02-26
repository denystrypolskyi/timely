import { AddHoursData, hoursData } from "@/types/hours.types";
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
  
  async addWorkHours(data: AddHoursData): Promise<hoursData> {
    try {
      const response = await axiosInstance.post<hoursData>("/hours", data);
      return response.data;
    } catch (error) {
      throw new Error("Failed to add work hours");
    }
  }
}

export default new WorkHoursService();
