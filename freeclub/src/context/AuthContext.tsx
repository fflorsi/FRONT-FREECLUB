import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { loginApi } from '../api/auth';

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string, recaptchaToken?: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('authToken');
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string, recaptchaToken?: string) => {
    try {
      const result = await loginApi(username, password,recaptchaToken);
      
      if (result.success && result.user && result.token) {
        setUser(result.user);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        localStorage.setItem('authToken', result.token);
        return true;
      } else {
        console.error('Error en login:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
  };
  
  const hasPermission = (permiso: string) => {
    return user?.permissions?.includes?.(permiso) ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};