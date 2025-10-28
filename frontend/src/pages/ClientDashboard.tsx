import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  Package, 
  Smartphone, 
  Clock, 
  CheckCircle,
  Plus,
  Eye
} from 'lucide-react';
import { devicesApi, catalogApi } from '../services/api';

export const ClientDashboard: React.FC = () => {
  const { data: catalog } = useQuery('catalog', catalogApi.getAll);
  const { data: myDevices } = useQuery('myDevices', devicesApi.getAll);

  const stats = [
    {
      name: 'Dispositivos Disponibles',
      value: catalog?.data?.length || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Mis Solicitudes',
      value: myDevices?.data?.length || 0,
      icon: Smartphone,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'En Evaluación',
      value: myDevices?.data?.filter((d: any) => d.estadoCotizaci === 'En Curso').length || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Aceptadas',
      value: myDevices?.data?.filter((d: any) => d.estadoCotizaci === 'aceptado').length || 0,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi Panel de Cliente</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona tus dispositivos y solicitudes de reciclaje
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
              <Eye className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Ver Catálogo</p>
                <p className="text-sm text-gray-500">Explora dispositivos disponibles</p>
              </div>
            </Link>
            
            <Link
              to="/devices"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Solicitar Evaluación</p>
                <p className="text-sm text-gray-500">Envía tu dispositivo para cotización</p>
              </div>
            </Link>
            
            <Link
              to="/devices"
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Smartphone className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Mis Solicitudes</p>
                <p className="text-sm text-gray-500">Revisa el estado de tus dispositivos</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Mis Solicitudes Recientes</h3>
          <div className="space-y-3">
            {myDevices?.data?.slice(0, 5).map((device: any) => (
              <div key={device.idDispositivo} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <Smartphone className="h-5 w-5 text-blue-500 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Dispositivo #{device.idDispositivo}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(device.fecha).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  device.estadoCotizaci === 'En Curso' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : device.estadoCotizaci === 'aceptado'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {device.estadoCotizaci}
                </span>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">No tienes solicitudes aún</p>
            )}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">¿Cómo funciona ReeUtil?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-blue-100">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">1. Explora el Catálogo</h4>
            <p className="text-sm text-gray-500">
              Revisa los tipos de dispositivos que aceptamos para reciclaje
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-green-100">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">2. Solicita Evaluación</h4>
            <p className="text-sm text-gray-500">
              Envía los detalles de tu dispositivo para obtener una cotización
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-purple-100">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">3. Recibe tu Cotización</h4>
            <p className="text-sm text-gray-500">
              Nuestros expertos evaluarán tu dispositivo y te darán una oferta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
