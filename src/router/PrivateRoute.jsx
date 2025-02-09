// src/router/PrivateRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const token = useSelector((state) => state.auth.token);

  if (!token) {
    // If not logged in, go to /login
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the protected content
  return children;
}

export default PrivateRoute;
