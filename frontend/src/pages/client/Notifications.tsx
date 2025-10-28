import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Bell,
  Check,
  Trash2,
  ShoppingBag,
  ShoppingCart,
  Wrench,
  Recycle as RecycleIcon,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  AlertCircle,
  Eye
} from 'lucide-react';
import { notificationsApi } from '../../services/marketplaceApi';

export const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();
  
  // Obtener notificaciones
  const { data: notifications, isLoading } = useQuery('notifications', notificationsApi.getMyNotifications);
  
  // Mutaciones para acciones en notificaciones
  const markAsReadMutation = useMutation(
    (id: string) => notificationsApi.markAsRead(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
      }
    }
  );
  
  const markAllAsReadMutation = useMutation(
    () => notificationsApi.markAllAsRead(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
      }
    }
  );
  
  const deleteNotificationMutation = useMutation(
    (id: string) => notificationsApi.deleteNotification(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
      }
    }
  );
  
  // Filtrar por estado
  const filteredNotifications = notifications?.data?.filter((notification: any) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    if (activeTab === 'read') return notification.read;
    return true;
  });
  
  // Marcar como leída
  const handleMarkAsRead = (id: string) => {
    markAsReadMutation.mutate(id);
  };
  
  // Marcar todas como leídas
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };
  
  // Eliminar notificación
  const handleDelete = (id: string) => {
    deleteNotificationMutation.mutate(id);
  };
  
  // Obtener icono según tipo
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sale':
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case 'purchase':
        return <ShoppingCart className="h-5 w-5 text-green-500" />;
      case 'repair':
        return <Wrench className="h-5 w-5 text-yellow-500" />;
      case 'recycle':
        return <RecycleIcon className="h-5 w-5 text-green-500" />;
      case 'review':
        return <Star className="h-5 w-5 text-orange-500" />;
      case 'quote':
        return <DollarSign className="h-5 w-5 text-purple-500" />;
      case 'status':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="mt-1 text-sm text-gray-500">
            Mantente al día con tus ventas, compras, reparaciones y reciclaje
          </p>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          className="btn-outline flex items-center"
          disabled={!notifications?.data?.some((n: any) => !n.read)}
        >
          <Check className="h-4 w-4 mr-2" />
          Marcar todas como leídas
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'unread'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            No leídas
            {notifications?.data?.filter((n: any) => !n.read).length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-800">
                {notifications?.data?.filter((n: any) => !n.read).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('read')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'read'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Leídas
          </button>
        </nav>
      </div>

      {/* Lista de notificaciones */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Cargando notificaciones...</p>
        </div>
      ) : filteredNotifications?.length > 0 ? (
        <div className="space-y-4">
          {filteredNotifications.map((notification: any) => (
            <div 
              key={notification._id} 
              className={`card hover:shadow-md transition-shadow ${!notification.read ? 'border-l-4 border-l-primary-500' : ''}`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Icono según tipo */}
                    <div className={`p-2 rounded-full ${!notification.read ? 'bg-primary-100' : 'bg-gray-100'}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                      <div className="mt-2 flex items-center text-xs text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="p-1 rounded-full hover:bg-gray-100"
                        title="Marcar como leída"
                      >
                        <Check className="h-4 w-4 text-gray-400 hover:text-primary-500" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="p-1 rounded-full hover:bg-gray-100"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
                
                {/* Acciones específicas según el tipo de notificación */}
                {notification.actions && (
                  <div className="mt-4 flex justify-end space-x-2">
                    {notification.actions.map((action: any) => (
                      <a
                        key={action.label}
                        href={action.url}
                        className={`btn-sm ${
                          action.primary ? 'btn-primary' : 'btn-outline'
                        } flex items-center`}
                      >
                        {action.icon === 'check' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {action.icon === 'x' && <XCircle className="h-3 w-3 mr-1" />}
                        {action.icon === 'view' && <Eye className="h-3 w-3 mr-1" />}
                        {action.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <Bell className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No tienes notificaciones</h3>
          <p className="mt-1 text-gray-500">
            {activeTab === 'unread' 
              ? 'No tienes notificaciones sin leer' 
              : activeTab === 'read'
              ? 'No tienes notificaciones leídas'
              : 'Cuando tengas actividad, aparecerá aquí'}
          </p>
        </div>
      )}
      
      {/* Preferencias */}
      <div className="card mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Preferencias de notificaciones</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Notificaciones de ventas</p>
              <p className="text-sm text-gray-500">Recibe alertas cuando alguien compre tus productos</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider round"></span>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Notificaciones de compras</p>
              <p className="text-sm text-gray-500">Recibe actualizaciones sobre tus compras</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider round"></span>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Notificaciones de reparaciones</p>
              <p className="text-sm text-gray-500">Recibe actualizaciones sobre el estado de tus reparaciones</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider round"></span>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Notificaciones de reciclaje</p>
              <p className="text-sm text-gray-500">Recibe actualizaciones sobre tus solicitudes de reciclaje</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider round"></span>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Notificaciones por email</p>
              <p className="text-sm text-gray-500">Recibe notificaciones importantes por email</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
