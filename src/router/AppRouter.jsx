import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import Dashboard from "../pages/Dashboard";
import FindingsPage from "../features/findings/pages/FindingsPage";

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
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
