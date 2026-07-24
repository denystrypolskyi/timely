export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokenResponse {
  token: string;
}

export type LoginFormValues = LoginCredentials;
