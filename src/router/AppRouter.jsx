// src/router/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Dashboard from "../pages/Dashboard";
import FindingsPage from "../features/findings/pages/FindingsPage";
import LoginPage from "../pages/LoginPage";
import OAuth2SuccessPage from "../pages/OAuth2SuccessPage";

// Import our PrivateRoute
import PrivateRoute from "./PrivateRoute";

function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/oauth2/success" element={<OAuth2SuccessPage />} />

      {/* Wrap the layout in our PrivateRoute */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="findings" element={<FindingsPage />} />
      </Route>

      {/* Catch-all for unknown routes */}
      <Route
        path="*"
        element={<div style={{ padding: "2rem" }}>404 - Not Found</div>}
      />
    </Routes>
  );
}

export default AppRouter;
