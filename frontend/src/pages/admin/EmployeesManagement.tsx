import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Users,
  Search,
  UserPlus,
  Edit2,
  Trash2,
  
  X,
  Save,
  User,
  Mail,
  Briefcase,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { usersApi } from '../../services/api';

export const EmployeesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmCreateModalOpen, setIsConfirmCreateModalOpen] = useState(false);
  const [isConfirmEditModalOpen, setIsConfirmEditModalOpen] = useState(false);
  
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    apellidoMaterno: '',
    email: '',
    contraseA: '',
    confirmPassword: '',
    genero: '',
    cargo: ''
  });
  const [formError, setFormError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    special: false
  });
  const [passwordStrengthInfo, setPasswordStrengthInfo] = useState<{ label: string; level: number }>({ label: '', level: 0 });
  
  const queryClient = useQueryClient();
  
  // Roles quitados (no se selecciona rol en creación/edición)
  
  // Obtener todos los empleados
  const { data: employees, isLoading } = useQuery('employees', usersApi.getAllEmployees);
  
  // Mutaciones
  const createEmployeeMutation = useMutation(
    (data: any) => usersApi.createEmployee(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        setIsModalOpen(false);
        resetForm();
        setFormError('');
      },
      onError: (err: any) => {
        const message = err?.response?.data?.message || 'Error al crear empleado';
        setFormError(message);
        console.error('Create employee error:', err?.response?.data || err);
      }
    }
  );
  
  const updateEmployeeMutation = useMutation(
    (data: any) => usersApi.updateEmployee(data.id, data.employeeData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        setIsModalOpen(false);
        resetForm();
        setFormError('');
      },
      onError: (err: any) => {
        const message = err?.response?.data?.message || 'Error al actualizar empleado';
        setFormError(message);
        console.error('Update employee error:', err?.response?.data || err);
      }
    }
  );
  
  const deleteEmployeeMutation = useMutation(
    (id: string) => usersApi.deleteEmployee(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        setIsDeleteModalOpen(false);
        setSelectedEmployee(null);
      }
    }
  );
  
  // Reset de contraseña eliminado
  
  // Filtrar empleados por búsqueda
  const filteredEmployees = employees?.data?.filter((employee: any) => 
    employee.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      apellidoMaterno: '',
      email: '',
      contraseA: '',
      confirmPassword: '',
      genero: '',
      cargo: ''
    });
    setSelectedEmployee(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordStrength({
      length: false,
      uppercase: false,
      special: false
    });
    setPasswordStrengthInfo({ label: '', level: 0 });
  };
  
  // Abrir modal para crear/editar
  const handleOpenModal = (employee?: any) => {
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        nombre: employee.nombre,
        apellido: employee.apellido,
        apellidoMaterno: employee.apellidoMaterno || '',
        email: employee.email,
        contraseA: '',
        confirmPassword: '',
        genero: employee.genero || '',
        cargo: employee.cargo || ''
      });
      
    } else {
      resetForm();
      
    }
    setIsModalOpen(true);
  };
  
  // Manejar cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar fortaleza de contraseña en tiempo real
    if (name === 'contraseA') {
      setPasswordStrength({
        length: value.length >= 12,
        uppercase: /[A-Z]/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      });

      const len = value.length;
      const hasUppercase = /[A-Z]/.test(value);
      const hasNumber = /[0-9]/.test(value);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      let level = 1;
      let label = 'Muy débil';
      if (len === 12) {
        level = 2;
        label = 'Mediana';
      } else if (len > 12) {
        if (hasUppercase && hasNumber && hasSpecial) {
          level = 3;
          label = 'Alta';
        } else {
          level = 2;
          label = 'Mediana';
        }
      }
      setPasswordStrengthInfo({ label, level });
    }
  };
  
  // Validar y abrir modal de confirmación
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Validación de rol eliminada
    if (!selectedEmployee && !formData.genero) {
      setFormError('Selecciona un género');
      return;
    }
    if (!selectedEmployee && (!formData.contraseA || formData.contraseA.length < 12)) {
      setFormError('La contraseña debe tener al menos 12 caracteres');
      return;
    }
    if (!selectedEmployee && (!passwordStrength.length || !passwordStrength.uppercase || !passwordStrength.special)) {
      setFormError('La contraseña debe tener al menos 12 caracteres, una letra mayúscula y un símbolo especial.');
      return;
    }
    if (!selectedEmployee && formData.contraseA !== formData.confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return;
    }
    
    // Abrir modal de confirmación
    if (selectedEmployee) {
      setIsConfirmEditModalOpen(true);
    } else {
      setIsConfirmCreateModalOpen(true);
    }
  };

  // Confirmar creación de empleado
  const handleConfirmCreate = () => {
    createEmployeeMutation.mutate({ 
      nombre: formData.nombre,
      apellido: formData.apellido,
      apellidoMaterno: formData.apellidoMaterno,
      email: formData.email,
      contraseA: formData.contraseA,
      confirmPassword: formData.confirmPassword,
      genero: formData.genero,
      cargo: formData.cargo
    });
    setIsConfirmCreateModalOpen(false);
  };

  // Confirmar edición de empleado
  const handleConfirmEdit = () => {
    if (selectedEmployee) {
      const updateData = { ...formData } as any;
      
      const dataToSend = updateData.contraseA 
        ? updateData 
        : { 
            nombre: updateData.nombre,
            apellido: updateData.apellido,
            apellidoMaterno: updateData.apellidoMaterno,
            email: updateData.email,
            genero: updateData.genero,
            cargo: updateData.cargo,
          };
      
      updateEmployeeMutation.mutate({
        id: selectedEmployee._id,
        employeeData: dataToSend
      });
      setIsConfirmEditModalOpen(false);
    }
  };
  
  // Abrir modal de confirmación para eliminar
  const handleOpenDeleteModal = (employee: any) => {
    setSelectedEmployee(employee);
    setIsDeleteModalOpen(true);
  };
  
  // Eliminar empleado
  const handleDeleteEmployee = () => {
    if (selectedEmployee) {
      deleteEmployeeMutation.mutate(selectedEmployee._id);
    }
  };
  
  

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Empleados</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra los empleados del sistema
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Nuevo Empleado
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Buscar empleado..."
          className="flex-1 border-none focus:ring-0 focus:outline-none text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de empleados */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Cargando empleados...</p>
        </div>
      ) : filteredEmployees?.length > 0 ? (
        <div className="overflow-x-auto card">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee: any) => (
                <tr key={employee._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.nombre} {employee.apellido}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.cargo || 'Sin cargo'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.isBlocked
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {employee.isBlocked ? 'Bloqueado' : 'Activo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleOpenModal(employee)}
                        className="text-primary-600 hover:text-primary-900"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleOpenDeleteModal(employee)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
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
          <Users className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No hay empleados</h3>
          <p className="mt-1 text-gray-500">Comienza agregando un nuevo empleado</p>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary mt-4 inline-flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Nuevo Empleado
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
                      {selectedEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                              Nombre
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                name="nombre"
                                id="nombre"
                                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                placeholder="Juan"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                          <div>
                            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                              Apellido
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="text"
                                name="apellido"
                                id="apellido"
                                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                placeholder="Pérez"
                                value={formData.apellido}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="apellidoMaterno" className="block text-sm font-medium text-gray-700">
                            Apellido materno
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              name="apellidoMaterno"
                              id="apellidoMaterno"
                              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                              placeholder="García"
                              value={formData.apellidoMaterno}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                              placeholder="juan.perez@example.com"
                              value={formData.email}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="genero" className="block text-sm font-medium text-gray-700">
                            Género
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <select
                              id="genero"
                              name="genero"
                              className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              value={formData.genero}
                              onChange={handleChange}
                              required={!selectedEmployee}
                            >
                              <option value="" disabled>Selecciona tu género</option>
                              <option value="M">Masculino</option>
                              <option value="F">Femenino</option>
                              <option value="N">No binario</option>
                              <option value="O">Otro</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="cargo" className="block text-sm font-medium text-gray-700">
                            Cargo
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Briefcase className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              name="cargo"
                              id="cargo"
                              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                              placeholder="Analista de Datos"
                              value={formData.cargo}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        
                        {!selectedEmployee && (
                          <div>
                            <label htmlFor="contraseA" className="block text-sm font-medium text-gray-700">
                              Contraseña
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type={showPassword ? "text" : "password"}
                                name="contraseA"
                                id="contraseA"
                                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md"
                                placeholder="••••••••"
                                value={formData.contraseA}
                                onChange={handleChange}
                                required={!selectedEmployee}
                                minLength={12}
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                )}
                              </button>
                            </div>
                            {formData.contraseA && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-600">Fortaleza:</span>
                                  <span className={`text-xs font-medium ${
                                    passwordStrengthInfo.level === 3 ? 'text-green-600' : 
                                    passwordStrengthInfo.level === 2 ? 'text-amber-600' : 
                                    'text-red-600'
                                  }`}>
                                    {passwordStrengthInfo.label}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full transition-all ${
                                      passwordStrengthInfo.level === 3 ? 'bg-green-500' : 
                                      passwordStrengthInfo.level === 2 ? 'bg-amber-500' : 
                                      'bg-red-500'
                                    }`}
                                    style={{ width: `${(passwordStrengthInfo.level / 3) * 100}%` }}
                                  ></div>
                                </div>
                                <div className="mt-2 space-y-1">
                                  <p className={`text-xs ${passwordStrength.length ? 'text-green-600' : 'text-gray-500'}`}>
                                    {passwordStrength.length ? '✓' : '○'} Mínimo 12 caracteres
                                  </p>
                                  <p className={`text-xs ${passwordStrength.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                                    {passwordStrength.uppercase ? '✓' : '○'} Al menos una mayúscula
                                  </p>
                                  <p className={`text-xs ${passwordStrength.special ? 'text-green-600' : 'text-gray-500'}`}>
                                    {passwordStrength.special ? '✓' : '○'} Al menos un símbolo especial
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {!selectedEmployee && (
                          <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                              Confirmar contraseña
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                id="confirmPassword"
                                className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required={!selectedEmployee}
                                minLength={12}
                              />
                              <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
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
                  disabled={createEmployeeMutation.isLoading || updateEmployeeMutation.isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {selectedEmployee ? 'Actualizar' : 'Crear'}
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
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Eliminar Empleado
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Está seguro de que desea eliminar a {selectedEmployee?.nombre} {selectedEmployee?.apellido}? Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn-danger w-full sm:ml-3 sm:w-auto"
                  onClick={handleDeleteEmployee}
                  disabled={deleteEmployeeMutation.isLoading}
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

      {/* Modal de confirmación para crear empleado */}
      {isConfirmCreateModalOpen && (
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
                    <UserPlus className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Confirmar Creación de Empleado
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Está seguro de que desea crear el empleado <span className="font-semibold">{formData.nombre} {formData.apellido}</span> con el cargo de <span className="font-semibold">{formData.cargo || 'Sin cargo'}</span>?
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Se enviará un correo de bienvenida a <span className="font-semibold">{formData.email}</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn-primary w-full sm:ml-3 sm:w-auto"
                  onClick={handleConfirmCreate}
                  disabled={createEmployeeMutation.isLoading}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Crear Empleado
                </button>
                <button
                  type="button"
                  className="btn-outline mt-3 sm:mt-0 w-full sm:w-auto"
                  onClick={() => setIsConfirmCreateModalOpen(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para editar empleado */}
      {isConfirmEditModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Edit2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Confirmar Edición de Empleado
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Está seguro de que desea actualizar la información de <span className="font-semibold">{selectedEmployee.nombre} {selectedEmployee.apellido}</span>?
                      </p>
                      {formData.contraseA && (
                        <p className="text-sm text-yellow-600 mt-2">
                          ⚠️ Se actualizará la contraseña del empleado.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn-primary w-full sm:ml-3 sm:w-auto"
                  onClick={handleConfirmEdit}
                  disabled={updateEmployeeMutation.isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Actualizar
                </button>
                <button
                  type="button"
                  className="btn-outline mt-3 sm:mt-0 w-full sm:w-auto"
                  onClick={() => setIsConfirmEditModalOpen(false)}
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
