import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Recycle as RecycleIcon,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
  Smartphone,
  Laptop,
  Monitor,
  Printer,
  Star
} from 'lucide-react';
import { recycleApi } from '../../services/marketplaceApi';

export const Recycle: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Obtener solicitudes de reciclaje
  const { data: recycleRequests, isLoading, refetch } = useQuery('recycleRequests', recycleApi.getMyRecycleRequests);
  
  // Filtrar por estado
  const filteredRequests = recycleRequests?.data?.filter((recycle: any) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return recycle.estado === 'pendiente' || recycle.estado === 'evaluando';
    if (activeTab === 'quoted') return recycle.estado === 'cotizado';
    if (activeTab === 'completed') return recycle.estado === 'completado';
    return true;
  });
  
  // Aceptar cotización
  const handleAcceptQuote = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas aceptar esta cotización?')) {
      try {
        await recycleApi.acceptRecycleQuote(id);
        refetch();
      } catch (error) {
        console.error('Error al aceptar la cotización:', error);
      }
    }
  };
  
  // Rechazar cotización
  const handleRejectQuote = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas rechazar esta cotización?')) {
      try {
        await recycleApi.rejectRecycleQuote(id);
        refetch();
      } catch (error) {
        console.error('Error al rechazar la cotización:', error);
      }
    }
  };
  
  // Obtener icono según tipo de dispositivo
  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'smartphone':
      case 'celular':
      case 'teléfono':
        return <Smartphone className="h-6 w-6 text-green-600" />;
      case 'laptop':
      case 'portátil':
      case 'notebook':
        return <Laptop className="h-6 w-6 text-blue-600" />;
      case 'monitor':
      case 'pantalla':
        return <Monitor className="h-6 w-6 text-purple-600" />;
      case 'impresora':
      case 'printer':
        return <Printer className="h-6 w-6 text-orange-600" />;
      default:
        return <RecycleIcon className="h-6 w-6 text-green-600" />;
    }
  };
  
  // Obtener color según estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'evaluando': return 'bg-blue-100 text-blue-800';
      case 'cotizado': return 'bg-purple-100 text-purple-800';
      case 'completado': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Obtener texto según estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'evaluando': return 'En evaluación';
      case 'cotizado': return 'Cotizado';
      case 'completado': return 'Completado';
      case 'rechazado': return 'Rechazado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reciclar Dispositivos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Recicla tus dispositivos electrónicos y recibe compensación
          </p>
        </div>
        <Link
          to="/client/reciclar/nuevo"
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Reciclaje
        </Link>
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
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setActiveTab('quoted')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quoted'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cotizadas
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Completadas
          </button>
        </nav>
      </div>

      {/* Lista de solicitudes */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Cargando tus solicitudes...</p>
        </div>
      ) : filteredRequests?.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((recycle: any) => (
            <div key={recycle._id} className="card hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Icono según tipo de dispositivo */}
                    <div className="bg-green-100 p-3 rounded-lg">
                      {getDeviceIcon(recycle.tipoDispositivo)}
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900">{recycle.tipoDispositivo}</h3>
                      <p className="text-sm text-gray-500 mt-1">{recycle.marca} {recycle.modelo}</p>
                      <div className="mt-2 flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">
                          Solicitado el {new Date(recycle.fechaSolicitud).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(recycle.estado)}`}>
                    {getStatusText(recycle.estado)}
                  </span>
                </div>
                
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Descripción:</h4>
                      <p className="text-sm text-gray-600">{recycle.descripcion}</p>
                    </div>
                    
                    {recycle.estado === 'cotizado' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Oferta de compensación:</h4>
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-green-600 mr-1" />
                          <span className="text-lg font-semibold text-gray-900">{recycle.cotizacion?.monto.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {recycle.cotizacion?.comentarios || 'Basado en el estado y modelo del dispositivo'}
                        </p>
                      </div>
                    )}
                    
                    {recycle.estado === 'completado' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Compensación recibida:</h4>
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-green-600 mr-1" />
                          <span className="text-lg font-semibold text-gray-900">{recycle.compensacionFinal.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Completado el {new Date(recycle.fechaFinalizacion).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Imágenes */}
                {recycle.imagenes && recycle.imagenes.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Imágenes:</h4>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {recycle.imagenes.map((img: string, idx: number) => (
                        <div key={idx} className="h-16 w-16 rounded-md bg-gray-200 flex-shrink-0 overflow-hidden">
                          <img src={img} alt={`Imagen ${idx + 1}`} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Acciones */}
                <div className="mt-4 flex justify-end space-x-2">
                  {recycle.estado === 'cotizado' && (
                    <>
                      <button
                        onClick={() => handleRejectQuote(recycle._id)}
                        className="btn-outline-danger flex items-center"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar
                      </button>
                      <button
                        onClick={() => handleAcceptQuote(recycle._id)}
                        className="btn-primary flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aceptar
                      </button>
                    </>
                  )}
                  
                  {recycle.estado === 'completado' && !recycle.resena && (
                    <Link
                      to={`/client/resenas/nuevo?tipo=reciclaje&id=${recycle._id}`}
                      className="btn-outline-primary flex items-center"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Dejar Reseña
                    </Link>
                  )}
                  
                  <Link
                    to={`/client/reciclar/${recycle._id}`}
                    className="btn-outline flex items-center"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Detalles
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <RecycleIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No tienes solicitudes de reciclaje</h3>
          <p className="mt-1 text-gray-500">Recicla tus dispositivos electrónicos y recibe compensación</p>
          <Link
            to="/client/reciclar/nuevo"
            className="btn-primary mt-4 inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Reciclaje
          </Link>
        </div>
      )}
      
      {/* Cómo funciona */}
      <div className="card mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">¿Cómo funciona el reciclaje?</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">1. Registra</h4>
            <p className="text-sm text-gray-500">
              Describe tu dispositivo y envía fotos
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">2. Recibe Oferta</h4>
            <p className="text-sm text-gray-500">
              Te ofrecemos una compensación por tu dispositivo
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-yellow-100">
                <RecycleIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">3. Envío</h4>
            <p className="text-sm text-gray-500">
              Envía tu dispositivo a nuestro centro de reciclaje
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-purple-100">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">4. Recibe Compensación</h4>
            <p className="text-sm text-gray-500">
              Recibe tu pago por contribuir al medio ambiente
            </p>
          </div>
        </div>
      </div>
      
      {/* Beneficios */}
      <div className="card bg-green-50 border-green-100">
        <h3 className="text-lg font-medium text-green-800 mb-4">Beneficios del Reciclaje Electrónico</h3>
        <ul className="space-y-2 text-green-700">
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
            <span>Reduces la contaminación y protege el medio ambiente</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
            <span>Recuperas valor económico de dispositivos que ya no utilizas</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
            <span>Contribuyes a la economía circular y sostenible</span>
          </li>
          <li className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
            <span>Evitas que materiales tóxicos contaminen suelos y aguas</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
