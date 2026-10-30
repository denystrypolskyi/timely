import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import axiosPublic from "./axiosPublic";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10_000,
});

let refreshPromise: Promise<void> | null = null;

async function refreshIfNeeded(): Promise<void> {
  // Another tab may have refreshed while this one was waiting for the lock.
  const profile = await axiosPublic.get("/users/profile");
  if (profile.status === 204) {
    await axiosPublic.post("/users/refresh");
  }
}

export function refreshAccessToken(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = (navigator.locks
      ? navigator.locks.request("timely-refresh", refreshIfNeeded)
      : refreshIfNeeded())
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

type RetryableRequest = InternalAxiosRequestConfig & { _retried?: boolean };

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryableRequest | undefined;
    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      try {
        await refreshAccessToken();
      } catch (refreshError) {
        if (axios.isAxiosError(refreshError) && refreshError.response?.status === 401) {
          redirectToLogin();
        }
        return Promise.reject(refreshError);
      }
      return axiosInstance(original);
    } else if (error.response?.status === 401) {
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

function redirectToLogin() {
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

export default axiosInstance;
