import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
    Shield,
    Search,
    Plus,
    Edit2,
    Trash2,
    X,
    Save,
    AlertTriangle
} from 'lucide-react';
import { rolesApi } from '../../services/api';
import toast from 'react-hot-toast';

export const RolesManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [formData, setFormData] = useState({
        nombre: '',
        description: ''
    });
    const [formError, setFormError] = useState<string>('');

    const queryClient = useQueryClient();

    // Obtener todos los roles
    const { data: roles, isLoading, isError, error } = useQuery(
        'roles',
        rolesApi.getAll,
        {
            onError: (err: any) => {
                console.error('Error al cargar roles:', err);
                toast.error('Error al cargar roles: ' + (err?.response?.data?.message || err.message));
            }
        }
    );

    // Mutaciones
    const createRoleMutation = useMutation(
        (data: any) => rolesApi.create(data),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('roles');
                setIsModalOpen(false);
                resetForm();
                setFormError('');
                toast.success('Rol creado exitosamente');
            },
            onError: (err: any) => {
                const message = err?.response?.data?.message || 'Error al crear rol';
                setFormError(message);
                toast.error(message);
            }
        }
    );

    const updateRoleMutation = useMutation(
        (data: any) => rolesApi.update(data.id, data.roleData),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('roles');
                setIsModalOpen(false);
                resetForm();
                setFormError('');
                toast.success('Rol actualizado exitosamente');
            },
            onError: (err: any) => {
                const message = err?.response?.data?.message || 'Error al actualizar rol';
                setFormError(message);
                toast.error(message);
            }
        }
    );

    const deleteRoleMutation = useMutation(
        (id: string) => rolesApi.delete(id),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('roles');
                setIsDeleteModalOpen(false);
                setSelectedRole(null);
                toast.success('Rol eliminado exitosamente');
            },
            onError: (err: any) => {
                const message = err?.response?.data?.message || 'Error al eliminar rol';
                toast.error(message);
            }
        }
    );

    // Filtrar roles por búsqueda
    const filteredRoles = roles?.data?.data?.filter((role: any) =>
        role.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Resetear formulario
    const resetForm = () => {
        setFormData({
            nombre: '',
            description: ''
        });
        setSelectedRole(null);
    };

    // Abrir modal para crear/editar
    const handleOpenModal = (role?: any) => {
        if (role) {
            // Validar que no sea un rol del sistema
            if (role.isSystem) {
                toast.error('No puedes editar un rol del sistema');
                return;
            }
            setSelectedRole(role);
            setFormData({
                nombre: role.nombre,
                description: role.description || ''
            });
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    // Manejar cambios en el formulario
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Validar y guardar
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!formData.nombre.trim()) {
            setFormError('El nombre del rol es requerido');
            return;
        }

        if (selectedRole) {
            updateRoleMutation.mutate({
                id: selectedRole._id,
                roleData: formData
            });
        } else {
            createRoleMutation.mutate(formData);
        }
    };

    // Abrir modal de confirmación para eliminar
    const handleOpenDeleteModal = (role: any) => {
        if (role.isSystem) {
            toast.error('No puedes eliminar un rol del sistema');
            return;
        }
        setSelectedRole(role);
        setIsDeleteModalOpen(true);
    };

    // Eliminar rol
    const handleDeleteRole = () => {
        if (selectedRole) {
            deleteRoleMutation.mutate(selectedRole._id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Roles</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Administra los roles y permisos del sistema
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="btn-primary flex items-center"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Rol
                </button>
            </div>

            {/* Buscador */}
            <div className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <Search className="h-5 w-5 text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="Buscar rol..."
                    className="flex-1 border-none focus:ring-0 focus:outline-none text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Lista de roles */}
            {isLoading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-600 border-r-transparent"></div>
                    <p className="mt-2 text-gray-500">Cargando roles...</p>
                </div>
            ) : isError ? (
                <div className="text-center py-12 card">
                    <Shield className="h-12 w-12 text-red-400 mx-auto" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Error al cargar roles</h3>
                    <p className="mt-1 text-gray-500">{error?.response?.data?.message || error?.message || 'Intenta nuevamente más tarde'}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-primary mt-4 inline-flex items-center"
                    >
                        Recargar Página
                    </button>
                </div>
            ) : filteredRoles?.length > 0 ? (
                <div className="overflow-x-auto card">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nombre del Rol
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Descripción
                                </th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipo
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredRoles.map((role: any) => (
                                <tr key={role._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Shield className={`h-5 w-5 mr-3 ${role.isSystem ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <div className="text-sm font-medium text-gray-900">
                                                {role.nombre}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{role.description || 'Sin descripción'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${role.isSystem
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-green-100 text-green-800'
                                            }`}>
                                            {role.isSystem ? 'Sistema' : 'Personalizado'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleOpenModal(role)}
                                                className={`${role.isSystem ? 'text-gray-400 cursor-not-allowed' : 'text-primary-600 hover:text-primary-900'}`}
                                                title={role.isSystem ? 'No se puede editar un rol del sistema' : 'Editar'}
                                                disabled={role.isSystem}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>

                                            <button
                                                onClick={() => handleOpenDeleteModal(role)}
                                                className={`${role.isSystem ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900'}`}
                                                title={role.isSystem ? 'No se puede eliminar un rol del sistema' : 'Eliminar'}
                                                disabled={role.isSystem}
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
            ) : (
                <div className="text-center py-12 card">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No hay roles</h3>
                    <p className="mt-1 text-gray-500">Comienza agregando un nuevo rol</p>
                    <button
                        onClick={() => handleOpenModal()}
                        className="btn-primary mt-4 inline-flex items-center"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Rol
                    </button>
                </div>
            )}

            {/* Modal de creación/edición */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            {selectedRole ? 'Editar Rol' : 'Nuevo Rol'}
                                        </h3>
                                        <div className="mt-4">
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div>
                                                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                                                        Nombre del Rol *
                                                    </label>
                                                    <div className="mt-1">
                                                        <input
                                                            type="text"
                                                            name="nombre"
                                                            id="nombre"
                                                            className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                            placeholder="Gerente de Ventas"
                                                            value={formData.nombre}
                                                            onChange={handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                                        Descripción
                                                    </label>
                                                    <div className="mt-1">
                                                        <textarea
                                                            name="description"
                                                            id="description"
                                                            rows={3}
                                                            className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                            placeholder="Describe las responsabilidades de este rol..."
                                                            value={formData.description}
                                                            onChange={handleChange}
                                                        />
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="btn-primary w-full sm:ml-3 sm:w-auto"
                                    onClick={handleSubmit}
                                    disabled={createRoleMutation.isLoading || updateRoleMutation.isLoading}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {selectedRole ? 'Actualizar' : 'Crear'}
                                </button>
                                <button
                                    type="button"
                                    className="btn-outline mt-3 sm:mt-0 w-full sm:w-auto"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancelar
                                </button>
                            </div>
                            {formError && (
                                <div className="px-6 pb-4 text-sm text-red-600">{formError}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Eliminar Rol
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                ¿Estás seguro de que deseas eliminar el rol <span className="font-semibold">{selectedRole?.nombre}</span>? Esta acción no se puede deshacer.
                                            </p>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Los empleados que tengan este rol asignado quedarán sin rol.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="btn-danger w-full sm:ml-3 sm:w-auto"
                                    onClick={handleDeleteRole}
                                    disabled={deleteRoleMutation.isLoading}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Eliminar
                                </button>
                                <button
                                    type="button"
                                    className="btn-outline mt-3 sm:mt-0 w-full sm:w-auto"
                                    onClick={() => setIsDeleteModalOpen(false)}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
