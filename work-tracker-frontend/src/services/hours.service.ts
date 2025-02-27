import { AddHoursData, hoursData } from "@/types/hours.types";
import axiosInstance from "./axiosPrivate";

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

  async getWorkHoursForMonth(
    year: number,
    month: number
  ): Promise<hoursData[]> {
    try {
      const response = await axiosInstance.get<hoursData[]>(
        `/hours/user/${year}/${month}`
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch work hours for the specified month");
    }
  }
}

export default new WorkHoursService();
