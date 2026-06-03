import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { privateApi } from "../api/axios";

let isInterceptorAttached = false;

export function useApi() {
  const { getToken, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInterceptorAttached) return;

    const requestInterceptor = privateApi.interceptors.request.use(
      async (config) => {
        try {
          const token = await getToken();
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("Failed to append Clerk token:", error);
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseInterceptor = privateApi.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.warn("Session expired. Redirecting to login...");
          await signOut();
          navigate("/login");
        }
        return Promise.reject(error);
      },
    );

    isInterceptorAttached = true;

    return () => {
      privateApi.interceptors.request.eject(requestInterceptor);
      privateApi.interceptors.response.eject(responseInterceptor);
      isInterceptorAttached = false;
    };
  }, [getToken, signOut, navigate]);

  return { api: privateApi };
}
