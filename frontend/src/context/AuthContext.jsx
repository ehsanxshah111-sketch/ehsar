import React, { createContext, useContext, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("ehsar_admin_token"));
  const [username, setUsername] = useState(() => localStorage.getItem("ehsar_admin_username"));

  const login = async (usernameInput, password) => {
    const { data } = await api.post("/auth/login", { username: usernameInput, password });
    localStorage.setItem("ehsar_admin_token", data.token);
    localStorage.setItem("ehsar_admin_username", data.username);
    setToken(data.token);
    setUsername(data.username);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("ehsar_admin_token");
    localStorage.removeItem("ehsar_admin_username");
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ token, username, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
