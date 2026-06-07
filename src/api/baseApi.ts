
import axios from "axios";

const baseApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

const PUBLIC_AUTH_PATHS = [
  "/accounts/user/login/",
  "/accounts/user/register/",
  "/accounts/user/verify-otp/",
  "/accounts/user/resend-otp/",
  "/accounts/user/send-reset-password-email/",
  "/accounts/user/reset-password-otp/",
  "/accounts/user/set-new-password/",
];

const isPublicAuthPath = (url?: string) =>
  Boolean(url && PUBLIC_AUTH_PATHS.some((path) => url.includes(path)));

// Add token to all requests
baseApi.interceptors.request.use(
  (config) => {
    if (isPublicAuthPath(config.url)) {
      return config;
    }

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

    if (isPublicAuthPath(originalRequest?.url)) {
      return Promise.reject(error);
    }

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
