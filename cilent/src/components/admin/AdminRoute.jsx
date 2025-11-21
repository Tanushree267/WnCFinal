// src/components/Admin/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const AdminRoute = ({ children }) => {
  const { user, isAdmin } = useAppContext();

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;