import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.sessionStorage.getItem("coupontrust_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const extractError = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

export const resolveUploadUrl = (filePath) => {
  if (!filePath) {
    return "";
  }
  if (/^https?:\/\//i.test(filePath)) {
    return filePath;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const origin = apiBase.replace(/\/api\/?$/, "");
  return `${origin}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
};

export default api;
