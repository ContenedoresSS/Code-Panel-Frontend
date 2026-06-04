import axios from "axios";
import { interceptorsConfig } from "./interceptorsConfig";

const api = axios.create({
  baseURL: "https://codepanel.orchfr.duckdns.org/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});
interceptorsConfig(api);
//https://codepanel.orchfr.duckdns.org/api/v1
//http://localhost:3000/api/v1
export default api;
