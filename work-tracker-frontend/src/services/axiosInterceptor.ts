import axios from "axios";
import { API_URL } from "../config/config";

const API_BASE_URL = API_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Logging out...");
      localStorage.removeItem("jwtToken"); 
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
