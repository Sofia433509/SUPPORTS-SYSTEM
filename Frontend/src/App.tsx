import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./app/context/AuthContext";
import { TicketProvider } from "./app/context/TicketContext";
import { DeskLayoutProvider } from "./app/context/DeskLayoutContext";
import EmployeeDashboard from "./app/pages/EmployeeDashboard";
import AdminDashboard from "./app/pages/AdminDashboard";
import Login from "./app/pages/Login";
import Register from "./app/pages/Register";
import OfficeMap from "./app/pages/OfficeMap";
import { Toaster } from "sonner"; 

function App() {
  return (
    <AuthProvider>
      <TicketProvider>
        <DeskLayoutProvider>
          <Toaster // componentes de la notificacion como colores, tiempo, posicion y si se muestra el boton de cerrar
            position="top-right"
            richColors 
            closeButton 
            duration={3000} 
          />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />                      {/* Ruta para la página de inicio de sesión*/}
              <Route path="/register" element={<Register />} />                {/* Ruta para la página de registro*/}
              <Route path="/employee" element={<EmployeeDashboard />} />       {/* Ruta para el dashboard del empleado*/}
              <Route path="/admin" element={<AdminDashboard />} />                {/* Ruta para el panel de administrador*/}
              <Route path="/OfficeMap" element={<OfficeMap />} />              {/* Ruta para la página del mapa de la oficina*/}
              <Route path="/" element={<Navigate to="/login" replace />} />    {/* Redirige a /login si la ruta es la raíz*/}
            </Routes>
          </BrowserRouter> 
        </DeskLayoutProvider>
      </TicketProvider>
    </AuthProvider>
  );
}

export default App;

