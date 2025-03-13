"use client";
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Fetch user details only if access token exists
  const fetchUser = async () => {
    let accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (!accessToken) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const userData = response.data;
      userData.profile_picture = userData.profile_picture
        ? `${API_BASE_URL}${userData.profile_picture}`
        : "/default-profile.jpg";

      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch user:", error);

      if (error.response && error.response.status === 401 && refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/api/token/refresh/`,
            {
              refresh: refreshToken,
            }
          );

          const newAccessToken = refreshResponse.data.access;
          localStorage.setItem("access_token", newAccessToken);
          return fetchUser();
        } catch (refreshError) {
          console.error("Refresh token expired. Logging out...");
          logoutUser();
        }
      } else {
        setUser(null);
      }
    }
  };

  // Login with email & password
  const loginUser = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login/`, {
        email,
        password,
      });

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      setUser(response.data.user);
      await fetchUser();

      router.push("/");
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Invalid credentials");
    }
  };

  // Google Login
  const loginWithGoogle = async (token) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/google/`, {
        token,
      });

      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);

      setUser(response.data.user);
      await fetchUser();

      router.push("/");
    } catch (error) {
      console.error("Google login failed:", error);
      throw new Error("Google authentication failed");
    }
  };

  // Logout
  const logoutUser = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    router.push("/login");
  };

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, fetchUser, loginUser, loginWithGoogle, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
