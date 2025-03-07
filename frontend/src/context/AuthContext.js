"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Fetch user details
  const fetchUser = async () => {
    const accessToken = localStorage.getItem("access_token");

    if (accessToken) {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/user/", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        logoutUser();
      }
    }
  };

  // Login with email & password
  const loginUser = async (email, password) => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        email,
        password,
      });

      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);

      // ✅ Set user immediately
      setUser(response.data.user);

      // ✅ Fetch user again to ensure latest data
      await fetchUser();

      router.push("/"); // Redirect after login
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Invalid credentials");
    }
  };

  // Google Login
  const loginWithGoogle = async (token) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/google/",
        { token }
      );

      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);

      // ✅ Set user immediately
      setUser(response.data.user);

      // ✅ Fetch user again to ensure latest data
      await fetchUser();

      router.push("/"); // Redirect after Google login
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
      value={{ user, loginUser, loginWithGoogle, logoutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
