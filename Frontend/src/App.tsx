import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./app/context/AuthContext";
import { TicketProvider } from "./app/context/TicketContext";
import { DeskLayoutProvider } from "./app/context/DeskLayoutContext";
import EmployeeDashboard from "./app/pages/EmployeeDashboard";
import Login from "./app/pages/Login";
import Register from "./app/pages/Register";
import OfficeMap from "./app/pages/OfficeMap";


function App() {
  return (
    <AuthProvider>
      <TicketProvider>
        <DeskLayoutProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route path="/OfficeMap" element={<OfficeMap />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </DeskLayoutProvider>
      </TicketProvider>
    </AuthProvider>
  );
}

export default App;
