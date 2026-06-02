
import axios from "axios";

const baseApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add token to all requests
baseApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle 401 errors and refresh token
baseApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const refreshEndpoint = process.env.NEXT_PUBLIC_REFRESH_ENDPOINT;

        // For guest/public pages, do not force refresh/redirect when auth does not exist.
        if (!refreshToken || !refreshEndpoint) {
          return Promise.reject(error);
        }

        const res = await axios.post<{ access?: string }>(refreshEndpoint, {
          refresh: refreshToken,
        });

        if (res.data?.access) {
          localStorage.setItem("access_token", res.data.access);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return baseApi(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default baseApi;
