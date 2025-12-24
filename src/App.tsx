import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import { RequireAuth } from "./routes";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import SelfServicePage from "./pages/SelfServicePage";
import AttendanceHistoryPage from "./pages/AttendanceHistoryPage"; // Updated import
import InventoryManagementPage from "./pages/InventoryManagementPage";
import LogsPage from "./pages/LogsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/self" element={<SelfServicePage />} />
            <Route
              path="/attendance-history"
              element={<AttendanceHistoryPage />}
            />{" "}
            {/* Updated route */}
            <Route
              path="/inventory-management"
              element={<InventoryManagementPage />}
            />
            <Route path="/logs" element={<LogsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
