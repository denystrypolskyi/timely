import { AddShiftData, ShiftData } from "@/types/shifts.types";
import axiosInstance from "./axiosPrivate";

class ShiftService {
  async getShifts(): Promise<ShiftData[]> {
    try {
      const response = await axiosInstance.get<ShiftData[]>("/shifts/user");
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch shifts");
    }
  }

  async addShift(data: AddShiftData): Promise<ShiftData> {
    try {
      const response = await axiosInstance.post<ShiftData>("/shifts", data);
      return response.data;
    } catch (error) {
      throw new Error("Failed to add shift");
    }
  }

  async getShiftsForMonth(year: number, month: number): Promise<ShiftData[]> {
    try {
      const response = await axiosInstance.get<ShiftData[]>(
        `/shifts/user/${year}/${month}`
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch shifts for the specified month");
    }
  }

  async deleteShift(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`/shifts/${id}`);
    } catch (error) {
      throw new Error("Failed to delete shift");
    }
  }
}

export default new ShiftService();
