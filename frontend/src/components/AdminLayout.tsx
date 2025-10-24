import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Home, 
  Settings,
  Wrench,
  Recycle as RecycleIcon,
  BarChart2,
  ShoppingBag,
  Star,
  Users,
  UserCheck,
  LogOut, 
  Menu, 
  X,
  Shield
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mapeo de módulos con sus IDs para permisos
  const allModules = [
    { id: 'dashboard', name: 'Dashboard', href: '/admin', icon: Home },
    { id: 'rules', name: 'Reglas', href: '/admin/reglas', icon: Settings },
    { id: 'repairs', name: 'Reparaciones', href: '/admin/reparaciones', icon: Wrench },
    { id: 'recycle', name: 'Reciclaje', href: '/admin/reciclaje', icon: RecycleIcon },
    { id: 'dashboards', name: 'Dashboards', href: '/admin/dashboards', icon: BarChart2 },
    { id: 'sales', name: 'Administrar Ventas', href: '/admin/ventas', icon: ShoppingBag },
    { id: 'satisfaction', name: 'Satisfacción Cliente', href: '/admin/satisfaccion', icon: Star },
    { id: 'employees', name: 'ABM Empleados', href: '/admin/empleados', icon: Users },
    { id: 'users', name: 'ABM Usuarios', href: '/admin/usuarios', icon: UserCheck },
    { id: 'osi', name: 'Gestión OSI', href: '/admin/osi', icon: Shield },
  ];

  // Filtrar módulos según permisos del usuario
  const navigation = allModules.filter(module => hasPermission(module.id));

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <RecycleIcon className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ReeUtil Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <RecycleIcon className="h-8 w-8 text-primary-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">ReeUtil Admin</span>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              <div className="flex items-center gap-x-2">
                <span className="text-sm font-medium text-gray-700">
                  {user?.nombre} {user?.apellido}
                </span>
                <span className="text-xs text-gray-500">
                  (Administrador)
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
