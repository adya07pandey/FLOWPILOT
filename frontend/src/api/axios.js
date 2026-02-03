import axios from "axios";


const api = axios.create({
  baseURL: "https://flowpilot-3if5.onrender.com",
  withCredentials: true,
});

export default api;
