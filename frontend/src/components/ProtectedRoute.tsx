import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'client';
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requiredPermission
}) => {
  const { user, token, isLoading } = useAuth();

  // Si está cargando, mostrar spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-solid border-primary-600 border-r-transparent"></div>
      </div>
    );
  }

  // Si no hay token, redirigir al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Verificar rol si se requiere
  if (requiredRole) {
    // admin = true, client = false en el campo rol
    const isAdmin = user?.rol === true;
    
    if (requiredRole === 'admin' && !isAdmin) {
      // Si no es admin, redirigir a login para que se autentique como cliente
      return <Navigate to="/login" replace />;
    }
    
    if (requiredRole === 'client' && isAdmin) {
      // Si es admin pero trata de acceder a rutas de cliente, redirigir a admin
      return <Navigate to="/admin" replace />;
    }
  }

  // Verificar permiso específico para administradores
  if (requiredPermission && user?.rol === true) {
    const hasPermission = user.permissions?.some(
      (p) => p.moduleId === requiredPermission && p.hasAccess
    );
    
    if (!hasPermission) {
      return <Navigate to="/admin" replace />;
    }
  }

  // Si está bloqueado, mostrar mensaje
  if (user?.isBlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md text-center">
          <h2 className="font-bold text-lg mb-2">Cuenta bloqueada</h2>
          <p>
            Su cuenta ha sido bloqueada por motivos de seguridad. 
            Por favor contacte con soporte para desbloquearla.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
          >
            Volver al login
          </button>
        </div>
      </div>
    );
  }

  // Si todo está bien, mostrar los hijos
  return <>{children}</>;
};