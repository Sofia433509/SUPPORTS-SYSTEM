import { createContext, useContext, useRef, useState, type ReactNode, useEffect } from 'react';
import type { User, UserRole } from '../types/auth';
import { apiService, type RegisterResponse } from '../utils/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, campaign: string) => Promise<RegisterResponse>;
  logout: () => void;
  isAdmin: boolean;
  isLoading: boolean;
  requestPasswordRecovery: (email: string) => Promise<void>;
  verifyCode: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto logout after 10 minutes of inactivity
  const inactivityTimeout = useRef<number | null>(null);
  const INACTIVITY_LIMIT_MS = 10 * 60 * 1000; // 10 minutes

  const clearInactivityTimeout = () => {
    if (inactivityTimeout.current) {
      window.clearTimeout(inactivityTimeout.current);
      inactivityTimeout.current = null;
    }
  };

  const startInactivityTimeout = () => {
    clearInactivityTimeout();
    inactivityTimeout.current = window.setTimeout(() => {
      logout();
    }, INACTIVITY_LIMIT_MS);
  };

  const resetInactivityTimeout = () => {
    if (user) {
      startInactivityTimeout();
    }
  };

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser({ ...parsedUser, access_token: token });
        startInactivityTimeout();
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      clearInactivityTimeout();
      return;
    }

    startInactivityTimeout();

    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart'];
    const handleActivity = () => resetInactivityTimeout();

    events.forEach((eventName) => window.addEventListener(eventName, handleActivity));

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, handleActivity));
      clearInactivityTimeout();
    };
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ institutional_email: email, password });

      // Backend devuelve { token, user }
      const userInfo = response.user;
      const roleRaw = String(userInfo.role || '').trim();
      const roleNormalized = roleRaw.toLowerCase();

      // Normalizar roles / campañas que deben comportarse como empleados
      let normalizedRole: UserRole = 'employee';
      if (roleNormalized === 'it' || roleNormalized === 'admin') {
        normalizedRole = 'admin';
      } else if (
        roleNormalized === 'employees' ||
        roleNormalized === 't-mobile' ||
        roleNormalized === 'ars' ||
        roleNormalized === 'atyt'
      ) {
        normalizedRole = 'employee';
      }

      const userData: User = {
        id: String(userInfo.id),
        // Backend stores the name in the "name" field.
        name: userInfo.full_name || userInfo.name || userInfo.institutional_email,
        email: userInfo.institutional_email,
        role: normalizedRole,
        campaign: userInfo.campaign,
        access_token: response.token,
      };

      setUser(userData);
      localStorage.setItem('access_token', userData.access_token || '');
      localStorage.setItem('user_data', JSON.stringify(userData));
      startInactivityTimeout();
    } catch (error) {
      throw error;
    }
  };

  const register = async (fullName: string, email: string, password: string, campaign: string) => {
    // simply call API and return, do not log in automatically
    try {
      return await apiService.register({ full_name: fullName, institutional_email: email, password, campaign });
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    clearInactivityTimeout();
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    // Redirect to login so credentials are cleared and user can sign in again
    try {
      window.location.href = '/login';
    } catch (error) {
      // fallback: do nothing if navigation isn't possible
      console.warn('Could not redirect after logout', error);
    }
  };

  const requestPasswordRecovery = async (email: string) => {
    await apiService.requestPasswordRecovery({ institutional_email: email });
  };

  const verifyCode = async (email: string, code: string) => {
    await apiService.verifyCode({ institutional_email: email, code });
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    await apiService.resetPassword({
      institutional_email: email,
      code,
      new_password: newPassword,
    });
  };

  const isAdmin = user?.role === 'admin';

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
