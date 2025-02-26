import { API_URL } from "../config/config";
import axios from "axios";

const axiosPublic = axios.create({
  baseURL: API_URL, 
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosPublic;
