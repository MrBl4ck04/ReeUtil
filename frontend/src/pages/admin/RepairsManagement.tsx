import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Wrench, Search, CheckCircle, XCircle, Clock, DollarSign, Edit, Plus, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { repairApi } from '../../services/marketplaceApi';

interface QuoteFormData {
  monto: number;
  tiempoEstimado: number;
  fechaEstimada?: string;
  detalles?: string;
}

interface StatusUpdateData {
  status: string;
  estadoReparacion?: string;
  fechaEstimadaFinalizacion?: string;
  detallesReparacion?: string;
}

export const RepairsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const quoteForm = useForm<QuoteFormData>();
  const statusForm = useForm<StatusUpdateData>();
  
  // Cargar las solicitudes de reparación
  const { data: repairs, isLoading } = useQuery(['repairs', statusFilter], () => 
    repairApi.getAllRepairRequests(statusFilter !== 'all' ? statusFilter : undefined)
  );
  
  // Mutación para actualizar cotización
  const updateQuoteMutation = useMutation(
    ({ id, data }: { id: string; data: QuoteFormData }) => 
      repairApi.updateRepairQuote(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('repairs');
        setShowQuoteModal(false);
        setSelectedRepair(null);
        quoteForm.reset();
        toast.success('Cotización actualizada correctamente');
      },
      onError: () => {
        toast.error('Error al actualizar la cotización');
      }
    }
  );
  
  // Mutación para actualizar estado
  const updateStatusMutation = useMutation(
    ({ id, data }: { id: string; data: StatusUpdateData }) => 
      repairApi.updateRepairStatus(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('repairs');
        setShowStatusModal(false);
        setSelectedRepair(null);
        statusForm.reset();
        toast.success('Estado actualizado correctamente');
      },
      onError: () => {
        toast.error('Error al actualizar el estado');
      }
    }
  );
  
  // Abrir modal de cotización
  const handleOpenQuoteModal = (repair: any) => {
    setSelectedRepair(repair);
    // Pre-cargar datos si ya hay una cotización
    if (repair.cotizacion) {
      quoteForm.setValue('monto', repair.cotizacion.monto);
      quoteForm.setValue('tiempoEstimado', repair.cotizacion.tiempoEstimado);
      
      if (repair.cotizacion.fechaEstimada) {
        const date = new Date(repair.cotizacion.fechaEstimada);
        quoteForm.setValue('fechaEstimada', date.toISOString().split('T')[0]);
      }
      
      if (repair.cotizacion.detalles) {
        quoteForm.setValue('detalles', repair.cotizacion.detalles);
      }
    } else {
      quoteForm.reset();
    }
    setShowQuoteModal(true);
  };
  
  // Abrir modal de actualización de estado
  const handleOpenStatusModal = (repair: any) => {
    setSelectedRepair(repair);
    // Pre-cargar estado actual
    statusForm.setValue('status', repair.estado);
    
    if (repair.estadoReparacion) {
      statusForm.setValue('estadoReparacion', repair.estadoReparacion);
    }
    
    if (repair.fechaEstimadaFinalizacion) {
      const date = new Date(repair.fechaEstimadaFinalizacion);
      statusForm.setValue('fechaEstimadaFinalizacion', date.toISOString().split('T')[0]);
    }
    
    if (repair.detallesReparacion) {
      statusForm.setValue('detallesReparacion', repair.detallesReparacion);
    }
    
    setShowStatusModal(true);
  };
  
  // Manejar envío de cotización
  const handleQuoteSubmit = (data: QuoteFormData) => {
    if (!selectedRepair?._id) return;
    
    // Convertir valores
    const quoteData = {
      ...data,
      monto: Number(data.monto),
      tiempoEstimado: Number(data.tiempoEstimado),
      fechaEstimada: data.fechaEstimada ? new Date(data.fechaEstimada).toISOString() : undefined
    };
    
    updateQuoteMutation.mutate({
      id: selectedRepair._id,
      data: quoteData
    });
  };
  
  // Manejar actualización de estado
  const handleStatusSubmit = (data: StatusUpdateData) => {
    if (!selectedRepair?._id) return;
    
    const statusData = {
      ...data,
      fechaEstimadaFinalizacion: data.fechaEstimadaFinalizacion 
        ? new Date(data.fechaEstimadaFinalizacion).toISOString() 
        : undefined
    };
    
    updateStatusMutation.mutate({
      id: selectedRepair._id,
      data: statusData
    });
  };
  
  // Filtrar reparaciones por búsqueda
  const filteredRepairs = repairs?.data?.filter((repair: any) => {
    if (!repair) return false;
    
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      repair.tipoDispositivo?.toLowerCase().includes(searchTermLower) ||
      repair.marca?.toLowerCase().includes(searchTermLower) ||
      repair.modelo?.toLowerCase().includes(searchTermLower) ||
      repair.descripcionProblema?.toLowerCase().includes(searchTermLower);
      
    return matchesSearch;
  });

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
  
  // Obtener acción siguiente según estado
  const getNextActionButton = (repair: any) => {
    switch (repair.estado) {
      case 'pendiente':
        return (
          <button 
            className="btn-outline-primary flex items-center text-xs px-3 py-1"
            onClick={() => handleOpenStatusModal(repair)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Evaluar
          </button>
        );
      case 'evaluando':
        return (
          <button 
            className="btn-primary flex items-center text-xs px-3 py-1"
            onClick={() => handleOpenQuoteModal(repair)}
          >
            <DollarSign className="h-3 w-3 mr-1" />
            Cotizar
          </button>
        );
      case 'en_reparacion':
        return (
          <button 
            className="btn-outline-success flex items-center text-xs px-3 py-1"
            onClick={() => handleOpenStatusModal(repair)}
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Actualizar
          </button>
        );
      default:
        return null;
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
          <p className="mt-2 text-gray-500">Cargando solicitudes de reparación...</p>
        </div>
      ) : filteredRepairs?.length > 0 ? (
      <div className="space-y-4">
          {filteredRepairs.map((repair: any) => (
            <div key={repair._id} className="card hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Icono */}
                  <div className="p-2 rounded-full bg-blue-100">
                    <Wrench className="h-5 w-5 text-blue-600" />
                  </div>
                  
                  <div>
                      <h3 className="font-medium text-gray-900">{repair.tipoDispositivo} - {repair.marca} {repair.modelo}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{repair.descripcionProblema}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span>Solicitado el {new Date(repair.fechaSolicitud).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                        ID: {repair._id}
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(repair.estado)}`}>
                    {getStatusText(repair.estado)}
                  </span>
              </div>
              
              {/* Imágenes */}
                {repair.imagenes && repair.imagenes.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Imágenes:</h4>
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                      {repair.imagenes.map((img: string, idx: number) => (
                      <div key={idx} className="h-16 w-16 rounded-md bg-gray-200 flex-shrink-0 overflow-hidden">
                        <img src={img} alt={`Imagen ${idx + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Cotización */}
                {repair.cotizacion && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Cotización:</h4>
                      <div className="flex items-center mt-1">
                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                          <span className="font-medium text-gray-900">${repair.cotizacion.monto.toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Tiempo estimado: {repair.cotizacion.tiempoEstimado} días
                        </div>
                        {repair.cotizacion.fechaEstimada && (
                          <div className="text-xs text-gray-500 mt-1">
                            Fecha estimada: {new Date(repair.cotizacion.fechaEstimada).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      
                      {repair.estado === 'cotizado' && (
                        <button 
                          className="btn-outline-primary flex items-center text-xs px-3 py-1"
                          onClick={() => handleOpenQuoteModal(repair)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Estado de reparación */}
                {repair.estado === 'en_reparacion' && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Estado de reparación:</h4>
                        <div className="text-sm text-gray-900 mt-1">
                          {repair.estadoReparacion || 'En proceso'}
                        </div>
                        {repair.fechaEstimadaFinalizacion && (
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Finalización estimada: {new Date(repair.fechaEstimadaFinalizacion).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Detalles de reparación completada */}
                {repair.estado === 'completado' && repair.detallesReparacion && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700">Detalles de la reparación:</h4>
                    <p className="text-sm text-gray-900 mt-1">{repair.detallesReparacion}</p>
                    {repair.fechaFinalizacion && (
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                          <CheckCircle className="h-3 w-3 mr-1" />
                        <span>Finalizado el {new Date(repair.fechaFinalizacion).toLocaleDateString()}</span>
                      </div>
                    )}
                </div>
              )}
              
              {/* Acciones */}
              <div className="mt-4 flex justify-end space-x-2">
                  {getNextActionButton(repair)}
                  
                  <button 
                    className="btn-outline flex items-center text-xs px-3 py-1"
                    onClick={() => window.open(`/client/reparaciones/${repair._id}`, '_blank')}
                  >
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <Wrench className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No hay reparaciones</h3>
          <p className="mt-1 text-gray-500">No se encontraron solicitudes de reparación que coincidan con los filtros</p>
        </div>
      )}
      
      {/* Modal de cotización */}
      {showQuoteModal && selectedRepair && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedRepair.cotizacion ? 'Editar Cotización' : 'Nueva Cotización'}
              </h3>
              
              <form onSubmit={quoteForm.handleSubmit(handleQuoteSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto (en $)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input rounded-lg w-full"
                    placeholder="0.00"
                    {...quoteForm.register('monto', { required: true })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo Estimado (días)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="form-input rounded-lg w-full"
                    placeholder="1"
                    {...quoteForm.register('tiempoEstimado', { required: true })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Estimada de Entrega
                  </label>
                  <input
                    type="date"
                    className="form-input rounded-lg w-full"
                    {...quoteForm.register('fechaEstimada')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Detalles
                  </label>
                  <textarea
                    rows={4}
                    className="form-textarea rounded-lg w-full"
                    placeholder="Detalles sobre la reparación y costos..."
                    {...quoteForm.register('detalles')}
                  />
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setShowQuoteModal(false);
                      setSelectedRepair(null);
                      quoteForm.reset();
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center"
                    disabled={updateQuoteMutation.isLoading}
                  >
                    {updateQuoteMutation.isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    ) : (
                      <DollarSign className="h-4 w-4 mr-2" />
                    )}
                    Guardar Cotización
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de actualización de estado */}
      {showStatusModal && selectedRepair && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Actualizar Estado
              </h3>
              
              <form onSubmit={statusForm.handleSubmit(handleStatusSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    className="form-select rounded-lg w-full"
                    {...statusForm.register('status', { required: true })}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="evaluando">En evaluación</option>
                    <option value="cotizado">Cotizado</option>
                    <option value="en_reparacion">En reparación</option>
                    <option value="completado">Completado</option>
                    <option value="rechazado">Rechazado</option>
                  </select>
                </div>
                
                {statusForm.watch('status') === 'en_reparacion' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado de la Reparación
                      </label>
                      <input
                        type="text"
                        className="form-input rounded-lg w-full"
                        placeholder="Ej: Esperando repuestos, En revisión..."
                        {...statusForm.register('estadoReparacion')}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Estimada de Finalización
                      </label>
                      <input
                        type="date"
                        className="form-input rounded-lg w-full"
                        {...statusForm.register('fechaEstimadaFinalizacion')}
                      />
                    </div>
                  </>
                )}
                
                {statusForm.watch('status') === 'completado' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Detalles de la Reparación
                    </label>
                    <textarea
                      rows={4}
                      className="form-textarea rounded-lg w-full"
                      placeholder="Detalles sobre la reparación realizada..."
                      {...statusForm.register('detallesReparacion')}
                    />
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedRepair(null);
                      statusForm.reset();
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center"
                    disabled={updateStatusMutation.isLoading}
                  >
                    {updateStatusMutation.isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Actualizar Estado
                </button>
              </div>
              </form>
            </div>
          </div>
          </div>
        )}
    </div>
  );
};