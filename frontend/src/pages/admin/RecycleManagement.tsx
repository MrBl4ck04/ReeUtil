import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Edit, 
  Plus, 
  Calendar,
  FileText 
} from 'lucide-react';
import { Recycle as RecycleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { recycleApi } from '../../services/marketplaceApi';

interface QuoteFormData {
  monto: number;
  comentarios?: string;
}

interface EntregaInfoFormData {
  direccion?: string;
  instrucciones?: string;
  fechaEstimada?: string;
}

interface StatusUpdateData {
  status: string;
  compensacionFinal?: number;
}

export const RecycleManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEntregaModal, setShowEntregaModal] = useState(false);
  const [selectedRecycle, setSelectedRecycle] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const quoteForm = useForm<QuoteFormData>();
  const statusForm = useForm<StatusUpdateData>();
  const entregaForm = useForm<EntregaInfoFormData>();
  
  // Cargar las solicitudes de reciclaje
  const { data: recycles, isLoading } = useQuery(['recycles', statusFilter], () => 
    recycleApi.getAllRecycleRequests(statusFilter !== 'all' ? statusFilter : undefined)
  );
  
  // Mutación para actualizar cotización
  const updateQuoteMutation = useMutation(
    ({ id, data }: { id: string; data: QuoteFormData }) => 
      recycleApi.updateRecycleQuote(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('recycles');
        setShowQuoteModal(false);
        setSelectedRecycle(null);
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
      recycleApi.updateRecycleStatus(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('recycles');
        setShowStatusModal(false);
        setSelectedRecycle(null);
        statusForm.reset();
        toast.success('Estado actualizado correctamente');
      },
      onError: () => {
        toast.error('Error al actualizar el estado');
      }
    }
  );
  
  // Mutación para actualizar información de entrega
  const updateEntregaInfoMutation = useMutation(
    ({ id, data }: { id: string; data: EntregaInfoFormData }) => 
      recycleApi.updateEntregaInfo(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('recycles');
        setShowEntregaModal(false);
        setSelectedRecycle(null);
        entregaForm.reset();
        toast.success('Información de entrega actualizada correctamente');
      },
      onError: () => {
        toast.error('Error al actualizar la información de entrega');
      }
    }
  );
  
  // Abrir modal de cotización
  const handleOpenQuoteModal = (recycle: any) => {
    setSelectedRecycle(recycle);
    // Pre-cargar datos si ya hay una cotización
    if (recycle.cotizacion) {
      quoteForm.setValue('monto', recycle.cotizacion.monto);
      
      if (recycle.cotizacion.comentarios) {
        quoteForm.setValue('comentarios', recycle.cotizacion.comentarios);
      }
    } else {
      quoteForm.reset();
    }
    setShowQuoteModal(true);
  };
  
  // Abrir modal de actualización de estado
  const handleOpenStatusModal = (recycle: any) => {
    setSelectedRecycle(recycle);
    // Pre-cargar estado actual
    statusForm.setValue('status', recycle.estado);
    
    if (recycle.compensacionFinal) {
      statusForm.setValue('compensacionFinal', recycle.compensacionFinal);
    } else if (recycle.cotizacion?.monto) {
      statusForm.setValue('compensacionFinal', recycle.cotizacion.monto);
    }
    
    setShowStatusModal(true);
  };
  
  // Abrir modal de información de entrega
  const handleOpenEntregaModal = (recycle: any) => {
    setSelectedRecycle(recycle);
    // Pre-cargar información existente
    if (recycle.entregaInfo) {
      if (recycle.entregaInfo.direccion) {
        entregaForm.setValue('direccion', recycle.entregaInfo.direccion);
      }
      if (recycle.entregaInfo.instrucciones) {
        entregaForm.setValue('instrucciones', recycle.entregaInfo.instrucciones);
      }
      if (recycle.entregaInfo.fechaEstimada) {
        const date = new Date(recycle.entregaInfo.fechaEstimada);
        entregaForm.setValue('fechaEstimada', date.toISOString().split('T')[0]);
      }
    } else {
      entregaForm.reset();
    }
    setShowEntregaModal(true);
  };
  
  // Manejar envío de cotización
  const handleQuoteSubmit = (data: QuoteFormData) => {
    if (!selectedRecycle?._id) return;
    
    // Convertir valores
    const quoteData = {
      ...data,
      monto: Number(data.monto)
    };
    
    updateQuoteMutation.mutate({
      id: selectedRecycle._id,
      data: quoteData
    });
  };
  
  // Manejar actualización de estado
  const handleStatusSubmit = (data: StatusUpdateData) => {
    if (!selectedRecycle?._id) return;
    
    const statusData = {
      ...data,
      compensacionFinal: data.compensacionFinal ? Number(data.compensacionFinal) : undefined
    };
    
    updateStatusMutation.mutate({
      id: selectedRecycle._id,
      data: statusData
    });
  };
  
  // Manejar actualización de información de entrega
  const handleEntregaSubmit = (data: EntregaInfoFormData) => {
    if (!selectedRecycle?._id) return;
    
    const entregaData = {
      ...data,
      fechaEstimada: data.fechaEstimada ? new Date(data.fechaEstimada).toISOString() : undefined
    };
    
    updateEntregaInfoMutation.mutate({
      id: selectedRecycle._id,
      data: entregaData
    });
  };
  
  // Filtrar solicitudes por búsqueda
  const filteredRecycles = recycles?.data?.filter((recycle: any) => {
    if (!recycle) return false;
    
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      recycle.tipoDispositivo?.toLowerCase().includes(searchTermLower) ||
      recycle.marca?.toLowerCase().includes(searchTermLower) ||
      recycle.modelo?.toLowerCase().includes(searchTermLower) ||
      recycle.descripcion?.toLowerCase().includes(searchTermLower);
      
    return matchesSearch;
  });
  
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
  
  // Obtener acción siguiente según estado
  const getNextActionButton = (recycle: any) => {
    switch (recycle.estado) {
      case 'pendiente':
        return (
          <button 
            className="btn-outline-primary flex items-center text-xs px-3 py-1"
            onClick={() => handleOpenStatusModal(recycle)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Evaluar
          </button>
        );
      case 'evaluando':
        return (
          <button 
            className="btn-primary flex items-center text-xs px-3 py-1"
            onClick={() => handleOpenQuoteModal(recycle)}
          >
            <DollarSign className="h-3 w-3 mr-1" />
            Cotizar
          </button>
        );
      case 'cotizado':
        return (
          <button 
            className="btn-outline-success flex items-center text-xs px-3 py-1"
            onClick={() => handleOpenEntregaModal(recycle)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Info. Entrega
          </button>
        );
      default:
        return null;
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
          <p className="mt-2 text-gray-500">Cargando solicitudes...</p>
        </div>
      ) : filteredRecycles?.length > 0 ? (
        <div className="space-y-4">
          {filteredRecycles.map((recycle: any) => (
            <div key={recycle._id} className="card hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Icono */}
                    <div className="p-2 rounded-full bg-green-100">
                      <RecycleIcon className="h-5 w-5 text-green-600" />
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900">{recycle.tipoDispositivo} - {recycle.marca} {recycle.modelo}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{recycle.descripcion}</p>
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <Clock className="h-4 w-4 text-gray-400 mr-1" />
                        <span>Solicitado el {new Date(recycle.fechaSolicitud).toLocaleDateString()}</span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        ID: {recycle._id}
                      </div>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(recycle.estado)}`}>
                    {getStatusText(recycle.estado)}
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
                {recycle.cotizacion && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Oferta de compensación:</h4>
                        <div className="flex items-center mt-1">
                          <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                          <span className="font-medium text-gray-900">${recycle.cotizacion.monto.toFixed(2)}</span>
                        </div>
                        {recycle.cotizacion.comentarios && (
                          <p className="text-xs text-gray-500 mt-1">{recycle.cotizacion.comentarios}</p>
                        )}
                        {recycle.cotizacion.fechaCreacion && (
                          <p className="text-xs text-gray-500 mt-1">
                            Cotizado el {new Date(recycle.cotizacion.fechaCreacion).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      {recycle.estado === 'cotizado' && (
                        <button 
                          className="btn-outline-primary flex items-center text-xs px-3 py-1"
                          onClick={() => handleOpenQuoteModal(recycle)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Información de entrega */}
                {recycle.entregaInfo && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Información de entrega:</h4>
                        {recycle.entregaInfo.direccion && (
                          <p className="text-xs text-gray-700 mt-1"><strong>Dirección:</strong> {recycle.entregaInfo.direccion}</p>
                        )}
                        {recycle.entregaInfo.fechaEstimada && (
                          <p className="text-xs text-gray-700 mt-1">
                            <strong>Fecha estimada:</strong> {new Date(recycle.entregaInfo.fechaEstimada).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      {recycle.estado === 'cotizado' && (
                        <button 
                          className="btn-outline-primary flex items-center text-xs px-3 py-1"
                          onClick={() => handleOpenEntregaModal(recycle)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Compensación final (completado) */}
                {recycle.estado === 'completado' && recycle.compensacionFinal && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700">Compensación final:</h4>
                    <div className="flex items-center mt-1">
                      <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                      <span className="font-medium text-gray-900">${recycle.compensacionFinal.toFixed(2)}</span>
                    </div>
                    {recycle.fechaFinalizacion && (
                      <p className="text-xs text-gray-500 mt-1">
                        Completado el {new Date(recycle.fechaFinalizacion).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
                
                {/* Acciones */}
                <div className="mt-4 flex justify-end space-x-2">
                  {getNextActionButton(recycle)}
                  
                  <button 
                    className="btn-outline flex items-center text-xs px-3 py-1"
                    onClick={() => window.open(`/client/reciclar/${recycle._id}`, '_blank')}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Ver detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <RecycleIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No hay solicitudes</h3>
          <p className="mt-1 text-gray-500">No se encontraron solicitudes de reciclaje que coincidan con los filtros</p>
        </div>
      )}
      
      {/* Modal de cotización */}
      {showQuoteModal && selectedRecycle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedRecycle.cotizacion ? 'Editar Cotización' : 'Nueva Cotización'}
              </h3>
              
              <form onSubmit={quoteForm.handleSubmit(handleQuoteSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto de Compensación (en $)
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
                    Comentarios (opcional)
                  </label>
                  <textarea
                    rows={4}
                    className="form-textarea rounded-lg w-full"
                    placeholder="Detalles sobre la valoración del dispositivo..."
                    {...quoteForm.register('comentarios')}
                  />
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setShowQuoteModal(false);
                      setSelectedRecycle(null);
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
      {showStatusModal && selectedRecycle && (
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
                    <option value="completado">Completado</option>
                    <option value="rechazado">Rechazado</option>
                  </select>
                </div>
                
                {statusForm.watch('status') === 'completado' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Compensación Final ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-input rounded-lg w-full"
                      placeholder="0.00"
                      {...statusForm.register('compensacionFinal')}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Si se deja en blanco, se utilizará el monto de la cotización.
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setShowStatusModal(false);
                      setSelectedRecycle(null);
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
      
      {/* Modal de información de entrega */}
      {showEntregaModal && selectedRecycle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedRecycle.entregaInfo ? 'Actualizar Información de Entrega' : 'Nueva Información de Entrega'}
              </h3>
              
              <form onSubmit={entregaForm.handleSubmit(handleEntregaSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección de Entrega
                  </label>
                  <input
                    type="text"
                    className="form-input rounded-lg w-full"
                    placeholder="Ej. Calle Principal #123, Ciudad"
                    {...entregaForm.register('direccion')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instrucciones
                  </label>
                  <textarea
                    rows={4}
                    className="form-textarea rounded-lg w-full"
                    placeholder="Instrucciones específicas para la entrega o recogida..."
                    {...entregaForm.register('instrucciones')}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Estimada
                  </label>
                  <input
                    type="date"
                    className="form-input rounded-lg w-full"
                    {...entregaForm.register('fechaEstimada')}
                  />
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setShowEntregaModal(false);
                      setSelectedRecycle(null);
                      entregaForm.reset();
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center"
                    disabled={updateEntregaInfoMutation.isLoading}
                  >
                    {updateEntregaInfoMutation.isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Guardar Información
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