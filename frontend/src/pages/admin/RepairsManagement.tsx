import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Wrench, Search, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { repairApi } from '../../services/marketplaceApi';

export const RepairsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<any>(null);
  const [quoteData, setQuoteData] = useState({ monto: '', tiempoEstimado: '', detalles: '' });
  
  // Obtener todas las reparaciones
  const { data: repairsResponse, isLoading, refetch } = useQuery(
    ['allRepairs', statusFilter, searchTerm], 
    () => repairApi.getAllRepairRequests({ estado: statusFilter !== 'all' ? statusFilter : undefined, search: searchTerm })
      .then(response => response.data)
  );

  const repairsData = repairsResponse?.data?.reparaciones || [];
  
  // Usar solo datos reales
  const filteredRepairs = repairsData;

  // Manejar evaluación
  const handleEvaluate = async (id: string) => {
    try {
      await repairApi.evaluateRepair(id);
      refetch();
    } catch (error) {
      console.error('Error al evaluar:', error);
    }
  };

  // Abrir modal de cotización
  const handleOpenQuote = (repair: any) => {
    setSelectedRepair(repair);
    setShowQuoteModal(true);
  };

  // Enviar cotización
  const handleSubmitQuote = async () => {
    if (!selectedRepair) return;
    try {
      await repairApi.updateRepairQuote(selectedRepair._id, {
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
    if (window.confirm('¿Marcar esta reparación como completada?')) {
      try {
        await repairApi.completeRepair(id);
        alert('✅ Reparación completada exitosamente');
        refetch();
      } catch (error) {
        console.error('Error al completar:', error);
        alert('❌ Error al completar la reparación');
      }
    }
  };

  // Rechazar reparación
  const handleReject = async (id: string) => {
    if (window.confirm('¿Estás seguro de rechazar esta reparación?')) {
      try {
        await repairApi.rejectRepairAdmin(id);
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
      case 'en_reparacion': return 'En reparación';
      case 'completado': return 'Completado';
      case 'rechazado': return 'Rechazado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Reparaciones</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administra las solicitudes de reparación de dispositivos
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar reparaciones..."
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
          <option value="en_reparacion">En reparación</option>
          <option value="completado">Completadas</option>
          <option value="rechazado">Rechazadas</option>
        </select>
      </div>

      {/* Lista de reparaciones */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Cargando reparaciones...</p>
        </div>
      ) : (
      <div className="space-y-4">
        {filteredRepairs.map((repair: any) => (
          <div key={repair._id || repair.id} className="card hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Icono */}
                  <div className="p-2 rounded-full bg-blue-100">
                    <Wrench className="h-5 w-5 text-blue-600" />
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">{repair.tipoDispositivo || repair.device}</h3>
                    <p className="text-sm text-gray-500 mt-1">{repair.marca} {repair.modelo}</p>
                    <p className="text-sm text-gray-600 mt-1">{repair.descripcionProblema || repair.problem}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <span>Solicitado el {repair.fechaSolicitud ? new Date(repair.fechaSolicitud).toLocaleDateString() : repair.date}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Cliente: {repair.usuario?.name || repair.customer}
                    </div>
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(repair.estado || repair.status)}`}>
                  {getStatusText(repair.estado || repair.status)}
                </span>
              </div>
              
              {/* Imágenes */}
              {repair.imagenes && repair.imagenes.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Imagen del Equipo:</h4>
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {repair.imagenes.map((img: string, idx: number) => (
                      <a key={idx} href={img} target="_blank" rel="noopener noreferrer" className="h-24 w-24 rounded-md bg-gray-200 flex-shrink-0 overflow-hidden hover:opacity-75 transition-opacity">
                        <img src={img} alt={`Imagen ${idx + 1}`} className="h-full w-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Cotización */}
              {(repair.cotizacion || repair.quote) && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Cotización:</h4>
                      <div className="flex items-center mt-1">
                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                        <span className="font-medium text-gray-900">{repair.cotizacion?.monto || repair.quote?.amount}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Tiempo estimado: {repair.cotizacion?.tiempoEstimado || repair.quote?.time} {typeof repair.cotizacion?.tiempoEstimado === 'string' ? '' : 'días'}
                      </div>
                    </div>
                    
                    {(repair.estado || repair.status) === 'cotizado' && (
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
                {(repair.estado || repair.status) === 'pendiente' && (
                  <>
                    <button onClick={() => handleEvaluate(repair._id)} className="btn-primary flex items-center text-xs px-3 py-1">
                      Evaluar
                    </button>
                    <button onClick={() => handleReject(repair._id)} className="btn-outline-danger flex items-center text-xs px-3 py-1">
                      Rechazar
                    </button>
                  </>
                )}
                
                {(repair.estado || repair.status) === 'evaluando' && (
                  <button onClick={() => handleOpenQuote(repair)} className="btn-primary flex items-center text-xs px-3 py-1">
                    Cotizar
                  </button>
                )}
                
                {(repair.estado || repair.status) === 'en_reparacion' && (
                  <button onClick={() => handleComplete(repair._id)} className="btn-primary flex items-center text-xs px-3 py-1">
                    Marcar como completado
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredRepairs.length === 0 && (
          <div className="text-center py-12 card">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No hay reparaciones</h3>
            <p className="mt-1 text-gray-500">No se encontraron solicitudes de reparación que coincidan con los filtros</p>
          </div>
        )}
      </div>
      )}

      {/* Modal de cotización */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Cotizar Reparación</h2>
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
                  placeholder="Descripción de la reparación a realizar"
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
