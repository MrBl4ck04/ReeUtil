import axios from 'axios';

const API_URL = 'http://localhost:5500/api/auth';

// Interfaces
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: {
      userId: string;
      name: string;
      email: string;
    }
  }
}

// Registro de usuario
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/signup`, userData);
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Login de usuario
export const login = async (userData: LoginData): Promise<AuthResponse> => {
  const response = await axios.post(`${API_URL}/login`, userData);
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Cerrar sesión
export const logout = (): void => {
  localStorage.removeItem('user');
};

// Obtener usuario actual
export const getCurrentUser = (): AuthResponse | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    return JSON.parse(userStr);
  }
  return null;
};

// Obtener token de autenticación
export const getAuthToken = (): string | null => {
  const user = getCurrentUser();
  return user ? user.token : null;
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  getAuthToken
};

export default authService;