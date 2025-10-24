import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Plus, Edit2, Trash2, Search, AlertCircle } from 'lucide-react';
import { rulesApi } from '../../services/api';

interface Rule {
  _id: string;
  nombre: string;
  descripcion: string;
  estado: boolean;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export const RulesManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    estado: true
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch rules
  const { data: rulesResponse, isLoading, error: fetchError } = useQuery<any>('rules', rulesApi.getAll);
  // La respuesta de axios viene como: { status: 'success', results: X, data: [...rules] }
  // Y useQuery envuelve eso en otro .data, así que accedemos a rulesResponse?.data?.data
  const rules = Array.isArray(rulesResponse?.data?.data) ? rulesResponse.data.data : [];
  const hasError = fetchError !== null && fetchError !== undefined;

  // Create mutation
  const createMutation = useMutation(rulesApi.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('rules');
      resetForm();
      setIsModalOpen(false);
    }
  });

  // Update mutation
  const updateMutation = useMutation(
    ({ id, data }: { id: string; data: any }) => rulesApi.update(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('rules');
        resetForm();
        setIsModalOpen(false);
      }
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(rulesApi.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('rules');
    }
  });

  const resetForm = () => {
    setFormData({ nombre: '', descripcion: '', estado: true });
    setEditingRule(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingRule) {
        await updateMutation.mutateAsync({
          id: editingRule._id,
          data: formData
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    setFormData({
      nombre: rule.nombre,
      descripcion: rule.descripcion,
      estado: rule.estado
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta regla?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const filteredRules = Array.isArray(rules) ? rules.filter((rule: Rule) =>
    rule.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reglas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Reglas</h1>
          <p className="text-gray-600">
            Administra las reglas del sistema para evaluación de dispositivos
          </p>
        </div>

        {/* Error Alert */}
        {hasError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-red-700">Error al cargar las reglas. Por favor intenta de nuevo.</p>
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar reglas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* New Rule Button */}
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Nueva Regla
          </button>
        </div>

        {/* Rules Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredRules.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No se encontraron reglas.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map((rule: Rule) => (
                    <tr
                      key={rule._id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {rule.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {rule.descripcion}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            rule.estado
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {rule.estado ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(rule)}
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-3 py-1 rounded transition-colors"
                          >
                            <Edit2 size={16} />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(rule._id)}
                            className="inline-flex items-center gap-2 text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-1 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">
                {editingRule ? 'Editar Regla' : 'Nueva Regla'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => {
                    setFormData({ ...formData, nombre: e.target.value });
                    if (errors.nombre) setErrors({ ...errors, nombre: '' });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.nombre ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Dispositivos Android"
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción *
                </label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => {
                    setFormData({ ...formData, descripcion: e.target.value });
                    if (errors.descripcion) setErrors({ ...errors, descripcion: '' });
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    errors.descripcion ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows={3}
                  placeholder="Describe la regla..."
                />
                {errors.descripcion && (
                  <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>
                )}
              </div>

              {/* Estado */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="estado"
                  checked={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                />
                <label htmlFor="estado" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Regla Activa
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading || updateMutation.isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isLoading || updateMutation.isLoading
                    ? 'Guardando...'
                    : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
