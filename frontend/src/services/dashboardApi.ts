import api from './api';

// API solo para datos del dashboard admin
export const dashboardApi = {
  // Reparaciones pendientes
  getPendingRepairs: () => api.get('/api/dashboard/repairs-pending'),
  
  // Reciclaje pendiente
  getPendingRecycle: () => api.get('/api/dashboard/recycle-pending'),
  
  // Ventas recientes
  getRecentSales: () => api.get('/api/dashboard/recent-sales'),
  
  // Reseñas nuevas
  getNewReviews: () => api.get('/api/dashboard/new-reviews'),
  
  // Todos los datos de una sola vez (opcional)
  getDashboardData: () => api.get('/api/dashboard/all'),
};
