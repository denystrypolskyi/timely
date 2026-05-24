import { User } from "./user.types";

export interface CreateShiftPayload {
  shiftStart: string;
  shiftEnd: string;
}

export interface Shift extends CreateShiftPayload {
  id: number;
  user: User;
  shiftDurationMinutes: number;
}
