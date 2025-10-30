import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ShoppingBag,
  ShoppingCart,
  Wrench,
  Recycle as RecycleIcon,
  Bell,
  ArrowRight,
  Loader,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { clientDashboardApi } from '../../services/clientDashboardApi';

export const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Obtener todos los datos del dashboard del cliente
  const { data: dashboardData, isLoading: isLoadingData, error: queryError } = useQuery(
    'clientDashboard',
    () => clientDashboardApi.getClientDashboardData(),
    { retry: 2, staleTime: 0, cacheTime: 0, refetchOnWindowFocus: true }
  );
  
  const isLoading = !!isLoadingData;

  const dashInfo = dashboardData?.data?.data || {};
  
  const mySalesCount = dashInfo.mySales?.count || 0;
  const myPurchasesCount = dashInfo.myPurchases?.count || 0;
  const myRepairsCount = dashInfo.myRepairs?.count || 0;
  const myRecycleCount = dashInfo.myRecycle?.count || 0;
  const notificationsCount = dashInfo.myNotifications?.count || 0;

  const mySales = dashInfo.mySales?.sales || [];
  const myPurchases = dashInfo.myPurchases?.purchases || [];
  const myRepairs = dashInfo.myRepairs?.repairs || [];
  const myRecycle = dashInfo.myRecycle?.recycleRequests || [];
  const notifications = dashInfo.myNotifications?.notifications || [];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Panel de Cliente</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenido, {user?.nombre}. Gestiona tus ventas, compras, reparaciones y reciclaje.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {/* Mis Ventas */}
        <Link to="/client/ventas" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mis Ventas</p>
              <p className="text-2xl font-bold text-gray-900">{mySalesCount}</p>
            </div>
          </div>
        </Link>

        {/* Mis Compras */}
        <Link to="/client/compras" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <ShoppingCart className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Mis Compras</p>
              <p className="text-2xl font-bold text-gray-900">{myPurchasesCount}</p>
            </div>
          </div>
        </Link>

        {/* Reparaciones */}
        <Link to="/client/reparaciones" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <Wrench className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reparaciones</p>
              <p className="text-2xl font-bold text-gray-900">{myRepairsCount}</p>
            </div>
          </div>
        </Link>

        {/* Reciclaje */}
        <Link to="/client/reciclar" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-600/20">
              <RecycleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reciclaje</p>
              <p className="text-2xl font-bold text-gray-900">{myRecycleCount}</p>
            </div>
          </div>
        </Link>

        {/* Notificaciones */}
        <Link to="/client/notificaciones" className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <Bell className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notificaciones</p>
              <p className="text-2xl font-bold text-gray-900">{notificationsCount}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Loading State */}
      {(isLoading || false) && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">Cargando tu panel...</p>
        </div>
      )}

      {/* Error State */}
      {(queryError || false) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-900">Error al cargar datos</h3>
              <p className="text-sm text-red-700 mt-1">No se pudieron obtener los datos de tu panel</p>
            </div>
          </div>
        </div>
      )}

      {!(isLoading || false) && !(queryError || false) && (
        <>
          {/* Acciones Rápidas */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Acciones Rápidas</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Vender un Producto */}
                <Link
                  to="/client/ventas"
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-100 mr-3">
                      <ShoppingBag className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Vender un Producto</p>
                      <p className="text-xs text-gray-500">Publica un producto para vender</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>

                {/* Comprar Productos */}
                <Link
                  to="/client/compras"
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-100 mr-3">
                      <ShoppingCart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Comprar Productos</p>
                      <p className="text-xs text-gray-500">Explora productos disponibles</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>

                {/* Solicitar Reparación */}
                <Link
                  to="/client/reparaciones"
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-yellow-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-yellow-100 mr-3">
                      <Wrench className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Solicitar Reparación</p>
                      <p className="text-xs text-gray-500">Envía tu dispositivo para reparación</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>

                {/* Reciclar Dispositivo */}
                <Link
                  to="/client/reciclar"
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-green-600/20 mr-3">
                      <RecycleIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Reciclar Dispositivo</p>
                      <p className="text-xs text-gray-500">Recicla dispositivos y obtén compensación</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* Mis Ventas Recientes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Mis Ventas Recientes</h2>
              <Link to="/client/ventas" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                Ver todas <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="px-6 py-4">
              {mySalesCount === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No tienes ventas aún</p>
              ) : (
                <div className="space-y-3">
                  {mySales.slice(0, 5).map((sale: any) => (
                    <div
                      key={sale._id}
                      className="flex items-start p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-2 rounded-full bg-blue-100 mr-3 mt-0.5">
                        <ShoppingBag className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{sale.nombre}</p>
                          <p className="font-semibold text-blue-600">${sale.precio}</p>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{sale.descripcion}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            sale.estado === 'venta' ? 'bg-blue-100 text-blue-800' :
                            sale.estado === 'vendido' ? 'bg-green-100 text-green-800' :
                            sale.estado === 'pausado' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sale.estado}
                          </span>
                          <p className="text-xs text-gray-400">
                            {new Date(sale.fechaCreacion).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Notificaciones Recientes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Notificaciones Recientes</h2>
              <Link to="/client/notificaciones" className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                Ver todas <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="px-6 py-4">
              {notificationsCount === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No tienes notificaciones recientes</p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map((notification: any) => (
                    <div
                      key={notification._id}
                      className="flex items-start p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="p-2 rounded-full bg-blue-100 mr-3 mt-0.5">
                        <Bell className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{notification.titulo || 'Notificación'}</p>
                        <p className="text-sm text-gray-500 mt-1">{notification.mensaje}</p>
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
