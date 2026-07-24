import axios from "axios";

interface ApiErrorResponse {
  message?: string;
  detailedMessage?: string;
}

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.detailedMessage
      ?? error.response?.data?.message
      ?? error.message
      ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
