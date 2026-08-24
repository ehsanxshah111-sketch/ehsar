import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ADMIN_LOGIN_PATH } from "../adminConfig.js";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to={ADMIN_LOGIN_PATH} replace />;
  }
  return children;
};

export default ProtectedRoute;
