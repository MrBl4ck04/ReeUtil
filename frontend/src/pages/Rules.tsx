import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Settings,
  FileText
} from 'lucide-react';
import { rulesApi, catalogApi } from '../services/api';
import toast from 'react-hot-toast';

interface Rule {
  _id: string;
  idReglas: number;
  nombreRegla: string;
  descripcionRE: string;
  idCatalogo: string;
}

interface CreateRuleForm {
  nombreRegla: string;
  descripcionRE: string;
  idCatalogo: string;
}

export const Rules: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCatalog, setFilterCatalog] = useState('');
  
  const queryClient = useQueryClient();
  const createForm = useForm<CreateRuleForm>();
  const editForm = useForm<CreateRuleForm>();

  const { data: rules, isLoading } = useQuery('rules', rulesApi.getAll);
  const { data: catalog } = useQuery('catalog', catalogApi.getAll);

  const createMutation = useMutation(rulesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('rules');
      setShowCreateModal(false);
      createForm.reset();
      toast.success('Regla creada exitosamente');
    },
    onError: () => {
      toast.error('Error al crear regla');
    },
  });

  const deleteMutation = useMutation(rulesApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('rules');
      toast.success('Regla eliminada');
    },
    onError: () => {
      toast.error('Error al eliminar regla');
    },
  });

  const handleCreate = (data: CreateRuleForm) => {
    createMutation.mutate(data);
  };

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    editForm.reset({
      nombreRegla: rule.nombreRegla,
      descripcionRE: rule.descripcionRE,
      idCatalogo: rule.idCatalogo,
    });
    setShowEditModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta regla?')) {
      deleteMutation.mutate(id);
    }
  };

  const getCatalogName = (idCatalogo: string) => {
    const catalogItem = catalog?.data?.find((item: any) => item._id === idCatalogo);
    return catalogItem ? `${catalogItem.nombre} - ${catalogItem.marca}` : 'Dispositivo no encontrado';
  };

  const filteredRules = rules?.data?.filter((rule: Rule) => {
    const matchesSearch = rule.nombreRegla.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.descripcionRE.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterCatalog || rule.idCatalogo === filterCatalog;
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
          <h1 className="text-2xl font-bold text-gray-900">Reglas de Evaluación</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona las reglas para evaluar diferentes tipos de dispositivos
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Regla
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
                placeholder="Buscar reglas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-64">
            <select
              value={filterCatalog}
              onChange={(e) => setFilterCatalog(e.target.value)}
              className="input"
            >
              <option value="">Todos los dispositivos</option>
              {catalog?.data?.map((item: any) => (
                <option key={item._id} value={item._id}>
                  {item.nombre} - {item.marca}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRules?.map((rule: Rule) => (
          <div key={rule._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">{rule.nombreRegla}</h3>
                  <p className="text-sm text-gray-500">#{rule.idReglas}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(rule)}
                  className="p-2 text-gray-400 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(rule._id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="mb-3">
              <p className="text-sm text-gray-500 mb-1">Dispositivo:</p>
              <p className="text-sm font-medium text-gray-900">
                {getCatalogName(rule.idCatalogo)}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Descripción:</p>
              <p className="text-sm text-gray-600 line-clamp-3">
                {rule.descripcionRE}
              </p>
            </div>
          </div>
        ))}
      </div>

      {filteredRules?.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron reglas</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Nueva Regla</h3>
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
                    <option key={item._id} value={item._id}>
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
                  Nombre de la Regla
                </label>
                <input
                  {...createForm.register('nombreRegla', { required: 'El nombre es requerido' })}
                  className="input"
                  placeholder="Ej: Evaluación de Smartphones"
                />
                {createForm.formState.errors.nombreRegla && (
                  <p className="text-sm text-red-600 mt-1">
                    {createForm.formState.errors.nombreRegla.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  {...createForm.register('descripcionRE', { required: 'La descripción es requerida' })}
                  className="input"
                  rows={4}
                  placeholder="Describe las reglas de evaluación para este tipo de dispositivo"
                />
                {createForm.formState.errors.descripcionRE && (
                  <p className="text-sm text-red-600 mt-1">
                    {createForm.formState.errors.descripcionRE.message}
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
                  {createMutation.isLoading ? 'Creando...' : 'Crear Regla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingRule && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Regla</h3>
            <form onSubmit={editForm.handleSubmit(handleCreate)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dispositivo
                </label>
                <select
                  {...editForm.register('idCatalogo', { required: 'Selecciona un dispositivo' })}
                  className="input"
                >
                  <option value="">Selecciona un dispositivo</option>
                  {catalog?.data?.map((item: any) => (
                    <option key={item._id} value={item._id}>
                      {item.nombre} - {item.marca} {item.modelo}
                    </option>
                  ))}
                </select>
                {editForm.formState.errors.idCatalogo && (
                  <p className="text-sm text-red-600 mt-1">
                    {editForm.formState.errors.idCatalogo.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Regla
                </label>
                <input
                  {...editForm.register('nombreRegla', { required: 'El nombre es requerido' })}
                  className="input"
                  placeholder="Ej: Evaluación de Smartphones"
                />
                {editForm.formState.errors.nombreRegla && (
                  <p className="text-sm text-red-600 mt-1">
                    {editForm.formState.errors.nombreRegla.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  {...editForm.register('descripcionRE', { required: 'La descripción es requerida' })}
                  className="input"
                  rows={4}
                  placeholder="Describe las reglas de evaluación para este tipo de dispositivo"
                />
                {editForm.formState.errors.descripcionRE && (
                  <p className="text-sm text-red-600 mt-1">
                    {editForm.formState.errors.descripcionRE.message}
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
                  disabled={createMutation.isLoading}
                  className="btn btn-primary"
                >
                  {createMutation.isLoading ? 'Actualizando...' : 'Actualizar Regla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
