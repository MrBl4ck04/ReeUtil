import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Recycle, Eye, EyeOff } from 'lucide-react';

interface LoginForm {
  email: string;
  contraseA: string;
}

interface RegisterForm {
  nombre: string;
  apellido: string;
  email: string;
  contraseA: string;
  direccion?: string;
  telefono?: string;
}

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<LoginForm>();
  const registerForm = useForm<RegisterForm>();

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    const success = await login(data.email, data.contraseA);
    if (success) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      navigate(user.rol ? '/admin' : '/client');
    }
    setIsLoading(false);
  };

  const handleRegister = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      // Aquí implementarías la lógica de registro
      console.log('Register data:', data);
      // Por ahora solo mostramos un mensaje
      alert('Funcionalidad de registro en desarrollo');
    } catch (error) {
      console.error('Error registering:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Recycle className="h-16 w-16 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin 
              ? 'Accede a tu cuenta de ReeUtil' 
              : 'Crea tu cuenta en ReeUtil'
            }
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  {...loginForm.register('email', { 
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  type="email"
                  className="input mt-1"
                  placeholder="tu@email.com"
                />
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-danger-600">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="contraseA" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="mt-1 relative">
                  <input
                    {...loginForm.register('contraseA', { 
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 6,
                        message: 'La contraseña debe tener al menos 6 caracteres'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Tu contraseña"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {loginForm.formState.errors.contraseA && (
                  <p className="mt-1 text-sm text-danger-600">
                    {loginForm.formState.errors.contraseA.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    {...registerForm.register('nombre', { required: 'El nombre es requerido' })}
                    type="text"
                    className="input mt-1"
                    placeholder="Tu nombre"
                  />
                  {registerForm.formState.errors.nombre && (
                    <p className="mt-1 text-sm text-danger-600">
                      {registerForm.formState.errors.nombre.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">
                    Apellido
                  </label>
                  <input
                    {...registerForm.register('apellido', { required: 'El apellido es requerido' })}
                    type="text"
                    className="input mt-1"
                    placeholder="Tu apellido"
                  />
                  {registerForm.formState.errors.apellido && (
                    <p className="mt-1 text-sm text-danger-600">
                      {registerForm.formState.errors.apellido.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  {...registerForm.register('email', { 
                    required: 'El email es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                  type="email"
                  className="input mt-1"
                  placeholder="tu@email.com"
                />
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-danger-600">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="contraseA" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  {...registerForm.register('contraseA', { 
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres'
                    }
                  })}
                  type="password"
                  className="input mt-1"
                  placeholder="Tu contraseña"
                />
                {registerForm.formState.errors.contraseA && (
                  <p className="mt-1 text-sm text-danger-600">
                    {registerForm.formState.errors.contraseA.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
                    Dirección (opcional)
                  </label>
                  <input
                    {...registerForm.register('direccion')}
                    type="text"
                    className="input mt-1"
                    placeholder="Tu dirección"
                  />
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
                    Teléfono (opcional)
                  </label>
                  <input
                    {...registerForm.register('telefono')}
                    type="tel"
                    className="input mt-1"
                    placeholder="Tu teléfono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full"
              >
                {isLoading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>
          )}

          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-center text-sm text-primary-600 hover:text-primary-500"
            >
              {isLogin 
                ? '¿No tienes cuenta? Regístrate aquí' 
                : '¿Ya tienes cuenta? Inicia sesión aquí'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
