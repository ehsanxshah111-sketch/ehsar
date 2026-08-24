import axios from "axios";

// Deliberately separate from api/axios.js (which attaches the ADMIN token).
// A customer being logged in never sends an admin token, and an admin
// browsing the storefront never sends a customer token - the two systems
// can't cross paths even by accident.
const customerApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

customerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("ehsar_customer_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default customerApi;
