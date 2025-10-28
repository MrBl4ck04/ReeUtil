import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
  Camera,
  Star
} from 'lucide-react';
import { repairApi } from '../../services/marketplaceApi';
import NuevaReparacionModal from '../../components/repairs/NuevaReparacionModal';

export const Repairs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Obtener solicitudes de reparación
  const { data: repairRequests, isLoading, refetch } = useQuery('repairRequests', () =>
    repairApi.getMyRepairRequests().then(response => response.data)
  );
  
  // Filtrar por estado
  const filteredRequests = repairRequests?.data?.filter((repair: any) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return repair.estado === 'pendiente' || repair.estado === 'evaluando';
    if (activeTab === 'quoted') return repair.estado === 'cotizado';
    if (activeTab === 'in_progress') return repair.estado === 'en_reparacion';
    if (activeTab === 'completed') return repair.estado === 'completado';
    return true;
  });
  
  // Aceptar cotización
  const handleAcceptQuote = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas aceptar esta cotización?')) {
      try {
        const response = await repairApi.acceptRepairQuote(id);
        console.log('Respuesta:', response);
        alert('✅ Cotización aceptada. Tu dispositivo entrará en reparación.');
        refetch();
      } catch (error: any) {
        console.error('Error al aceptar la cotización:', error);
        console.error('Detalles del error:', error.response?.data);
        const errorMessage = error.response?.data?.message || 'Error desconocido';
        alert(`❌ Error: ${errorMessage}`);
      }
    }
  };
  
  // Rechazar cotización
  const handleRejectQuote = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas rechazar esta cotización?')) {
      try {
        await repairApi.rejectRepairQuote(id);
        refetch();
      } catch (error) {
        console.error('Error al rechazar la cotización:', error);
      }
    }
  };
  
  // Obtener color según estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'evaluando': return 'bg-blue-100 text-blue-800';
      case 'cotizado': return 'bg-purple-100 text-purple-800';
      case 'en_reparacion': return 'bg-orange-100 text-orange-800';
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
      case 'en_reparacion': return 'En reparación';
      case 'completado': return 'Completado';
      case 'rechazado': return 'Rechazado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Reparaciones</h1>
          <p className="mt-1 text-sm text-gray-500">
            Solicita y gestiona reparaciones de tus dispositivos
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Solicitud
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
            onClick={() => setActiveTab('in_progress')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'in_progress'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            En Reparación
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
          {filteredRequests.map((repair: any) => (
            <div key={repair._id} className="card hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Icono según tipo de dispositivo */}
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Wrench className="h-6 w-6 text-blue-600" />
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900">{repair.tipoDispositivo}</h3>
                      <p className="text-sm text-gray-500 mt-1">{repair.marca} {repair.modelo}</p>
                      <div className="mt-2 flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">
                          Solicitado el {new Date(repair.fechaSolicitud).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(repair.estado)}`}>
                    {getStatusText(repair.estado)}
                  </span>
                </div>
                
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Problema reportado:</h4>
                      <p className="text-sm text-gray-600">{repair.descripcionProblema}</p>
                    </div>
                    
                    {repair.estado === 'cotizado' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Cotización:</h4>
                        <div className="flex items-center">
                          <DollarSign className="h-5 w-5 text-green-600 mr-1" />
                          <span className="text-lg font-semibold text-gray-900">{repair.cotizacion?.monto.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Tiempo estimado: {repair.cotizacion?.tiempoEstimado} días</p>
                      </div>
                    )}
                    
                    {repair.estado === 'en_reparacion' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Estado de reparación:</h4>
                        <p className="text-sm text-gray-600">{repair.estadoReparacion || 'En proceso'}</p>
                        <p className="text-xs text-gray-500 mt-1">Fecha estimada de finalización: {new Date(repair.fechaEstimadaFinalizacion).toLocaleDateString()}</p>
                      </div>
                    )}
                    
                    {repair.estado === 'completado' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Detalles de reparación:</h4>
                        <p className="text-sm text-gray-600">{repair.detallesReparacion}</p>
                        <p className="text-xs text-gray-500 mt-1">Completado el {new Date(repair.fechaFinalizacion).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Imágenes */}
                {repair.imagenes && repair.imagenes.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Imagen del Equipo:</h4>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {repair.imagenes.map((img: string, idx: number) => (
                        <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="h-20 w-20 rounded-md bg-gray-200 flex-shrink-0 overflow-hidden hover:opacity-75 transition-opacity">
                          <img src={img} alt={`Imagen ${idx + 1}`} className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Acciones */}
                <div className="mt-4 flex justify-end space-x-2">
                  {repair.estado === 'cotizado' && (
                    <>
                      <button
                        onClick={() => handleRejectQuote(repair._id)}
                        className="btn-outline-danger flex items-center"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar
                      </button>
                      <button
                        onClick={() => handleAcceptQuote(repair._id)}
                        className="btn-primary flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aceptar
                      </button>
                    </>
                  )}
                  
                  {repair.estado === 'completado' && !repair.resena && (
                    <Link
                      to={`/client/resenas/nuevo?tipo=reparacion&id=${repair._id}`}
                      className="btn-outline-primary flex items-center"
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Dejar Reseña
                    </Link>
                  )}
                  
                  <Link
                    to={`/client/reparaciones/${repair._id}`}
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
          <Wrench className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No tienes solicitudes de reparación</h3>
          <p className="mt-1 text-gray-500">Solicita la reparación de tus dispositivos electrónicos</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary mt-4 inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </button>
        </div>
      )}
      
      {/* Cómo funciona */}
      <div className="card mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">¿Cómo funciona el servicio de reparaciones?</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">1. Solicita</h4>
            <p className="text-sm text-gray-500">
              Describe el problema de tu dispositivo y envía fotos
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">2. Recibe Cotización</h4>
            <p className="text-sm text-gray-500">
              Nuestros técnicos evaluarán y te enviarán un presupuesto
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-yellow-100">
                <Wrench className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">3. Reparación</h4>
            <p className="text-sm text-gray-500">
              Nuestro equipo reparará tu dispositivo
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-purple-100">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">4. Recibe tu Dispositivo</h4>
            <p className="text-sm text-gray-500">
              Recibe tu dispositivo reparado y funcionando
            </p>
          </div>
        </div>
      </div>

      {/* Modal para crear nueva reparación */}
      <NuevaReparacionModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={refetch}
      />
    </div>
  );
};
