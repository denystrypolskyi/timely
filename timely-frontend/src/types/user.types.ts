export type UserRole = "USER" | "ADMIN";

export interface User {
  id: number;
  username: string;
  role: UserRole | null;
}

export interface CreateUserRequest {
  username: string;
  password: string;
}
