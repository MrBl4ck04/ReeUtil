import api from './api';

// API para admin - Satisfacción del cliente
export const adminSatisfactionApi = {
  // Reseñas
  getAllReviews: () => api.get('/api/reviews/all'),
  getReviewsStats: () => api.get('/api/reviews/stats'),
  flagReview: (id: string, reason: string) => api.post(`/api/reviews/${id}/flag`, { reason }),
  deleteReview: (id: string) => api.delete(`/api/reviews/${id}`),
  
  // Reparaciones
  getAllRepairs: () => api.get('/api/repairs/all'),
  updateRepairStatus: (id: string, status: string) => api.patch(`/api/repairs/${id}/status`, { status }),
  
  // Reciclaje
  getAllRecycleRequests: () => api.get('/api/recycle/all'),
  updateRecycleStatus: (id: string, status: string) => api.patch(`/api/recycle/${id}/status`, { status }),
};
