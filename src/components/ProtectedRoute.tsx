import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute: React.FC = () => {
  const accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");
  const user = localStorage.getItem("user");

  if (!accessToken || !refreshToken || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
