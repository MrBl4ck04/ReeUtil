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
  permissions?: string[]; // Permisos específicos como array de moduleId (solo para admin)
  loginAttempts?: number; // Contador de intentos fallidos de login
  isBlocked?: boolean; // Si el usuario está bloqueado
}

interface LoginResult {
  success: boolean;
  requirePasswordChange?: boolean;
  requiresVerification?: boolean; // NUEVO: indica que se requiere verificación por código
  email?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, captcha?: { captchaId: string; captchaValue: string }) => Promise<LoginResult>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (moduleId: string) => boolean;
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

  const login = async (email: string, password: string, captcha?: { captchaId: string; captchaValue: string }): Promise<LoginResult> => {
  try {
    console.log('Intentando login con:', { email, contraseA: password, captcha });
    const response = await authApi.login({ 
      email, 
      contraseA: password, 
      captchaId: captcha?.captchaId || '', 
      captchaValue: captcha?.captchaValue || '' 
    });
    console.log('Respuesta del servidor:', response.data);
      
      // NUEVO: Verificar si se requiere verificación por código
      if (response.data && response.data.requiresVerification) {
        // No guardar token aún, esperar verificación por código
        return { 
          success: false, 
          requiresVerification: true,
          email 
        };
      }
      
      // Verificar que la respuesta tenga un token de acceso
      if (response.data && response.data.access_token) {
        const { access_token, user: userData } = response.data;
        
        // Verificar si el usuario está bloqueado
        if (userData && userData.isBlocked) {
          toast.error('Su cuenta está bloqueada. Por favor contacte con soporte.');
          return { success: false };
        }
        
        setToken(access_token);
        setUser(userData);
        
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast.success('¡Bienvenido a ReeUtil!');
        return { success: true };
      }
      
      // Si no hay token, el login no fue exitoso
      toast.error('Credenciales inválidas. Por favor intente nuevamente.');
      return { success: false };
    } catch (error: any) {
      // Manejo específico: cuenta bloqueada
      if (error.response?.status === 403 && error.response?.data?.code === 'ACCOUNT_BLOCKED') {
        toast.error(error.response?.data?.message || 'Tu cuenta ha sido bloqueada. Por favor contacta con soporte.');
        return { success: false };
      }

      // Manejo específico: contraseña expirada
      if (error.response?.status === 403 && error.response?.data?.code === 'PASSWORD_EXPIRED') {
        toast.error(error.response?.data?.message || 'Tu contraseña ha expirado. Debes cambiarla.');
        return { success: false, requirePasswordChange: true, email };
      }

      // Manejo de intentos fallidos con advertencia
      if (error.response?.status === 401) {
        const message = error.response?.data?.message || 'Email o contraseña incorrectos';
        const attemptsLeft = error.response?.data?.attemptsLeft;
        
        if (attemptsLeft !== undefined) {
          // Mostrar advertencia con intentos restantes
          if (attemptsLeft === 0) {
            toast.error('¡Tu cuenta ha sido bloqueada por múltiples intentos fallidos!');
          } else if (attemptsLeft === 1) {
            toast.error(`${message}\n¡ADVERTENCIA: Solo te queda 1 intento más!`);
          } else {
            toast.error(`${message}\nTe quedan ${attemptsLeft} intentos.`);
          }
        } else {
          toast.error(message);
        }
        
        return { success: false };
      }
      
      const message = error.response?.data?.message || 'Error al iniciar sesión';
      toast.error(message);
      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Sesión cerrada exitosamente');
  };

  const hasPermission = (moduleId: string): boolean => {
    // Si no hay usuario, no tiene permisos
    if (!user) return false;
    
    // Si es un cliente (rol = false), no usar sistema de permisos
    if (!user.rol) return true;
    
    // Si es admin pero no tiene permisos definidos, permitir todo (admin legacy)
    if (!user.permissions || user.permissions.length === 0) return true;
    
    // Verificar si el moduleId está en la lista de permisos
    return user.permissions.includes(moduleId);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
