/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  email: string;
  id: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Date.now() / 1000;

        if (payload.exp && payload.exp < currentTime) {
          localStorage.removeItem("jwt_token");
          setUser(null);
        } else {
          setUser({
            email: payload.email || "user@example.com",
            id: payload.sub || "1",
          });
        }
      } catch (error) {
        localStorage.removeItem("jwt_token");
        setUser(null);
      }
    }

    setIsLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("jwt_token");
    setUser(null);
    navigate("/login");
  };

  const login = (token: string) => {
    localStorage.setItem("jwt_token", token);
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        email: payload.email || "user@example.com",
        id: payload.sub || "1",
      });
    } catch (error) {
      console.error("Invalid token format");
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
};
