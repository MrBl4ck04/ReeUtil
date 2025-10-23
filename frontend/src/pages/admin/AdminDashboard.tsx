import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ShoppingBag,
  Wrench,
  Recycle as RecycleIcon,
  Star,
  AlertCircle,
  ArrowRight,
  Loader,
  BarChart2,
  ShoppingCart,
  DollarSign,
  Users,
  Settings,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardApi } from '../../services/dashboardApi';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Obtener todos los datos del dashboard
  const { data: dashboardData, isLoading: isLoadingData, error: queryError } = useQuery(
    'adminDashboard',
    () => dashboardApi.getDashboardData(),
    { retry: 2, staleTime: 0, cacheTime: 0, refetchOnWindowFocus: true }
  );
  
  const isLoading = !!isLoadingData;

  const dashInfo = dashboardData?.data?.data || {};
  
  const pendingRepairsCount = dashInfo.pendingRepairs?.count || 0;
  const pendingRecycleCount = dashInfo.pendingRecycle?.count || 0;
  const recentSalesCount = dashInfo.recentSales?.count || 0;
  const newReviewsCount = dashInfo.newReviews?.count || 0;

  const recentSales = dashInfo.recentSales?.sales || [];
  const newReviews = dashInfo.newReviews?.reviews || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenido, {user?.nombre}. Gestiona el sistema ReeUtil desde aquí.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Reparaciones Pendientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <Wrench className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Reparaciones Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">{pendingRepairsCount}</p>
            </div>
          </div>
        </div>

        {/* Reciclaje Pendiente */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <RecycleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Reciclaje Pendiente</p>
              <p className="text-2xl font-bold text-gray-900">{pendingRecycleCount}</p>
            </div>
          </div>
        </div>

        {/* Ventas Recientes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Ventas Recientes</p>
              <p className="text-2xl font-bold text-gray-900">{recentSalesCount}</p>
            </div>
          </div>
        </div>

        {/* Reseñas Nuevas */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Reseñas Nuevas</p>
              <p className="text-2xl font-bold text-gray-900">{newReviewsCount}</p>
            </div>
          </div>
        </div>
      </div>

      {(isLoading || false) && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">Cargando datos del dashboard...</p>
        </div>
      )}

      {(queryError || false) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-900">Error al cargar datos</h3>
              <p className="text-sm text-red-700 mt-1">No se pudieron obtener los datos del dashboard</p>
            </div>
          </div>
        </div>
      )}

      {!(isLoading || false) && !(queryError || false) && (
        <>
          {/* Reparaciones Pendientes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Reparaciones Pendientes</h2>
              <Link to="/admin/reparaciones" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                Ver todas <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="px-6 py-4">
              {pendingRepairsCount === 0 ? (
                <p className="text-gray-500 text-sm">No hay reparaciones pendientes</p>
              ) : (
                <p className="text-gray-700">{pendingRepairsCount} reparaciones pendientes</p>
              )}
            </div>
          </div>

          {/* Reciclaje Pendiente */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Reciclaje Pendiente</h2>
              <Link to="/admin/reciclaje" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                Ver todos <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="px-6 py-4">
              {pendingRecycleCount === 0 ? (
                <p className="text-gray-500 text-sm">No hay solicitudes de reciclaje pendientes</p>
              ) : (
                <p className="text-gray-700">{pendingRecycleCount} solicitudes pendientes</p>
              )}
            </div>
          </div>

          {/* Ventas Recientes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Ventas Recientes</h2>
              <Link to="/admin/ventas" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                Ver todas <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="px-6 py-4">
              {recentSalesCount === 0 ? (
                <p className="text-gray-500 text-sm">No hay ventas recientes</p>
              ) : (
                <div className="space-y-2">
                  {recentSales.slice(0, 5).map((sale: any) => (
                    <div key={sale._id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{sale.producto || 'Producto'}</p>
                        <p className="text-xs text-gray-500">Cantidad: {sale.cantidad}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">${sale.precio}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reseñas Nuevas */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Reseñas Nuevas</h2>
              <Link to="/admin/customer-satisfaction" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                Ver todas <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="px-6 py-4">
              {newReviewsCount === 0 ? (
                <p className="text-gray-500 text-sm">No hay reseñas nuevas</p>
              ) : (
                <div className="space-y-3">
                  {newReviews.slice(0, 5).map((review: any) => (
                    <div key={review._id} className="border-b pb-3 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{review.titulo}</p>
                          <p className="text-xs text-gray-500 mt-1">De: {review.autor?.name} - Para: {review.destinatario?.name}</p>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < review.calificacion ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
