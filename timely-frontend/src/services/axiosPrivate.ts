import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import authService from "./auth.service";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequestConfig | undefined;

    if (error.response?.status !== 401 || !request) {
      return Promise.reject(error);
    }

    if (request._retry) {
      redirectToLogin();
      return Promise.reject(error);
    }

    request._retry = true;

    try {
      await authService.refreshSession();
      return axiosInstance(request);
    } catch (refreshError) {
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  }
);

function redirectToLogin() {
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

export default axiosInstance;
