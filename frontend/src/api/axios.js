import axios from "axios";


const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_PATH,
  withCredentials: true,
});

export default api;
