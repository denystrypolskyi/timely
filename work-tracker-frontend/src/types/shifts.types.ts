import { UserData } from "./user.types";

export interface AddShiftData {
  shiftStart: string;
  shiftEnd: string;
}

export interface ShiftData extends AddShiftData {
  id: number;
  user: UserData;
  shiftDurationMinutes: string;
}
