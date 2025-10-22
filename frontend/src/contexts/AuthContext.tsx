import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

interface Permission {
  moduleId: string;
  moduleName: string;
  hasAccess: boolean;
}

interface User {
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: boolean; // true = admin, false = cliente
  cargo?: string; // Puesto en la empresa (solo para admin)
  permissions?: Permission[]; // Permisos específicos (solo para admin)
  loginAttempts?: number; // Contador de intentos fallidos de login
  isBlocked?: boolean; // Si el usuario está bloqueado
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
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

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authApi.login({ email, contraseA: password });
      
      if (response.data.access_token) {
        const { access_token, user: userData } = response.data;
        
        // Verificar si el usuario está bloqueado
        if (userData.isBlocked) {
          toast.error('Su cuenta está bloqueada. Por favor contacte con soporte.');
          return false;
        }
        
        // Resetear contador de intentos fallidos si existía
        if (userData.loginAttempts > 0) {
          authApi.resetLoginAttempts(userData.idUsuario);
        }
        
        setToken(access_token);
        setUser(userData);
        
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast.success('¡Bienvenido a ReeUtil!');
        return true;
      }
      
      return false;
    } catch (error: any) {
      // Incrementar contador de intentos fallidos
      if (error.response?.status === 401) {
        const email = error.config?.data ? JSON.parse(error.config.data).email : '';
        if (email) {
          authApi.incrementLoginAttempts(email);
        }
      }
      
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Sesión cerrada exitosamente');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
