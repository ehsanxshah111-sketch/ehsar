import React, { createContext, useContext, useState } from "react";
import customerApi from "../api/customerAxios.js";

const CustomerAuthContext = createContext();

export const useCustomerAuth = () => useContext(CustomerAuthContext);

export const CustomerAuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("ehsar_customer_token"));
  const [customer, setCustomer] = useState(() => {
    const stored = localStorage.getItem("ehsar_customer_info");
    return stored ? JSON.parse(stored) : null;
  });

  const persist = (data) => {
    localStorage.setItem("ehsar_customer_token", data.token);
    localStorage.setItem("ehsar_customer_info", JSON.stringify(data.user));
    setToken(data.token);
    setCustomer(data.user);
  };

  const login = async (email, password) => {
    const { data } = await customerApi.post("/users/login", { email, password });
    persist(data);
    return data;
  };

  const register = async (name, email, password, phone) => {
    const { data } = await customerApi.post("/users/register", { name, email, password, phone });
    persist(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("ehsar_customer_token");
    localStorage.removeItem("ehsar_customer_info");
    setToken(null);
    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider
      value={{ token, customer, isAuthenticated: !!token, login, register, logout }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};
