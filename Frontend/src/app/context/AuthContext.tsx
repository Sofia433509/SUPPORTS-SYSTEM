import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import type { User } from '../types/auth';
import { apiService } from '../utils/api';

// Definición del tipo del contexto de autenticación
// Describe todas las propiedades y funciones disponibles para los componentes que usen este contexto
interface AuthContextType {
  user: User | null; // Usuario actual autenticado (o null si no hay sesión)
  login: (email: string, password: string) => Promise<void>; // Función para iniciar sesión
  register: (fullName: string, email: string, password: string, campaign: string) => Promise<void>; // Función para registrar usuario
  logout: () => void; // Función para cerrar sesión
  isAdmin: boolean; // Indica si el usuario tiene rol de administrador
  isLoading: boolean; // Indica si la app está verificando el estado de autenticación
  requestPasswordRecovery: (email: string) => Promise<void>; // Solicitar recuperación de contraseña
  verifyCode: (email: string, code: string) => Promise<void>; // Verificar código enviado al correo
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>; // Cambiar contraseña
}

// Creación del contexto de autenticación
// Inicialmente puede ser undefined hasta que se use dentro del Provider
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente proveedor que envuelve la aplicación
// Permite que todos los componentes hijos accedan al contexto de autenticación
export function AuthProvider({ children }: { children: ReactNode }) {

  // Estado para almacenar el usuario autenticado
  const [user, setUser] = useState<User | null>(null);

  // Estado para saber si se está verificando la sesión inicial
  const [isLoading, setIsLoading] = useState(true);

  // useEffect que se ejecuta al iniciar la aplicación
  // Verifica si existe un usuario guardado en localStorage
  useEffect(() => {
    // Obtener token y datos de usuario guardados
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        // Convertir string JSON a objeto
        const parsedUser = JSON.parse(userData);

        // Restaurar el usuario en el estado
        setUser({ ...parsedUser, access_token: token });

      } catch (error) {
        // Si ocurre error al parsear, limpiar datos corruptos
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
      }
    }

    // Termina el estado de carga inicial
    setIsLoading(false);

  }, []);

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    try {

      // Llamada a la API enviando email institucional y contraseña
      const response = await apiService.login({ institutional_email: email, password });

      // Construir el objeto de usuario a partir de la respuesta del backend
      const userData: User = {
        id: response.id_user,
        name: response.full_name,
        email: response.institutional_email,
        role: response.role_name, // rol exacto enviado por el backend
        campaign: response.campaign,
        access_token: response.access_token,
      };

      // Guardar usuario en estado global
      setUser(userData);

      // Persistir sesión en localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user_data', JSON.stringify(userData));

    } catch (error) {
      // Re-lanzar error para manejarlo en el componente que llamó login
      throw error;
    }
  };

  // Función para registrar un nuevo usuario
  const register = async (fullName: string, email: string, password: string, campaign: string) => {

    // Solo registra al usuario en la API
    // No inicia sesión automáticamente
    try {
      return await apiService.register({
        full_name: fullName,
        institutional_email: email,
        password,
        campaign
      });
    } catch (error) {
      throw error;
    }
  };

  // Función para cerrar sesión
  const logout = () => {

    // Limpiar usuario del estado
    setUser(null);

    // Eliminar datos almacenados en localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');

    // Redirigir al login para reiniciar la sesión
    try {
      window.location.href = '/login';
    } catch (error) {

      // Si no se puede redirigir, solo mostrar advertencia
      console.warn('Could not redirect after logout', error);
    }
  };

  // Solicita al backend iniciar el proceso de recuperación de contraseña
  const requestPasswordRecovery = async (email: string) => {
    await apiService.requestPasswordRecovery({ institutional_email: email });
  };

  // Verifica el código de recuperación enviado al correo
  const verifyCode = async (email: string, code: string) => {
    await apiService.verifyCode({ institutional_email: email, code });
  };

  // Permite establecer una nueva contraseña después de verificar el código
  const resetPassword = async (email: string, code: string, newPassword: string) => {
    await apiService.resetPassword({
      institutional_email: email,
      code,
      new_password: newPassword,
    });
  };

  // Determina si el usuario es administrador
  // En este caso se considera admin si el rol es "it"
  const isAdmin = user?.role?.toLowerCase() === 'it';

  // Proveedor del contexto
  // Expone los valores y funciones a todos los componentes hijos
  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAdmin,
      isLoading,
      requestPasswordRecovery,
      verifyCode,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personalizado para consumir el contexto de autenticación
export function useAuth() {

  const context = useContext(AuthContext);

  // Validación para asegurar que se use dentro de AuthProvider
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}