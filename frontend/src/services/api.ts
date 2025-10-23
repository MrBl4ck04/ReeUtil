import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: { email: string; contraseA: string }) =>
    api.post('/auth/login', data),
  register: (data: any) =>
    api.post('/auth/register', data),
  incrementLoginAttempts: (email: string) =>
    api.post('/auth/login-attempts/increment', { email }),
  resetLoginAttempts: (userId: number) =>
    api.post('/auth/login-attempts/reset', { userId }),
  checkUserBlocked: (email: string) =>
    api.get(`/auth/check-blocked/${email}`),
  validateCredentials: (data: { email: string; contraseA: string }) =>
    api.post('/auth/validate', data),
};

// Users API
export const usersApi = {
  // Usuarios comunes (clientes)
  getAll: () => api.get('/users'),
  getById: (id: number) => api.get(`/users/${id}`),
  update: (id: number, data: any) => api.patch(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
  getBlocked: () => api.get('/users/blocked'),
  unblockUser: (id: number) => api.post(`/users/${id}/unblock`),
  
  // Empleados (admin)
  getAllEmployees: () => api.get('/users/employees'),
  getEmployeeById: (id: number) => api.get(`/users/employees/${id}`),
  createEmployee: (data: any) => api.post('/users/employees', data),
  updateEmployee: (id: number, data: any) => api.patch(`/users/employees/${id}`, data),
  deleteEmployee: (id: number) => api.delete(`/users/employees/${id}`),
  resetEmployeePassword: (id: number) => api.post(`/users/employees/${id}/reset-password`),
  
  // Permisos
  getEmployeePermissions: (id: number) => api.get(`/users/employees/${id}/permissions`),
  updateEmployeePermissions: (id: number, permissions: any[]) => 
    api.post(`/users/employees/${id}/permissions`, { permissions }),
};

// Catalog API
export const catalogApi = {
  getAll: () => api.get('/catalog'),
  getById: (id: string) => api.get(`/catalog/${id}`),
  getTypes: () => api.get('/catalog/types'),
  getByType: (tipo: string) => api.get(`/catalog/filter?tipo=${tipo}`),
  create: (data: any) => api.post('/catalog', data),
  update: (id: string, data: any) => api.patch(`/catalog/${id}`, data),
  delete: (id: string) => api.delete(`/catalog/${id}`),
};

// Devices API
export const devicesApi = {
  getAll: () => api.get('/devices'),
  getPending: () => api.get('/devices/pending'),
  getAccepted: () => api.get('/devices/accepted'),
  getById: (id: number) => api.get(`/devices/${id}`),
  create: (data: any) => api.post('/devices', data),
  updateQuotation: (data: any) => api.post('/devices/update-quotation', data),
  updateStatus: (data: any) => api.post('/devices/update-status', data),
  delete: (id: number) => api.delete(`/devices/${id}`),
};

// Quotations API
export const quotationsApi = {
  getInventory: (tipo?: string, estado?: string) => {
    const params = new URLSearchParams();
    if (tipo) params.append('tipo', tipo);
    if (estado) params.append('estado', estado);
    return api.get(`/quotations/inventory?${params.toString()}`);
  },
};

// Rules API
export const rulesApi = {
  getAll: () => api.get('/rules'),
  getByCatalogId: (idCatalogo: string) => api.get(`/rules/catalog/${idCatalogo}`),
  create: (data: any) => api.post('/rules', data),
  delete: (id: string) => api.delete(`/rules/${id}`),
};

// Inventory API
export const inventoryApi = {
  getInventory: (tipo?: string, estado?: string) => {
    const params = new URLSearchParams();
    if (tipo) params.append('tipo', tipo);
    if (estado) params.append('estado', estado);
    return api.get(`/inventory?${params.toString()}`);
  },
};

// Sales API
export const salesApi = {
  // Rutas públicas
  getAll: (params?: { categoria?: string; estado?: string; condicion?: string; precioMin?: number; precioMax?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.categoria) searchParams.append('categoria', params.categoria);
    if (params?.estado) searchParams.append('estado', params.estado);
    if (params?.condicion) searchParams.append('condicion', params.condicion);
    if (params?.precioMin) searchParams.append('precioMin', params.precioMin.toString());
    if (params?.precioMax) searchParams.append('precioMax', params.precioMax.toString());
    return api.get(`/api/ventas?${searchParams.toString()}`);
  },
  getById: (id: string) => api.get(`/api/ventas/${id}`),
  search: (query: string) => api.get(`/api/ventas/buscar?q=${encodeURIComponent(query)}`),
  
  // Rutas protegidas (requieren autenticación)
  create: (data: any) => api.post('/api/ventas', data),
  getMySales: () => api.get('/api/ventas/usuario/mis-ventas'),
  update: (id: string, data: any) => api.patch(`/api/ventas/${id}`, data),
  buy: (id: string) => api.post(`/api/ventas/${id}/comprar`),
  delete: (id: string) => api.delete(`/api/ventas/${id}`),
  
  // Rutas de administración (requieren rol admin)
  getAllForAdmin: (params?: { 
    categoria?: string; 
    estado?: string; 
    estadoAdmin?: string; 
    condicion?: string; 
    precioMin?: number; 
    precioMax?: number;
    search?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.categoria) searchParams.append('categoria', params.categoria);
    if (params?.estado) searchParams.append('estado', params.estado);
    if (params?.estadoAdmin) searchParams.append('estadoAdmin', params.estadoAdmin);
    if (params?.condicion) searchParams.append('condicion', params.condicion);
    if (params?.precioMin) searchParams.append('precioMin', params.precioMin.toString());
    if (params?.precioMax) searchParams.append('precioMax', params.precioMax.toString());
    if (params?.search) searchParams.append('search', params.search);
    return api.get(`/api/ventas/admin/todas?${searchParams.toString()}`);
  },
  disable: (id: string) => api.patch(`/api/ventas/admin/${id}/deshabilitar`),
  enable: (id: string) => api.patch(`/api/ventas/admin/${id}/habilitar`),
};

export default api;
