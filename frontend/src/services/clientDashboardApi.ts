import api from './api';

// API solo para datos del dashboard cliente
export const clientDashboardApi = {
  // Mis ventas (productos que he vendido)
  getMyVentas: () => api.get('/api/dashboard/client/my-sales'),
  
  // Mis compras (productos que he comprado)
  getMyCompras: () => api.get('/api/dashboard/client/my-purchases'),
  
  // Mis reparaciones
  getMyRepairs: () => api.get('/api/dashboard/client/my-repairs'),
  
  // Mis reciclajes
  getMyRecycle: () => api.get('/api/dashboard/client/my-recycle'),
  
  // Mis notificaciones
  getMyNotifications: () => api.get('/api/dashboard/client/my-notifications'),
  
  // Todos los datos de una sola vez
  getClientDashboardData: () => api.get('/api/dashboard/client/all'),
};
