import axios from "axios";
import { interceptorsConfig } from "./interceptorsConfig";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});
interceptorsConfig(api);
export default api;
