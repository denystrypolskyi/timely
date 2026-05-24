import {CreateShiftPayload, Shift} from "@/types/shifts.types";
import axiosInstance from "./axiosPrivate";
import { getApiErrorMessage } from "./apiError";

class ShiftService {
    async addShift(data: CreateShiftPayload): Promise<Shift> {
        try {
            const response = await axiosInstance.post<Shift>("/shifts", data);
            return response.data;
        } catch (error) {
            throw new Error(getApiErrorMessage(error, "Failed to add shift"));
        }
    }

    async getShiftsForMonth(year: number, month: number): Promise<Shift[]> {
        try {
            const response = await axiosInstance.get<Shift[]>(
                `/shifts/user/${year}/${month}`
            );
            return response.data;
        } catch (error) {
            throw new Error(
                getApiErrorMessage(
                    error,
                    "Failed to fetch shifts for the specified month"
                )
            );
        }
    }

    async deleteShift(id: number): Promise<void> {
        try {
            await axiosInstance.delete(`/shifts/${id}`);
        } catch (error) {
            throw new Error(getApiErrorMessage(error, "Failed to delete shift"));
        }
    }
}

export default new ShiftService();
