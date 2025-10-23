import api from './api';

export const ventasApi = {
  crearVenta: (data: any) => api.post('/api/ventas', data),
  obtenerMisVentas: () => api.get('/api/ventas/usuario/mis-ventas'),
  obtenerProductosDeshabilitados: () => api.get('/api/ventas/usuario/productos-deshabilitados'),
  actualizarVenta: (id: string, data: any) => api.patch(`/api/ventas/${id}`, data),
  comprarVenta: (id: string) => api.post(`/api/ventas/${id}/comprar`),
  eliminarVenta: (id: string) => api.delete(`/api/ventas/${id}`),
  obtenerVenta: (id: string) => api.get(`/api/ventas/${id}`),
  obtenerVentas: (params?: any) => api.get('/api/ventas', { params }),
  buscarVentas: (query: string) => api.get(`/api/ventas/buscar?q=${encodeURIComponent(query)}`),
  obtenerEstadisticasDashboard: () => api.get('/api/ventas/dashboard'),
};