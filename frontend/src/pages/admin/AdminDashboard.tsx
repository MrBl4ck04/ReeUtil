import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  BarChart2,
  ShoppingBag,
  ShoppingCart,
  Wrench,
  Recycle as RecycleIcon,
  Users,
  Settings,
  Star,
  AlertCircle,
  Clock,
  CheckCircle,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  repairApi, 
  recycleApi, 
  marketplaceApi, 
  reviewsApi 
} from '../../services/marketplaceApi';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Consultas para obtener datos de diferentes servicios
  const { data: pendingRepairs, isLoading: repairsLoading, error: repairsError } = useQuery('pendingRepairs', () => 
    repairApi.getAllRepairRequests('pendiente'), 
    { retry: 1, staleTime: 30000 }
  );
  
  const { data: pendingRecycle, isLoading: recycleLoading, error: recycleError } = useQuery('pendingRecycle', () => 
    recycleApi.getAllRecycleRequests('pendiente'),
    { retry: 1, staleTime: 30000 }
  );
  
  const { data: recentSales, isLoading: salesLoading, error: salesError } = useQuery('recentSales', () => 
    marketplaceApi.getAllProducts({ limit: 5, sort: 'recent' }),
    { retry: 1, staleTime: 30000 }
  );
  
  const { data: recentReviews, isLoading: reviewsLoading, error: reviewsError } = useQuery('recentReviews', () => 
    reviewsApi.getAllReviews(),
    { retry: 1, staleTime: 30000 }
  );
  
  // Estadísticas para mostrar en el dashboard
  const stats = [
    {
      name: 'Reparaciones Pendientes',
      value: Array.isArray(pendingRepairs?.data) ? pendingRepairs.data.length : 0,
      icon: Wrench,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      href: '/admin/reparaciones'
    },
    {
      name: 'Reciclaje Pendiente',
      value: Array.isArray(pendingRecycle?.data) ? pendingRecycle.data.length : 0,
      icon: RecycleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/admin/reciclaje'
    },
    {
      name: 'Ventas Recientes',
      value: Array.isArray(recentSales?.data) ? recentSales.data.length : 0,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/admin/ventas'
    },
    {
      name: 'Reseñas Nuevas',
      value: Array.isArray(recentReviews?.data) ? recentReviews.data.filter((r: any) => !r.revisado).length : 0,
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/admin/satisfaccion'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenido, {user?.nombre}. Gestiona el sistema ReeUtil desde aquí.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link 
              to={stat.href}
              key={stat.name} 
              className="card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Paneles principales */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Reparaciones pendientes */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Reparaciones Pendientes</h3>
            <Link
              to="/admin/reparaciones"
              className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
            >
              Ver todas
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {Array.isArray(pendingRepairs?.data) && pendingRepairs.data.length > 0 ? (
              pendingRepairs.data.slice(0, 5).map((repair: any) => (
                <div 
                  key={repair._id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-yellow-100 mr-3">
                      <Wrench className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {repair.tipoDispositivo} - {repair.marca} {repair.modelo}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(repair.fechaSolicitud).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/admin/reparaciones/${repair._id}`}
                    className="btn-sm btn-outline-primary"
                  >
                    Evaluar
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                No hay reparaciones pendientes
              </div>
            )}
          </div>
        </div>

        {/* Reciclaje pendiente */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Reciclaje Pendiente</h3>
            <Link
              to="/admin/reciclaje"
              className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
            >
              Ver todos
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {Array.isArray(pendingRecycle?.data) && pendingRecycle.data.length > 0 ? (
              pendingRecycle.data.slice(0, 5).map((recycle: any) => (
                <div 
                  key={recycle._id} 
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100 mr-3">
                      <RecycleIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {recycle.tipoDispositivo} - {recycle.marca} {recycle.modelo}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {new Date(recycle.fechaSolicitud).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/admin/reciclaje/${recycle._id}`}
                    className="btn-sm btn-outline-primary"
                  >
                    Evaluar
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                No hay solicitudes de reciclaje pendientes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Gestión de Reglas</h3>
          <div className="space-y-3">
            <Link
              to="/admin/reglas"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Settings className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Administrar Reglas</p>
                  <p className="text-sm text-gray-500">Gestiona las reglas del sistema</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Gestión de Usuarios</h3>
          <div className="space-y-3">
            <Link
              to="/admin/empleados"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Users className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Administrar Empleados</p>
                  <p className="text-sm text-gray-500">Gestiona los empleados del sistema</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
            
            <Link
              to="/admin/usuarios"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Usuarios Bloqueados</p>
                  <p className="text-sm text-gray-500">Gestiona los usuarios bloqueados</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas</h3>
          <div className="space-y-3">
            <Link
              to="/admin/dashboards"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <BarChart2 className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Ver Dashboards</p>
                  <p className="text-sm text-gray-500">Visualiza estadísticas detalladas</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
            
            <Link
              to="/admin/satisfaccion"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Satisfacción del Cliente</p>
                  <p className="text-sm text-gray-500">Revisa las reseñas y calificaciones</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Resumen de ventas */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Resumen de Ventas</h3>
          <Link
            to="/admin/ventas"
            className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
          >
            Ver detalles
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 mr-3">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ventas Totales</p>
                <p className="text-xl font-semibold text-gray-900">247</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 mr-3">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ingresos</p>
                <p className="text-xl font-semibold text-gray-900">$12,580</p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-yellow-100 mr-3">
                <Wrench className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Reparaciones</p>
                <p className="text-xl font-semibold text-gray-900">85</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 mr-3">
                <RecycleIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Reciclaje</p>
                <p className="text-xl font-semibold text-gray-900">132</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
