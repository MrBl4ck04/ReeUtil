import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, RefreshCw, X, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../services/api';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    contraseA: '',
  });

  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  // Estado y lógica del captcha (imagen)
  const [captchaImage, setCaptchaImage] = useState<string>('');
  const [captchaId, setCaptchaId] = useState<string>('');
  const [captchaValue, setCaptchaValue] = useState<string>('');

  // NUEVO: Estados para verificación por código en login
  const [showLoginVerification, setShowLoginVerification] = useState(false);
  const [loginVerificationCode, setLoginVerificationCode] = useState('');
  const [pendingLoginEmail, setPendingLoginEmail] = useState('');

  // NUEVO: flujo de cambio de contraseña
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState('');
  const [changeForm, setChangeForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  });

  // Estados para el modal de recuperación de contraseña
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1 = solicitar código, 2 = ingresar código y cambiar contraseña
  const [codeSent, setCodeSent] = useState(false);
  const [resetForm, setResetForm] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    newPasswordConfirm: '',
  });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetPasswordStrength, setResetPasswordStrength] = useState({
    length: false,
    uppercase: false,
    special: false
  });
  const [resetPasswordStrengthInfo, setResetPasswordStrengthInfo] = useState<{ label: string; level: number }>({ label: '', level: 0 });

  const fetchCaptcha = async () => {
    try {
      const res = await authApi.getCaptcha();
      setCaptchaImage(res.data.image);
      setCaptchaId(res.data.id);
      setCaptchaValue('');
    } catch {
      setError('No se pudo cargar el captcha. Intente nuevamente.');
    }
  };

  useEffect(() => {
    fetchCaptcha();
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

    // Validación del captcha (presencia)
    if (!captchaId || !captchaValue) {
      setError('Por favor resuelva el captcha.');
      await fetchCaptcha();
      return;
    }

    try {
      setIsLoading(true);
      const result = await login(formData.email, formData.contraseA, { captchaId, captchaValue });
      
      if (result.success) {
        // Redirigir según el rol del usuario (admin/empleado => /admin, usuario => /client)
        const stored = localStorage.getItem('user');
        const user = stored ? JSON.parse(stored) : null;
        const isAdmin = user?.rol === true;
        navigate(isAdmin ? '/admin' : '/client');
      } else if (result.requiresVerification) {
        // NUEVO: Mostrar campo de verificación por código
        setPendingLoginEmail(formData.email);
        setShowLoginVerification(true);
        toast.success('Código enviado a tu email. Por favor verifica tu bandeja de entrada.');
      } else if (result.requirePasswordChange) {
        // Mostrar formulario para cambio de contraseña
        setMustChangePassword(true);
      } else {
        // El mensaje de error ya se muestra en la función login via toast
        // Recargar captcha después de un intento fallido
        await fetchCaptcha();
      }
    } catch (err) {
      setError('Error al iniciar sesión. Por favor intente nuevamente.');
      await fetchCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  // NUEVO: Handler para verificar código de login
  const handleSubmitLoginVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginVerificationCode || loginVerificationCode.length !== 6) {
      setError('Por favor ingresa el código de 6 dígitos.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authApi.verifyLoginCode({
        email: pendingLoginEmail,
        verificationCode: loginVerificationCode
      });

      if (response.data.status === 'success') {
        // Guardar token y datos del usuario
        localStorage.setItem('access_token', response.data.access_token);
        // Compatibilidad con AuthContext (usa 'token')
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        toast.success('¡Login exitoso!');
        
        // Redirigir según el rol (hard redirect para que AuthProvider lea el token del storage)
        const isAdmin = response.data.user.rol === true;
        window.location.href = isAdmin ? '/admin' : '/client';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Código incorrecto. Por favor intenta de nuevo.');
      toast.error(err.response?.data?.message || 'Código de verificación incorrecto');
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers del cambio de contraseña
  const handleChangePwdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setChangeForm(prev => ({ ...prev, [name]: value }));
  };

  // Handler para cambios en el formulario de recuperación
  const handleResetFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetForm(prev => ({ ...prev, [name]: value }));

    // Validar fortaleza de contraseña en tiempo real (igual que en registro)
    if (name === 'newPassword') {
      setResetPasswordStrength({
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
      setResetPasswordStrengthInfo({ label, level });
    }
  };

  // Handler para solicitar código de verificación
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!resetForm.email) {
      setResetError('Por favor ingresa tu email.');
      return;
    }

    try {
      setResetLoading(true);
      await authApi.sendVerificationCode(resetForm.email);
      toast.success('Código de verificación enviado a tu email.');
      setCodeSent(true);
      setResetStep(2);
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'No se pudo enviar el código.');
    } finally {
      setResetLoading(false);
    }
  };

  // Handler para enviar el formulario de recuperación con código
  const handleSubmitResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');

    if (!resetForm.verificationCode || !resetForm.newPassword || !resetForm.newPasswordConfirm) {
      setResetError('Complete todos los campos.');
      return;
    }

    if (resetForm.newPassword !== resetForm.newPasswordConfirm) {
      setResetError('Las contraseñas no coinciden.');
      return;
    }

    // Validación de contraseña segura
    if (!resetPasswordStrength.length || !resetPasswordStrength.uppercase || !resetPasswordStrength.special) {
      setResetError('La contraseña debe tener al menos 12 caracteres, una letra mayúscula y un símbolo especial.');
      return;
    }

    try {
      setResetLoading(true);
      await authApi.resetPassword({
        email: resetForm.email,
        verificationCode: resetForm.verificationCode,
        newPassword: resetForm.newPassword,
        newPasswordConfirm: resetForm.newPasswordConfirm,
      });

      toast.success('¡Contraseña restablecida exitosamente! Ahora puedes iniciar sesión.');
      setShowResetModal(false);
      setResetStep(1);
      setCodeSent(false);
      setResetForm({ email: '', verificationCode: '', newPassword: '', newPasswordConfirm: '' });
      setResetPasswordStrengthInfo({ label: '', level: 0 });
      // Pre-llenar el email en el formulario de login
      setFormData(prev => ({ ...prev, email: resetForm.email }));
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'No se pudo restablecer la contraseña.');
    } finally {
      setResetLoading(false);
    }
  };

  // Handler para volver al paso 1
  const handleBackToStep1 = () => {
    setResetStep(1);
    setCodeSent(false);
    setResetForm(prev => ({ ...prev, verificationCode: '', newPassword: '', newPasswordConfirm: '' }));
    setResetPasswordStrengthInfo({ label: '', level: 0 });
    setResetError('');
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
      const result = await login(formData.email, changeForm.newPassword, { captchaId, captchaValue });
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
                  type={showPassword ? "text" : "password"}
                  name="contraseA"
                  id="contraseA"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="••••••••"
                  value={formData.contraseA}
                  onChange={handleChange}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Captcha imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Verificación</label>
              <div className="mt-1 flex items-center justify-between">
                {captchaImage ? (
                  <img src={captchaImage} alt="captcha" className="h-14 rounded border" />
                ) : (
                  <p className="text-sm text-gray-700">Cargando captcha...</p>
                )}
                <button
                  type="button"
                  onClick={fetchCaptcha}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="ml-1">Cambiar</span>
                </button>
              </div>
              <input
                type="text"
                className="mt-2 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Ingrese el texto de la imagen"
                value={captchaValue}
                onChange={(e) => setCaptchaValue(e.target.value)}
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
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                disabled={isLoading}
              >
                {isLoading ? 'Ingresando...' : 'Ingresar'}
              </button>
            </div>
          </form>

          {/* NUEVO: Formulario de verificación por código de login */}
          {showLoginVerification && (
            <div className="mt-6 border-t pt-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                <p className="text-sm text-blue-700">
                  Hemos enviado un código de 6 dígitos a <strong>{pendingLoginEmail}</strong>. Por favor revisa tu bandeja de entrada.
                </p>
              </div>
              
              <form onSubmit={handleSubmitLoginVerification} className="space-y-4">
                <div>
                  <label htmlFor="login-verification-code" className="block text-sm font-medium text-gray-700">
                    Código de Verificación
                  </label>
                  <input
                    type="text"
                    id="login-verification-code"
                    maxLength={6}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full text-center text-2xl tracking-widest sm:text-sm border-gray-300 rounded-md font-mono"
                    placeholder="000000"
                    value={loginVerificationCode}
                    onChange={(e) => setLoginVerificationCode(e.target.value)}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    El código expira en 10 minutos.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginVerification(false);
                      setLoginVerificationCode('');
                      setPendingLoginEmail('');
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Verificando...' : 'Verificar y Entrar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Formulario de cambio de contraseña si es necesario */}
          {mustChangePassword && (
            <div className="mt-6 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900">Cambiar contraseña</h3>
              <form className="space-y-4" onSubmit={handleSubmitChangePassword}>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contraseña actual</label>
                  <input
                    type="password"
                    name="currentPassword"
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={changeForm.currentPassword}
                    onChange={handleChangePwdInput}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
                  <input
                    type="password"
                    name="newPassword"
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={changeForm.newPassword}
                    onChange={handleChangePwdInput}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    name="newPasswordConfirm"
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={changeForm.newPasswordConfirm}
                    onChange={handleChangePwdInput}
                    required
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    disabled={changeLoading}
                  >
                    {changeLoading ? 'Guardando...' : 'Actualizar contraseña'}
                  </button>
                  {changeError && (
                    <p className="mt-2 text-sm text-red-600">{changeError}</p>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Recuperación de Contraseña */}
      {showResetModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Recuperar Contraseña
              </h3>
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetError('');
                  setResetStep(1);
                  setCodeSent(false);
                  setResetForm({ email: '', verificationCode: '', newPassword: '', newPasswordConfirm: '' });
                  setResetPasswordStrengthInfo({ label: '', level: 0 });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <form onSubmit={resetStep === 1 ? handleRequestCode : handleSubmitResetPassword} className="p-6">
              {resetError && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                  <p className="text-sm text-red-700">{resetError}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* PASO 1: Solicitar código */}
                {resetStep === 1 && (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      Ingresa tu email para recibir un código de verificación.
                    </p>
                    <div>
                      <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          id="reset-email"
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                          placeholder="tu@email.com"
                          value={resetForm.email}
                          onChange={handleResetFormChange}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* PASO 2: Ingresar código y cambiar contraseña */}
                {resetStep === 2 && (
                  <>
                    <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-4">
                      <p className="text-sm text-blue-700">
                        Revisa tu email <strong>{resetForm.email}</strong> y ingresa el código de 6 dígitos.
                      </p>
                    </div>

                    {/* Código de Verificación */}
                    <div>
                      <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700">
                        Código de Verificación
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="verificationCode"
                          id="verification-code"
                          maxLength={6}
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full text-center text-2xl tracking-widest sm:text-sm border-gray-300 rounded-md font-mono"
                          placeholder="000000"
                          value={resetForm.verificationCode}
                          onChange={handleResetFormChange}
                          required
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        El código expira en 10 minutos.
                      </p>
                    </div>

                {/* Nueva Contraseña */}
                <div>
                  <label htmlFor="reset-password" className="block text-sm font-medium text-gray-700">
                    Nueva Contraseña
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      name="newPassword"
                      id="reset-password"
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="••••••••"
                      value={resetForm.newPassword}
                      onChange={handleResetFormChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showResetPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {/* Indicador de fortaleza */}
                  <div className="mt-2">
                    <p className={`text-sm font-medium ${
                      resetPasswordStrengthInfo.level === 3 ? 'text-green-600' : 
                      resetPasswordStrengthInfo.level === 2 ? 'text-amber-600' : 
                      'text-red-600'
                    }`}>
                      Seguridad: {resetPasswordStrengthInfo.label || '—'}
                    </p>
                    <div className="mt-1 h-2 bg-gray-200 rounded">
                      <div 
                        className={`h-2 rounded ${
                          resetPasswordStrengthInfo.level === 3 ? 'bg-green-500' : 
                          resetPasswordStrengthInfo.level === 2 ? 'bg-amber-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${resetPasswordStrengthInfo.level * 33.33}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Requiere 12+ caracteres, una mayúscula y un símbolo.
                    </p>
                  </div>
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label htmlFor="reset-password-confirm" className="block text-sm font-medium text-gray-700">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showResetConfirmPassword ? 'text' : 'password'}
                      name="newPasswordConfirm"
                      id="reset-password-confirm"
                      className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 pr-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="••••••••"
                      value={resetForm.newPasswordConfirm}
                      onChange={handleResetFormChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showResetConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                  </>
                )}
              </div>

              {/* Botones del Modal */}
              <div className="mt-6 flex gap-3">
                {resetStep === 2 && (
                  <button
                    type="button"
                    onClick={handleBackToStep1}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Volver
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetError('');
                    setResetStep(1);
                    setCodeSent(false);
                    setResetForm({ email: '', verificationCode: '', newPassword: '', newPasswordConfirm: '' });
                    setResetPasswordStrengthInfo({ label: '', level: 0 });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  {resetLoading ? 'Procesando...' : (resetStep === 1 ? 'Enviar Código' : 'Restablecer')}
              </button>
            </div>
          </form>
        </div>
      </div>
      )}
    </div>
  );
};