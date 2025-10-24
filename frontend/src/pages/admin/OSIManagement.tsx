import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Shield,
  Search,
  User,
  Check,
  X,
  Save,
  AlertTriangle
} from 'lucide-react';
import { usersApi } from '../../services/api';

export const OSIManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [draftPerms, setDraftPerms] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  
  // Obtener todos los empleados
  const { data: employees, isLoading } = useQuery('employees', usersApi.getAllEmployees);
  
  // Obtener permisos del empleado seleccionado
  const { data: permissions, isLoading: loadingPermissions } = useQuery(
    ['employeePermissions', selectedEmployee?._id],
    () => usersApi.getEmployeePermissions(selectedEmployee._id),
    {
      enabled: !!selectedEmployee,
    }
  );

  // Sincronizar permisos efectivos cuando cambia el empleado o la consulta
  React.useEffect(() => {
    console.log('Permisos recibidos del backend:', permissions);
    console.log('permissions?.data:', permissions?.data);
    console.log('permissions?.data?.data:', permissions?.data?.data);
    
    // Axios ya envuelve en .data, y el backend devuelve { data: { permissions } }
    const permsArray = permissions?.data?.data?.permissions || [];
    console.log('Permisos efectivos:', permsArray);
    setDraftPerms(new Set(permsArray as string[]));
  }, [permissions?.data?.data?.permissions, selectedEmployee?._id]);

  // Set con permisos efectivos del empleado
  const employeePermSet = draftPerms;

  // Mutación para actualizar permisos
  const updatePermissionsMutation = useMutation(
    (data: { id: any; permissions: any[] }) => {
      console.log('Guardando permisos:', data);
      return usersApi.updateEmployeePermissions(data.id, data.permissions);
    },
    {
      onSuccess: (response) => {
        console.log('Permisos guardados exitosamente:', response);
        queryClient.invalidateQueries(['employeePermissions', selectedEmployee?._id]);
        alert('Permisos guardados exitosamente');
      },
      onError: (error: any) => {
        console.error('Error al guardar permisos:', error);
        alert('Error al guardar permisos: ' + (error.response?.data?.message || error.message));
      }
    }
  );
  
  // Filtrar empleados por búsqueda
  const filteredEmployees = employees?.data?.filter((employee: any) => 
    employee.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Módulos disponibles en el sistema
  const availableModules = [
    { id: 'rules', name: 'Reglas', description: 'Gestión de reglas del sistema' },
    { id: 'repairs', name: 'Reparaciones', description: 'Gestión de solicitudes de reparación' },
    { id: 'recycle', name: 'Reciclaje', description: 'Gestión de solicitudes de reciclaje' },
    { id: 'dashboards', name: 'Dashboards', description: 'Visualización de estadísticas' },
    { id: 'sales', name: 'Administrar Ventas', description: 'Gestión de ventas en el marketplace' },
    { id: 'satisfaction', name: 'Satisfacción Cliente', description: 'Gestión de reseñas y calificaciones' },
    { id: 'employees', name: 'ABM Empleados', description: 'Gestión de empleados' },
    { id: 'users', name: 'ABM Usuarios', description: 'Gestión de usuarios' },
    { id: 'osi', name: 'Gestión OSI', description: 'Gestión de permisos (solo para OSI)' },
    { id: 'logs', name: 'Logs del Sistema', description: 'Auditoría de logins, bloqueos y cambios' },
  ];
  
  // Actualizar permiso
  const handleTogglePermission = (moduleId: string) => {
    setDraftPerms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) newSet.delete(moduleId);
      else newSet.add(moduleId);
      return newSet;
    });
  };

  // Guardar permisos explícitamente (botón)
  const handleSavePermissions = () => {
    updatePermissionsMutation.mutate({
      id: selectedEmployee._id,
      permissions: Array.from(draftPerms)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión OSI</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administra permisos y accesos de los empleados
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de empleados */}
        <div className="lg:col-span-1 card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Empleados</h2>
          
          {/* Buscador */}
          <div className="flex items-center px-3 py-2 bg-white rounded-lg border border-gray-200 mb-4">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar empleado..."
              className="flex-1 border-none focus:ring-0 focus:outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Lista de empleados */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-solid border-primary-600 border-r-transparent"></div>
                <p className="mt-2 text-sm text-gray-500">Cargando empleados...</p>
              </div>
            ) : filteredEmployees?.length > 0 ? (
              filteredEmployees.map((employee: any) => (
                <div
                  key={employee._id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedEmployee?._id === employee._id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {employee.nombre} {employee.apellido}
                      </p>
                      <p className="text-xs text-gray-500">{employee.cargo || 'Sin cargo asignado'}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-gray-500">No se encontraron empleados</p>
            )}
          </div>
        </div>
        
        {/* Gestión de permisos */}
        <div className="lg:col-span-2 card">
          {selectedEmployee ? (
            <>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Permisos de {selectedEmployee.nombre} {selectedEmployee.apellido}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedEmployee.cargo || 'Sin cargo asignado'} • {selectedEmployee.email}
                  </p>
                </div>
                <button
                  onClick={handleSavePermissions}
                  className="btn-primary flex items-center"
                  disabled={updatePermissionsMutation.isLoading ||
                    JSON.stringify(Array.from(draftPerms).sort()) ===
                    JSON.stringify((permissions?.data?.data?.permissions || []).slice().sort())}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Guardar cambios
                </button>
              </div>
              
              {loadingPermissions ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-solid border-primary-600 border-r-transparent"></div>
                  <p className="mt-2 text-sm text-gray-500">Cargando permisos...</p>
                </div>
              ) : (
                <>
                  {/* Mensaje de advertencia */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-700">
                          <span className="font-bold">Importante:</span> Los cambios en los permisos tendrán efecto inmediato.
                          Asegúrese de que el empleado tenga los permisos necesarios para realizar sus funciones.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tabla de permisos */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Módulo
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Descripción
                          </th>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acceso
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {availableModules.map((module) => {
                          const hasAccess = employeePermSet.has(module.id);
                          return (
                            <tr key={module.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{module.name}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-500">{module.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <input
                                  type="checkbox"
                                  checked={hasAccess}
                                  onChange={() => handleTogglePermission(module.id)}
                                  className="h-4 w-4 text-primary-600"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Seleccione un empleado</h3>
              <p className="mt-1 text-gray-500">
                Seleccione un empleado de la lista para gestionar sus permisos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
