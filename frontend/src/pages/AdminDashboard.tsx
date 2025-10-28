import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Package, 
  Smartphone, 
  Archive, 
  Users, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { devicesApi, catalogApi } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const { data: pendingDevices } = useQuery('pendingDevices', devicesApi.getPending);
  const { data: acceptedDevices } = useQuery('acceptedDevices', devicesApi.getAccepted);
  const { data: catalog } = useQuery('catalog', catalogApi.getAll);

  const stats = [
    {
      name: 'Dispositivos en Catálogo',
      value: catalog?.data?.length || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Solicitudes Pendientes',
      value: pendingDevices?.data?.length || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Cotizaciones Aceptadas',
      value: acceptedDevices?.data?.length || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Dispositivos',
      value: (pendingDevices?.data?.length || 0) + (acceptedDevices?.data?.length || 0),
      icon: Smartphone,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona el sistema de reciclaje de dispositivos electrónicos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <Link
              to="/catalog"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Package className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Gestionar Catálogo</p>
                <p className="text-sm text-gray-500">Agregar o modificar dispositivos</p>
              </div>
            </Link>
            
            <Link
              to="/devices"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Smartphone className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Revisar Solicitudes</p>
                <p className="text-sm text-gray-500">Evaluar dispositivos para cotización</p>
              </div>
            </Link>
            
            <Link
              to="/inventory"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Archive className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Ver Inventario</p>
                <p className="text-sm text-gray-500">Dispositivos listos para reciclar/vender</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Solicitudes Recientes</h3>
          <div className="space-y-3">
            {pendingDevices?.data?.slice(0, 5).map((device: any) => (
              <div key={device.idDispositivo} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Dispositivo #{device.idDispositivo}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(device.fecha).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pendiente
                </span>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No hay solicitudes pendientes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
