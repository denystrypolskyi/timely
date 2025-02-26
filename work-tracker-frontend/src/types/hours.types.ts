import { userData } from "./user.types";

export interface hoursData {
  id: number;
  shiftStart: string;
  shiftEnd: string;
  user: userData;
  workedHours: number;
}
