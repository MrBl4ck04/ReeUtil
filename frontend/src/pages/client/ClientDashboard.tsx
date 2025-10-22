import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ShoppingBag,
  ShoppingCart,
  Wrench,
  Recycle as RecycleIcon,
  Star,
  Bell,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { marketplaceApi, notificationsApi, repairApi, recycleApi } from '../../services/marketplaceApi';

export const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Consultas para obtener datos de diferentes servicios
  const { data: myProducts } = useQuery('myProducts', marketplaceApi.getMyProducts);
  const { data: myPurchases } = useQuery('myPurchases', marketplaceApi.getMyPurchases);
  const { data: repairRequests } = useQuery('repairRequests', repairApi.getMyRepairRequests);
  const { data: recycleRequests } = useQuery('recycleRequests', recycleApi.getMyRecycleRequests);
  const { data: notifications } = useQuery('notifications', notificationsApi.getMyNotifications);

  // Estadísticas para mostrar en el dashboard
  const stats = [
    {
      name: 'Mis Ventas',
      value: myProducts?.data?.length || 0,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      href: '/client/ventas'
    },
    {
      name: 'Mis Compras',
      value: myPurchases?.data?.length || 0,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      href: '/client/compras'
    },
    {
      name: 'Reparaciones',
      value: repairRequests?.data?.length || 0,
      icon: Wrench,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      href: '/client/reparaciones'
    },
    {
      name: 'Reciclaje',
      value: recycleRequests?.data?.length || 0,
      icon: RecycleIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      href: '/client/reciclar'
    },
    {
      name: 'Notificaciones',
      value: notifications?.data?.filter((n: any) => !n.read).length || 0,
      icon: Bell,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      href: '/client/notificaciones'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Panel de Cliente</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenido, {user?.nombre}. Gestiona tus ventas, compras, reparaciones y reciclaje.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
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

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <Link
              to="/client/ventas/nuevo"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Vender un Producto</p>
                  <p className="text-sm text-gray-500">Publica un producto para vender</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
            
            <Link
              to="/client/compras"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <ShoppingCart className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Comprar Productos</p>
                  <p className="text-sm text-gray-500">Explora productos disponibles</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
            
            <Link
              to="/client/reparaciones/nuevo"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Wrench className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Solicitar Reparación</p>
                  <p className="text-sm text-gray-500">Envía tu dispositivo para reparación</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
            
            <Link
              to="/client/reciclar/nuevo"
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <RecycleIcon className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Reciclar Dispositivo</p>
                  <p className="text-sm text-gray-500">Recicla dispositivos y obtén compensación</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones Recientes</h3>
          <div className="space-y-3">
            {notifications?.data?.slice(0, 5).map((notification: any) => (
              <div 
                key={notification._id} 
                className={`flex items-center p-3 rounded-lg border ${notification.read ? 'border-gray-200' : 'border-blue-300 bg-blue-50'}`}
              >
                <div className="flex-shrink-0 mr-3">
                  {notification.type === 'repair' && <Wrench className="h-5 w-5 text-yellow-500" />}
                  {notification.type === 'recycle' && <RecycleIcon className="h-5 w-5 text-purple-500" />}
                  {notification.type === 'sale' && <ShoppingBag className="h-5 w-5 text-blue-500" />}
                  {notification.type === 'purchase' && <ShoppingCart className="h-5 w-5 text-green-500" />}
                  {notification.type === 'review' && <Star className="h-5 w-5 text-orange-500" />}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-500">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No tienes notificaciones recientes</p>
            )}
            
            {notifications?.data?.length > 0 && (
              <Link 
                to="/client/notificaciones"
                className="block text-center text-sm font-medium text-primary-600 hover:text-primary-700 mt-2"
              >
                Ver todas las notificaciones
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
