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
  AlertTriangle
} from 'lucide-react';
import { usersApi } from '../../services/api';

export const UsersManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyBlocked, setShowOnlyBlocked] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Obtener todos los usuarios
  const { data: users, isLoading } = useQuery('users', usersApi.getAll);
  
  // Obtener usuarios bloqueados
  const { data: blockedUsers, isLoading: loadingBlocked } = useQuery(
    'blockedUsers', 
    usersApi.getBlocked,
    {
      enabled: showOnlyBlocked
    }
  );
  
  // Mutación para desbloquear usuario
  const unblockUserMutation = useMutation(
    (id: number) => usersApi.unblockUser(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        queryClient.invalidateQueries('blockedUsers');
      }
    }
  );
  
  // Filtrar usuarios por búsqueda
  const getFilteredUsers = () => {
    const dataSource = showOnlyBlocked ? blockedUsers?.data : users?.data;
    
    if (!dataSource) return [];
    
    return dataSource.filter((user: any) => 
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.telefono && user.telefono.includes(searchTerm))
    );
  };
  
  // Desbloquear usuario
  const handleUnblockUser = (id: number) => {
    if (window.confirm('¿Está seguro de que desea desbloquear a este usuario?')) {
      unblockUserMutation.mutate(id);
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
        <div className="flex items-center">
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
              <span className="font-bold">Información:</span> Los usuarios son bloqueados automáticamente después de 3 intentos fallidos de inicio de sesión. Utilice esta sección para desbloquear cuentas.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de usuarios */}
      {isLoading || (showOnlyBlocked && loadingBlocked) ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Cargando usuarios...</p>
        </div>
      ) : getFilteredUsers().length > 0 ? (
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
              {getFilteredUsers().map((user: any) => (
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
                          {user.nombre} {user.apellido}
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
                      user.loginAttempts > 0
                        ? user.loginAttempts >= 3
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.loginAttempts || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end">
                      {user.isBlocked && (
                        <button
                          onClick={() => handleUnblockUser(user._id)}
                          className="text-primary-600 hover:text-primary-900 flex items-center"
                          title="Desbloquear usuario"
                        >
                          <Unlock className="h-4 w-4 mr-1" />
                          Desbloquear
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
          <h3 className="mt-2 text-lg font-medium text-gray-900">No hay usuarios {showOnlyBlocked ? 'bloqueados' : ''}</h3>
          <p className="mt-1 text-gray-500">
            {showOnlyBlocked 
              ? 'No hay usuarios bloqueados en este momento'
              : 'No se encontraron usuarios que coincidan con la búsqueda'}
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
              Los usuarios son bloqueados automáticamente después de 3 intentos fallidos de inicio de sesión consecutivos.
            </p>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
              <span className="block h-5 w-5 text-center text-xs font-bold text-blue-700">2</span>
            </div>
            <p className="text-gray-600">
              El contador de intentos fallidos se reinicia cuando el usuario inicia sesión correctamente.
            </p>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
              <span className="block h-5 w-5 text-center text-xs font-bold text-blue-700">3</span>
            </div>
            <p className="text-gray-600">
              Solo los administradores con permisos adecuados pueden desbloquear cuentas de usuario.
            </p>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 rounded-full p-1 mr-3 flex-shrink-0 mt-0.5">
              <span className="block h-5 w-5 text-center text-xs font-bold text-blue-700">4</span>
            </div>
            <p className="text-gray-600">
              Se recomienda verificar la identidad del usuario antes de desbloquear su cuenta, para evitar accesos no autorizados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
