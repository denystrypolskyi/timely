import { userData } from "./user.types";

export interface AddHoursData {
  shiftStart: string;
  shiftEnd: string;
}

export interface hoursData extends AddHoursData {
  id: number;
  user: userData;
  workedHours: string;
}
