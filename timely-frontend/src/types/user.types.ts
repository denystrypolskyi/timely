export type UserRole = "USER" | "ADMIN";

export interface User {
  id: number;
  username: string;
  role: UserRole | null;
  timeZone: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
}

export interface UpdateTimeZoneRequest {
  timeZone: string;
}
