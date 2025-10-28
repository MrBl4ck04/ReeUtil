import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Smartphone,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { devicesApi, catalogApi } from '../services/api';
import toast from 'react-hot-toast';

interface Device {
  _id: string;
  idDispositivo: number;
  detalles: string;
  estadoCotizaci: string;
  estadoDisposit?: string;
  fecha: string;
  idCatalogo?: number;
  idUsuario?: number;
  cotizacion?: number;
}

interface CreateDeviceForm {
  detalles: string;
  estado: string;
  idCatalogo: number;
  idUsuario?: number;
}

export const Devices: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const queryClient = useQueryClient();
  const createForm = useForm<CreateDeviceForm>();
  const quotationForm = useForm<{ cotizacion: number }>();

  const { data: devices, isLoading } = useQuery('devices', devicesApi.getAll);
  const { data: catalog } = useQuery('catalog', catalogApi.getAll);

  const createMutation = useMutation(devicesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('devices');
      setShowCreateModal(false);
      createForm.reset();
      toast.success('Solicitud de evaluación enviada');
    },
    onError: () => {
      toast.error('Error al enviar solicitud');
    },
  });

  const updateQuotationMutation = useMutation(devicesApi.updateQuotation, {
    onSuccess: () => {
      queryClient.invalidateQueries('devices');
      setShowQuotationModal(false);
      setSelectedDevice(null);
      quotationForm.reset();
      toast.success('Cotización actualizada');
    },
    onError: () => {
      toast.error('Error al actualizar cotización');
    },
  });

  const deleteMutation = useMutation(devicesApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('devices');
      toast.success('Solicitud eliminada');
    },
    onError: () => {
      toast.error('Error al eliminar solicitud');
    },
  });

  const handleCreate = (data: CreateDeviceForm) => {
    createMutation.mutate(data);
  };

  const handleQuotation = (device: Device) => {
    setSelectedDevice(device);
    setShowQuotationModal(true);
  };

  const handleUpdateQuotation = (data: { cotizacion: number }) => {
    if (selectedDevice) {
      updateQuotationMutation.mutate({
        idDispositivo: selectedDevice.idDispositivo,
        cotizacion: data.cotizacion,
        estadoCotizaci: 'Pendiente'
      });
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta solicitud?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En Curso':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pendiente':
        return 'bg-blue-100 text-blue-800';
      case 'aceptado':
        return 'bg-green-100 text-green-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDevices = devices?.data?.filter((device: Device) => {
    const matchesSearch = device.detalles.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterStatus || device.estadoCotizaci === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Dispositivos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra las solicitudes de evaluación y cotizaciones
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Solicitud
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar solicitudes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="">Todos los estados</option>
              <option value="En Curso">En Curso</option>
              <option value="Pendiente">Pendiente</option>
              <option value="aceptado">Aceptado</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Devices Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Detalles</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Cotización</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices?.map((device: Device) => (
                <tr key={device._id}>
                  <td className="font-medium">#{device.idDispositivo}</td>
                  <td className="max-w-xs truncate">{device.detalles}</td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(device.estadoCotizaci)}`}>
                      {device.estadoCotizaci}
                    </span>
                  </td>
                  <td>{new Date(device.fecha).toLocaleDateString()}</td>
                  <td>
                    {device.cotizacion ? `$${device.cotizacion}` : '-'}
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      {device.estadoCotizaci === 'En Curso' && (
                        <button
                          onClick={() => handleQuotation(device)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(device.idDispositivo)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredDevices?.length === 0 && (
        <div className="text-center py-12">
          <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron solicitudes</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Nueva Solicitud de Evaluación</h3>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dispositivo
                </label>
                <select
                  {...createForm.register('idCatalogo', { required: 'Selecciona un dispositivo' })}
                  className="input"
                >
                  <option value="">Selecciona un dispositivo</option>
                  {catalog?.data?.map((item: any) => (
                    <option key={item._id} value={item.idCatalogo}>
                      {item.nombre} - {item.marca} {item.modelo}
                    </option>
                  ))}
                </select>
                {createForm.formState.errors.idCatalogo && (
                  <p className="text-sm text-red-600 mt-1">
                    {createForm.formState.errors.idCatalogo.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado del Dispositivo
                </label>
                <input
                  {...createForm.register('estado', { required: 'El estado es requerido' })}
                  className="input"
                  placeholder="Ej: Bueno, Regular, Malo"
                />
                {createForm.formState.errors.estado && (
                  <p className="text-sm text-red-600 mt-1">
                    {createForm.formState.errors.estado.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detalles
                </label>
                <textarea
                  {...createForm.register('detalles', { required: 'Los detalles son requeridos' })}
                  className="input"
                  rows={3}
                  placeholder="Describe el estado y características del dispositivo"
                />
                {createForm.formState.errors.detalles && (
                  <p className="text-sm text-red-600 mt-1">
                    {createForm.formState.errors.detalles.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="btn btn-primary"
                >
                  {createMutation.isLoading ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quotation Modal */}
      {showQuotationModal && selectedDevice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actualizar Cotización</h3>
            <form onSubmit={quotationForm.handleSubmit(handleUpdateQuotation)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dispositivo #{selectedDevice.idDispositivo}
                </label>
                <p className="text-sm text-gray-600 mb-4">{selectedDevice.detalles}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cotización (Bs.)
                </label>
                <input
                  {...quotationForm.register('cotizacion', { 
                    required: 'La cotización es requerida',
                    min: { value: 0, message: 'La cotización debe ser mayor a 0' }
                  })}
                  type="number"
                  className="input"
                  placeholder="0"
                />
                {quotationForm.formState.errors.cotizacion && (
                  <p className="text-sm text-red-600 mt-1">
                    {quotationForm.formState.errors.cotizacion.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowQuotationModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updateQuotationMutation.isLoading}
                  className="btn btn-primary"
                >
                  {updateQuotationMutation.isLoading ? 'Actualizando...' : 'Actualizar Cotización'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
