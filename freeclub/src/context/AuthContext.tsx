import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthUser, Persona, Usuario } from '../types';
// import { mockPersonas, mockUsuarios } from '../data/mockData';
import { fetchUsuarios } from '../api/usuarios';
import { fetchPersonaPorDni } from '../api/personas';


interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<boolean>;
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
    // Simular carga de sesión guardada
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

const login = async (username: string, password: string) => {
  try {
    const usuarios = await fetchUsuarios();
    const foundUser = usuarios.find(
      (u: Usuario) =>
        u.username === username &&
        u.password === password
    );
    if (!foundUser) return false;

    // Obtener datos de persona usando el dni (que es el username)
    const persona = await fetchPersonaPorDni(foundUser.personaDni);

    // Unir usuario y persona, mapeando permissions a permisos
    const userWithPersona = { 
      ...foundUser, 
      persona, 
      permisos: foundUser.permissions // <--- este mapeo es clave
    };
    setUser(userWithPersona);
    localStorage.setItem('currentUser', JSON.stringify(userWithPersona));
    return true;
  } catch {
    return false;
  }
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };
  
  const hasPermission = (permiso: string) => {
    return user?.permisos?.includes?.(permiso) ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};