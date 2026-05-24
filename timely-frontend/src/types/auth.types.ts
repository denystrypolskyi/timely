export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokenResponse {
  token: string;
}

export type LoginFormValues = LoginCredentials;

export interface RegisterFormValues {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface RegisteredUser {
  id: number;
  username: string;
  role: string | null;
}
