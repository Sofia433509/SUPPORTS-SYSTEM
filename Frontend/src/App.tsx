import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./app/context/AuthContext";
import { TicketProvider } from "./app/context/TicketContext";
import { DeskLayoutProvider } from "./app/context/DeskLayoutContext";
import EmployeeDashboard from "./app/pages/EmployeeDashboard";
import AdminDashboard from "./app/pages/AdminDashboard";
import Login from "./app/pages/Login";
import Register from "./app/pages/Register";
import OfficeMap from "./app/pages/OfficeMap";
import { Toaster } from "sonner";

function AppRoutes() {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/employee"
        element={
          user ? (
            !isAdmin ? (
              <EmployeeDashboard />
            ) : (
              <Navigate to="/admin" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/admin"
        element={isAdmin ? <AdminDashboard /> : <Navigate to="/employee" replace />}
      />
      <Route
        path="/OfficeMap"
        element={user ? <OfficeMap /> : <Navigate to="/login" replace />}
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <TicketProvider>
        <DeskLayoutProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={3000}
          />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DeskLayoutProvider>
      </TicketProvider>
    </AuthProvider>
  );
}

export default App;

