import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, RefreshCw } from 'lucide-react';
import { authApi } from '../services/api';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    contraseA: '',
  });

  // Estado y lógica del captcha
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaExpected, setCaptchaExpected] = useState<number | null>(null);
  const [captchaInput, setCaptchaInput] = useState('');

  // NUEVO: flujo de cambio de contraseña
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeForm, setChangeForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  });

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 9) + 1; // 1-9
    const b = Math.floor(Math.random() * 9) + 1; // 1-9
    setCaptchaQuestion(`¿Cuánto es ${a} + ${b}?`);
    setCaptchaExpected(a + b);
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.contraseA) {
      setError('Por favor ingrese su email y contraseña.');
      return;
    }

    // Validación del captcha
    if (captchaExpected === null || parseInt(captchaInput, 10) !== captchaExpected) {
      setError('Verificación captcha incorrecta. Por favor inténtalo de nuevo.');
      generateCaptcha();
      return;
    }

    try {
      setIsLoading(true);
      const result = await login(formData.email, formData.contraseA);
      
      if (result.success) {
        // Redirigir según el rol del usuario (admin/empleado => /admin, usuario => /client)
        const stored = localStorage.getItem('user');
        const user = stored ? JSON.parse(stored) : null;
        const isAdmin = user?.rol === true;
        navigate(isAdmin ? '/admin' : '/client');
      } else if (result.requirePasswordChange) {
        // Mostrar formulario para cambio de contraseña
        setMustChangePassword(true);
      } else {
        // El mensaje de error ya se muestra en la función login
      }
    } catch (err) {
      setError('Error al iniciar sesión. Por favor intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers del cambio de contraseña
  const handleChangePwdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChangeForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError('');

    if (!formData.email) {
      setChangeError('Falta el email para identificar la cuenta.');
      return;
    }
    if (!changeForm.currentPassword || !changeForm.newPassword || !changeForm.newPasswordConfirm) {
      setChangeError('Complete todos los campos para cambiar la contraseña.');
      return;
    }
    if (changeForm.newPassword !== changeForm.newPasswordConfirm) {
      setChangeError('Las contraseñas nuevas no coinciden.');
      return;
    }

    try {
      setChangeLoading(true);
      await authApi.changePassword({
        email: formData.email,
        currentPassword: changeForm.currentPassword,
        newPassword: changeForm.newPassword,
        newPasswordConfirm: changeForm.newPasswordConfirm,
      });

      // Intentar login automático con la nueva contraseña
      const result = await login(formData.email, changeForm.newPassword);
      if (result.success) {
        const stored = localStorage.getItem('user');
        const user = stored ? JSON.parse(stored) : null;
        const isAdmin = user?.rol === true;
        navigate(isAdmin ? '/admin' : '/client');
      } else {
        setMustChangePassword(false);
        setError('La contraseña fue cambiada, pero no se pudo iniciar sesión automáticamente. Intente manualmente.');
      }
    } catch (err: any) {
      setChangeError(err.response?.data?.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setChangeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Iniciar sesión
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            Regístrate
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
              <label htmlFor="contraseA" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="contraseA"
                  id="contraseA"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="••••••••"
                  value={formData.contraseA}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Captcha */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Verificación</label>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-sm text-gray-700">{captchaQuestion}</p>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="ml-1">Cambiar</span>
                </button>
              </div>
              <input
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                className="mt-2 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Tu respuesta"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>

          {/* NUEVO: Formulario de cambio de contraseña forzado */}
          {mustChangePassword && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900">Tu contraseña ha expirado</h3>
              <p className="mt-1 text-sm text-gray-600">Para continuar, cambia tu contraseña. No puedes reutilizar contraseñas anteriores.</p>

              {changeError && (
                <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-3">
                  <p className="text-sm text-red-700">{changeError}</p>
                </div>
              )}

              <form className="mt-4 space-y-4" onSubmit={handleSubmitChangePassword}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña actual</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={changeForm.currentPassword}
                    onChange={handleChangePwdInput}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={changeForm.newPassword}
                    onChange={handleChangePwdInput}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Mínimo 12 caracteres, mayúscula y símbolo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    name="newPasswordConfirm"
                    value={changeForm.newPasswordConfirm}
                    onChange={handleChangePwdInput}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Repite la nueva contraseña"
                    required
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    disabled={changeLoading}
                  >
                    {changeLoading ? 'Actualizando...' : 'Cambiar contraseña'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};