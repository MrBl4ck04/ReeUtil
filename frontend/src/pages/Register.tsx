import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { Mail, User, Lock, Phone, MapPin, Eye, EyeOff } from 'lucide-react';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  // const auth = useAuth(); // No se requiere para registro
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    special: false
  });
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    apellidoMaterno: '',
    genero: '',
    email: '',
    contraseA: '',
    confirmPassword: '',
    direccion: '',
    telefono: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrengthInfo, setPasswordStrengthInfo] = useState<{ label: string; level: number }>({ label: '', level: 0 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validar fortaleza de contraseña en tiempo real
    if (name === 'contraseA') {
      // Se mantiene la validación estricta por submit
      setPasswordStrength({
        length: value.length >= 12,
        uppercase: /[A-Z]/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      });

      // Regla: <12 siempre débil, ==12 mediana,
      // >12 se mantiene mediana a menos que cumpla mayúscula, número y símbolo
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

  // Colores para el indicador de fuerza
  const strengthColor = passwordStrengthInfo.level === 3 ? 'text-green-600' : passwordStrengthInfo.level === 2 ? 'text-amber-600' : 'text-red-600';
  const barColor = passwordStrengthInfo.level === 3 ? 'bg-green-500' : passwordStrengthInfo.level === 2 ? 'bg-amber-500' : 'bg-red-500';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones básicas
    if (!formData.nombre || !formData.apellido || !formData.apellidoMaterno || !formData.genero || !formData.email || !formData.contraseA) {
      setError('Por favor complete todos los campos requeridos.');
      return;
    }

    if (formData.contraseA !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    // Validación de contraseña segura (se mantiene)
    if (!passwordStrength.length || !passwordStrength.uppercase || !passwordStrength.special) {
      setError('La contraseña debe tener al menos 12 caracteres, una letra mayúscula y un símbolo especial.');
      return;
    }

    try {
      setIsLoading(true);
      // Llamada a la API para registrar al usuario
      await authApi.register({
        name: formData.nombre,
        lastName: formData.apellido,
        motherLastName: formData.apellidoMaterno,
        gender: formData.genero, // M, F, N, O
        email: formData.email,
        password: formData.contraseA,
        passwordConfirm: formData.confirmPassword
      });
      setIsLoading(false);
      navigate('/login', { state: { message: 'Registro exitoso. Por favor inicie sesión.' } });
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Error al registrar. Por favor intente nuevamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Crear una cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Inicia sesión
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
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
                  Apellido paterno
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
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
                  <User className="h-5 w-5 text-gray-400" />
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
              <label htmlFor="genero" className="block text-sm font-medium text-gray-700">
                Género
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <select
                  name="genero"
                  id="genero"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  value={formData.genero}
                  onChange={handleChange}
                  required
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="contraseA" className="block text_sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="contraseA"
                  id="contraseA"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="••••••••"
                  value={formData.contraseA}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="mt-2">
                <p className={`text-sm font-medium ${strengthColor}`}>Seguridad: {passwordStrengthInfo.label || '—'}</p>
                <div className="mt-1 h-2 bg-gray-200 rounded">
                  <div className={`h-2 rounded ${barColor}`} style={{ width: `${passwordStrengthInfo.level * 33.33}%` }} />
                </div>
                <p className="mt-1 text-xs text-gray-500">Requiere 12+ caracteres, una mayúscula y un símbolo.</p>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmar Contraseña
              </label>
              <div className="mt-1 relative rounded-md shadow_sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items_center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  id="confirmPassword"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                Dirección (opcional)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="direccion"
                  id="direccion"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Calle, Ciudad, País"
                  value={formData.direccion}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                Teléfono (opcional)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="telefono"
                  id="telefono"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="+1234567890"
                  value={formData.telefono}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={isLoading}
              >
                {isLoading ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
