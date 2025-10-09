import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Package,
  Eye
} from 'lucide-react';
import { catalogApi } from '../services/api';
import toast from 'react-hot-toast';

interface CatalogItem {
  _id: string;
  idCatalogo: number;
  nombre: string;
  marca: string;
  modelo: string;
  descripcion: string;
  tipo: string;
  imagenProdu?: string;
}

interface CreateCatalogForm {
  nombre: string;
  descripcion: string;
  marca: string;
  modelo: string;
  tipo: string;
  imagenProdu?: string;
}

export const Catalog: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  
  const queryClient = useQueryClient();
  const createForm = useForm<CreateCatalogForm>();
  const editForm = useForm<CreateCatalogForm>();

  const { data: catalog, isLoading } = useQuery('catalog', catalogApi.getAll);
  const { data: types } = useQuery('catalogTypes', catalogApi.getTypes);

  const createMutation = useMutation(catalogApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('catalog');
      setShowCreateModal(false);
      createForm.reset();
      toast.success('Dispositivo agregado al catálogo');
    },
    onError: () => {
      toast.error('Error al agregar dispositivo');
    },
  });

  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => catalogApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('catalog');
        setShowEditModal(false);
        setEditingItem(null);
        editForm.reset();
        toast.success('Dispositivo actualizado');
      },
      onError: () => {
        toast.error('Error al actualizar dispositivo');
      },
    }
  );

  const deleteMutation = useMutation(catalogApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('catalog');
      toast.success('Dispositivo eliminado');
    },
    onError: () => {
      toast.error('Error al eliminar dispositivo');
    },
  });

  const handleCreate = (data: CreateCatalogForm) => {
    createMutation.mutate(data);
  };

  const handleEdit = (item: CatalogItem) => {
    setEditingItem(item);
    editForm.reset({
      nombre: item.nombre,
      descripcion: item.descripcion,
      marca: item.marca,
      modelo: item.modelo,
      tipo: item.tipo,
      imagenProdu: item.imagenProdu,
    });
    setShowEditModal(true);
  };

  const handleUpdate = (data: CreateCatalogForm) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem._id, data });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este dispositivo?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredCatalog = catalog?.data?.filter((item: CatalogItem) => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterType || item.tipo === filterType;
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
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Dispositivos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona los dispositivos disponibles para reciclaje
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Dispositivo
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
                placeholder="Buscar dispositivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input"
            >
              <option value="">Todos los tipos</option>
              {types?.data?.map((type: string) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCatalog?.map((item: CatalogItem) => (
          <div key={item._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">{item.nombre}</h3>
                  <p className="text-sm text-gray-500">#{item.idCatalogo}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-gray-400 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Marca:</span>
                <span className="text-sm font-medium">{item.marca}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Modelo:</span>
                <span className="text-sm font-medium">{item.modelo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Tipo:</span>
                <span className="text-sm font-medium">{item.tipo}</span>
              </div>
            </div>
            
            <p className="mt-3 text-sm text-gray-600 line-clamp-2">
              {item.descripcion}
            </p>
          </div>
        ))}
      </div>

      {filteredCatalog?.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron dispositivos</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Agregar Dispositivo</h3>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  {...createForm.register('nombre', { required: 'El nombre es requerido' })}
                  className="input"
                  placeholder="Nombre del dispositivo"
                />
                {createForm.formState.errors.nombre && (
                  <p className="text-sm text-red-600 mt-1">
                    {createForm.formState.errors.nombre.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  {...createForm.register('descripcion', { required: 'La descripción es requerida' })}
                  className="input"
                  rows={3}
                  placeholder="Descripción del dispositivo"
                />
                {createForm.formState.errors.descripcion && (
                  <p className="text-sm text-red-600 mt-1">
                    {createForm.formState.errors.descripcion.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <input
                    {...createForm.register('marca', { required: 'La marca es requerida' })}
                    className="input"
                    placeholder="Marca"
                  />
                  {createForm.formState.errors.marca && (
                    <p className="text-sm text-red-600 mt-1">
                      {createForm.formState.errors.marca.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo
                  </label>
                  <input
                    {...createForm.register('modelo', { required: 'El modelo es requerido' })}
                    className="input"
                    placeholder="Modelo"
                  />
                  {createForm.formState.errors.modelo && (
                    <p className="text-sm text-red-600 mt-1">
                      {createForm.formState.errors.modelo.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <input
                  {...createForm.register('tipo', { required: 'El tipo es requerido' })}
                  className="input"
                  placeholder="Tipo de dispositivo"
                />
                {createForm.formState.errors.tipo && (
                  <p className="text-sm text-red-600 mt-1">
                    {createForm.formState.errors.tipo.message}
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
                  {createMutation.isLoading ? 'Agregando...' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Dispositivo</h3>
            <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  {...editForm.register('nombre', { required: 'El nombre es requerido' })}
                  className="input"
                  placeholder="Nombre del dispositivo"
                />
                {editForm.formState.errors.nombre && (
                  <p className="text-sm text-red-600 mt-1">
                    {editForm.formState.errors.nombre.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  {...editForm.register('descripcion', { required: 'La descripción es requerida' })}
                  className="input"
                  rows={3}
                  placeholder="Descripción del dispositivo"
                />
                {editForm.formState.errors.descripcion && (
                  <p className="text-sm text-red-600 mt-1">
                    {editForm.formState.errors.descripcion.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <input
                    {...editForm.register('marca', { required: 'La marca es requerida' })}
                    className="input"
                    placeholder="Marca"
                  />
                  {editForm.formState.errors.marca && (
                    <p className="text-sm text-red-600 mt-1">
                      {editForm.formState.errors.marca.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modelo
                  </label>
                  <input
                    {...editForm.register('modelo', { required: 'El modelo es requerido' })}
                    className="input"
                    placeholder="Modelo"
                  />
                  {editForm.formState.errors.modelo && (
                    <p className="text-sm text-red-600 mt-1">
                      {editForm.formState.errors.modelo.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <input
                  {...editForm.register('tipo', { required: 'El tipo es requerido' })}
                  className="input"
                  placeholder="Tipo de dispositivo"
                />
                {editForm.formState.errors.tipo && (
                  <p className="text-sm text-red-600 mt-1">
                    {editForm.formState.errors.tipo.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isLoading}
                  className="btn btn-primary"
                >
                  {updateMutation.isLoading ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
