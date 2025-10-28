import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Recycle as RecycleIcon, Search, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { recycleApi } from '../../services/marketplaceApi';

export const RecycleManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedRecycle, setSelectedRecycle] = useState<any>(null);
  const [quoteData, setQuoteData] = useState({ monto: '', tiempoEstimado: '', detalles: '' });
  
  // Obtener todos los reciclajes
  const { data: recyclesResponse, isLoading, refetch } = useQuery(
    ['allRecycles', statusFilter, searchTerm], 
    () => recycleApi.getAllRecycleRequests({ estado: statusFilter !== 'all' ? statusFilter : undefined, search: searchTerm })
      .then(response => response.data)
  );

  const recyclesData = recyclesResponse?.data?.reciclajes || [];
  
  // Usar solo datos reales
  const filteredRecycles = recyclesData;

  // Manejar evaluación
  const handleEvaluate = async (id: string) => {
    try {
      await recycleApi.evaluateRecycle(id);
      refetch();
    } catch (error) {
      console.error('Error al evaluar:', error);
    }
  };

  // Abrir modal de cotización
  const handleOpenQuote = (recycle: any) => {
    setSelectedRecycle(recycle);
    setShowQuoteModal(true);
  };

  // Enviar cotización
  const handleSubmitQuote = async () => {
    if (!selectedRecycle) return;
    try {
      await recycleApi.updateRecycleQuote(selectedRecycle._id, {
        monto: Number(quoteData.monto),
        tiempoEstimado: quoteData.tiempoEstimado,
        detalles: quoteData.detalles
      });
      setShowQuoteModal(false);
      setQuoteData({ monto: '', tiempoEstimado: '', detalles: '' });
      refetch();
    } catch (error) {
      console.error('Error al cotizar:', error);
    }
  };

  // Marcar como completado
  const handleComplete = async (id: string) => {
    if (window.confirm('¿Marcar este reciclaje como completado?')) {
      try {
        await recycleApi.completeRecycle(id);
        alert('✅ Reciclaje completado exitosamente');
        refetch();
      } catch (error) {
        console.error('Error al completar:', error);
        alert('❌ Error al completar el reciclaje');
      }
    }
  };

  // Rechazar reciclaje
  const handleReject = async (id: string) => {
    if (window.confirm('¿Estás seguro de rechazar este reciclaje?')) {
      try {
        await recycleApi.rejectRecycleAdmin(id);
        refetch();
      } catch (error) {
        console.error('Error al rechazar:', error);
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
      case 'en_reparacion': return 'En Proceso';
      case 'completado': return 'Completado';
      case 'rechazado': return 'Rechazado';
      default: return status;
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Reciclaje</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administra las solicitudes de reciclaje de dispositivos
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar solicitudes..."
            className="flex-1 border-none focus:ring-0 focus:outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="form-select rounded-lg border-gray-200 shadow-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendientes</option>
          <option value="evaluando">En evaluación</option>
          <option value="cotizado">Cotizadas</option>
          <option value="completado">Completadas</option>
          <option value="rechazado">Rechazadas</option>
        </select>
      </div>

      {/* Lista de solicitudes */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Cargando reciclajes...</p>
        </div>
      ) : (
      <div className="space-y-4">
        {filteredRecycles.map((recycle: any) => (
          <div key={recycle._id || recycle.id} className="card hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Icono */}
                  <div className="p-2 rounded-full bg-green-100">
                    <RecycleIcon className="h-5 w-5 text-green-600" />
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">{recycle.tipoDispositivo}</h3>
                    <p className="text-sm text-gray-500 mt-1">{recycle.marca} {recycle.modelo}</p>
                    <p className="text-sm text-gray-600 mt-1">{recycle.descripcion}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <span>Solicitado el {recycle.fechaSolicitud ? new Date(recycle.fechaSolicitud).toLocaleDateString() : recycle.date}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Cliente: {recycle.usuario?.name || recycle.customer}
                    </div>
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(recycle.estado || recycle.status)}`}>
                  {getStatusText(recycle.estado || recycle.status)}
                </span>
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
              
              {/* Cotización */}
              {(recycle.cotizacion || recycle.quote) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Cotización:</h4>
                      <div className="flex items-center mt-1">
                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                        <span className="font-medium text-gray-900">{recycle.cotizacion?.monto || recycle.quote?.amount}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Tiempo estimado: {recycle.cotizacion?.tiempoEstimado || recycle.quote?.time} {typeof recycle.cotizacion?.tiempoEstimado === 'string' ? '' : 'días'}
                      </div>
                    </div>
                    
                    {(recycle.estado || recycle.status) === 'cotizado' && (
                      <div className="flex space-x-2">
                        <button className="btn-outline-danger flex items-center text-xs px-3 py-1">
                          <XCircle className="h-3 w-3 mr-1" />
                          Rechazar
                        </button>
                        <button className="btn-outline-primary flex items-center text-xs px-3 py-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aprobar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Acciones */}
              <div className="mt-4 flex justify-end space-x-2">
                {(recycle.estado || recycle.status) === 'pendiente' && (
                  <>
                    <button onClick={() => handleEvaluate(recycle._id)} className="btn-primary flex items-center text-xs px-3 py-1">
                      Evaluar
                    </button>
                    <button onClick={() => handleReject(recycle._id)} className="btn-outline-danger flex items-center text-xs px-3 py-1">
                      Rechazar
                    </button>
                  </>
                )}
                
                {(recycle.estado || recycle.status) === 'evaluando' && (
                  <button onClick={() => handleOpenQuote(recycle)} className="btn-primary flex items-center text-xs px-3 py-1">
                    Cotizar
                  </button>
                )}
                
                {(recycle.estado || recycle.status) === 'en_reparacion' && (
                  <button onClick={() => handleComplete(recycle._id)} className="btn-primary flex items-center text-xs px-3 py-1">
                    Marcar como completado
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredRecycles.length === 0 && (
          <div className="text-center py-12 card">
            <RecycleIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No hay solicitudes</h3>
            <p className="mt-1 text-gray-500">No se encontraron solicitudes de reciclaje que coincidan con los filtros</p>
          </div>
        )}
      </div>
      )}

      {/* Modal de cotización */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Cotizar Reciclaje</h2>
              <button onClick={() => setShowQuoteModal(false)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Monto (Bs)</label>
                <input
                  type="number"
                  value={quoteData.monto}
                  onChange={(e) => setQuoteData({...quoteData, monto: e.target.value})}
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="150.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Tiempo Estimado</label>
                <input
                  type="text"
                  value={quoteData.tiempoEstimado}
                  onChange={(e) => setQuoteData({...quoteData, tiempoEstimado: e.target.value})}
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="3-5 días"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Detalles</label>
                <textarea
                  value={quoteData.detalles}
                  onChange={(e) => setQuoteData({...quoteData, detalles: e.target.value})}
                  className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descripción del proceso de reciclaje"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowQuoteModal(false)} className="btn-outline">
                  Cancelar
                </button>
                <button onClick={handleSubmitQuote} className="btn-primary">
                  Enviar Cotización
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
