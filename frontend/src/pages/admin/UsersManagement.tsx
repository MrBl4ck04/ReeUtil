import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  UserCheck,
  Search,
  Lock,
  Unlock,
  User,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  X
} from 'lucide-react';
import { usersApi } from '../../services/api';

export const UsersManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyBlocked, setShowOnlyBlocked] = useState(false);
  const [viewType, setViewType] = useState<'users' | 'employees'>('users');
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const queryClient = useQueryClient();
  
  // Obtener todos los usuarios
  const { data: users, isLoading } = useQuery('users', usersApi.getAll, {
    enabled: viewType === 'users'
  });
  
  // Obtener usuarios bloqueados
  const { data: blockedUsers, isLoading: loadingBlocked } = useQuery(
    'blockedUsers', 
    usersApi.getBlocked,
    {
      enabled: showOnlyBlocked && viewType === 'users'
    }
  );
  
  // Obtener todos los empleados
  const { data: employees, isLoading: loadingEmployees } = useQuery(
    'employees',
    usersApi.getAllEmployees,
    {
      enabled: viewType === 'employees'
    }
  );
  
  // Obtener empleados bloqueados
  const { data: blockedEmployees, isLoading: loadingBlockedEmployees } = useQuery(
    'blockedEmployees',
    usersApi.getBlockedEmployees,
    {
      enabled: showOnlyBlocked && viewType === 'employees'
    }
  );
  
  // Mutaciones para banear/desbanear usuarios
  const unblockUserMutation = useMutation(
    (id: string) => usersApi.unblockUserById(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries('blockedUsers');
      }
    }
  );
  const blockUserMutation = useMutation(
    (id: string) => usersApi.blockUser(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries('blockedUsers');
      }
    }
  );
  
  // Mutaciones para banear/desbanear empleados
  const unblockEmployeeMutation = useMutation(
    (id: string) => usersApi.unblockEmployeeById(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        queryClient.invalidateQueries('blockedEmployees');
      }
    }
  );
  const blockEmployeeMutation = useMutation(
    (id: string) => usersApi.blockEmployeeById(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        queryClient.invalidateQueries('blockedEmployees');
      }
    }
  );
  
  // Filtrar usuarios/empleados por búsqueda (robusto ante undefined)
  const getFilteredData = () => {
    let dataSourceRaw;
    
    if (viewType === 'users') {
      dataSourceRaw = showOnlyBlocked ? blockedUsers?.data : users?.data;
    } else {
      // Para empleados, si showOnlyBlocked, usar blockedEmployees?.data, sino employees (array directo)
      dataSourceRaw = showOnlyBlocked ? blockedEmployees?.data : employees?.data;
    }
    
    if (!Array.isArray(dataSourceRaw)) return [] as any[];
    const term = (searchTerm || '').toLowerCase();
    return dataSourceRaw.filter((u: any) => {
      const nombre = (u?.nombre || '').toLowerCase();
      const apellido = (u?.apellido || '').toLowerCase();
      const email = (u?.email || '').toLowerCase();
      const telefono = u?.telefono ? String(u.telefono) : '';
      const cargo = (u?.cargo || '').toLowerCase();
      return (
        nombre.includes(term) ||
        apellido.includes(term) ||
        email.includes(term) ||
        telefono.includes(searchTerm || '') ||
        cargo.includes(term)
      );
    });
  };
  
  // Abrir modal de desbloqueo
  const handleOpenUnblockModal = (user: any) => {
    setSelectedUser(user);
    setIsUnblockModalOpen(true);
  };

  // Abrir modal de bloqueo
  const handleOpenBlockModal = (user: any) => {
    setSelectedUser(user);
    setIsBlockModalOpen(true);
  };

  // Desbloquear usuario/empleado
  const handleUnblockUser = () => {
    if (selectedUser) {
      const mutation = viewType === 'users' ? unblockUserMutation : unblockEmployeeMutation;
      mutation.mutate(String(selectedUser._id), {
        onSuccess: () => {
          setIsUnblockModalOpen(false);
          setSelectedUser(null);
        },
        onError: (err: any) => {
          console.error('Respuesta del servidor:', err.response?.data);
        }
      });
    }
  };

  // Bloquear usuario/empleado
  const handleBlockUser = () => {
    if (selectedUser) {
      const mutation = viewType === 'users' ? blockUserMutation : blockEmployeeMutation;
      mutation.mutate(String(selectedUser._id), {
        onSuccess: () => {
          setIsBlockModalOpen(false);
          setSelectedUser(null);
        },
        onError: (err: any) => {
          console.error('Respuesta del servidor:', err.response?.data);
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra los usuarios del sistema
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Selector de tipo de vista */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewType('users')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewType === 'users'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Usuarios
            </button>
            <button
              onClick={() => setViewType('employees')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewType === 'employees'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Empleados
            </button>
          </div>
          
          {/* Checkbox para mostrar solo bloqueados */}
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox h-5 w-5 text-primary-600"
              checked={showOnlyBlocked}
              onChange={() => setShowOnlyBlocked(!showOnlyBlocked)}
            />
            <span className="ml-2 text-gray-700">Mostrar solo bloqueados</span>
          </label>
        </div>
      </div>

      {/* Buscador */}
      <div className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Buscar usuario..."
          className="flex-1 border-none focus:ring-0 focus:outline-none text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Mensaje informativo sobre bloqueos */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-700">
              <span className="font-bold">Información:</span> Los {viewType === 'users' ? 'usuarios' : 'empleados'} son bloqueados automáticamente después de 3 intentos fallidos de inicio de sesión. Utilice esta sección para desbloquear cuentas.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de usuarios/empleados */}
      {isLoading || loadingEmployees || (showOnlyBlocked && (loadingBlocked || loadingBlockedEmployees)) ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Cargando {viewType === 'users' ? 'usuarios' : 'empleados'}...</p>
        </div>
      ) : getFilteredData().length > 0 ? (
        <div className="overflow-x-auto card">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intentos fallidos
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredData().map((user: any) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {(user.nombre || '')} {(user.apellido || '')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {user.telefono && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          {user.telefono}
                        </div>
                      )}
                      {user.direccion && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          {user.direccion}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${
                      user.isBlocked
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.isBlocked ? (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Bloqueado
                        </>
                      ) : (
                        <>
                          <Unlock className="h-3 w-3 mr-1" />
                          Activo
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (user.loginAttempts || 0) > 0
                        ? (user.loginAttempts || 0) >= 3
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.loginAttempts || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end">
                      {user.isBlocked ? (
                        <button
                          onClick={() => handleOpenUnblockModal(user)}
                          className="text-primary-600 hover:text-primary-900 flex items-center"
                          title="Desbloquear usuario"
                        >
                          <Unlock className="h-4 w-4 mr-1" />
                          Desbloquear
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenBlockModal(user)}
                          className="text-red-600 hover:text-red-800 flex items-center"
                          title="Bloquear usuario"
                        >
                          <Lock className="h-4 w-4 mr-1" />
                          Bloquear
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 card">
          <UserCheck className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No hay {viewType === 'users' ? 'usuarios' : 'empleados'} {showOnlyBlocked ? 'bloqueados' : ''}
          </h3>
          <p className="mt-1 text-gray-500">
            {showOnlyBlocked 
              ? `No hay ${viewType === 'users' ? 'usuarios' : 'empleados'} bloqueados en este momento`
              : `No se encontraron ${viewType === 'users' ? 'usuarios' : 'empleados'} que coincidan con la búsqueda`}
          </p>
        </div>
      )}
      
      {/* Información sobre bloqueos */}
      <div className="card mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Política de bloqueo de cuentas</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
              <span className="block h-5 w-5 text-center text-xs font-bold text-blue-700">1</span>
            </div>
            <p className="text-gray-600">
              Los usuarios y empleados son bloqueados automáticamente después de 3 intentos fallidos de inicio de sesión consecutivos.
            </p>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
              <span className="block h-5 w-5 text-center text-xs font-bold text-blue-700">2</span>
            </div>
            <p className="text-gray-600">
              El contador de intentos fallidos se reinicia cuando el usuario o empleado inicia sesión correctamente.
            </p>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
              <span className="block h-5 w-5 text-center text-xs font-bold text-blue-700">3</span>
            </div>
            <p className="text-gray-600">
              Solo los administradores con permisos adecuados pueden desbloquear cuentas de usuarios y empleados.
            </p>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
              <span className="block h-5 w-5 text-center text-xs font-bold text-blue-700">4</span>
            </div>
            <p className="text-gray-600">
              Se recomienda verificar la identidad del usuario o empleado antes de desbloquear su cuenta, para evitar accesos no autorizados.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para desbloquear */}
      {isUnblockModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Unlock className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Desbloquear Usuario
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Está seguro de que desea desbloquear a <span className="font-semibold">{selectedUser.nombre} {selectedUser.apellido}</span>? 
                        El usuario podrá iniciar sesión nuevamente y su contador de intentos fallidos se reiniciará.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn-primary w-full sm:ml-3 sm:w-auto"
                  onClick={handleUnblockUser}
                  disabled={unblockUserMutation.isLoading}
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Desbloquear
                </button>
                <button
                  type="button"
                  className="btn-outline mt-3 sm:mt-0 w-full sm:w-auto"
                  onClick={() => setIsUnblockModalOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para bloquear */}
      {isBlockModalOpen && selectedUser && (
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
                    <Lock className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Bloquear Usuario
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Está seguro de que desea bloquear a <span className="font-semibold">{selectedUser.nombre} {selectedUser.apellido}</span>? 
                        El usuario no podrá iniciar sesión hasta que un administrador desbloquee su cuenta.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn-danger w-full sm:ml-3 sm:w-auto"
                  onClick={handleBlockUser}
                  disabled={blockUserMutation.isLoading}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Bloquear
                </button>
                <button
                  type="button"
                  className="btn-outline mt-3 sm:mt-0 w-full sm:w-auto"
                  onClick={() => setIsBlockModalOpen(false)}
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
