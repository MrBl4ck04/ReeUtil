import api from './api';

// API para reseñas del cliente
export const clientReviewsApi = {
  // Obtener mis reseñas
  getMyReviews: () => api.get('/api/reviews/my-reviews'),
  
  // Crear una reseña
  createReview: (data: any) => api.post('/api/reviews', data),
  
  // Editar una reseña
  updateReview: (id: string, data: any) => api.patch(`/api/reviews/${id}`, data),
  
  // Eliminar una reseña
  deleteReview: (id: string) => api.delete(`/api/reviews/${id}`),
  
  // Reportar una reseña
  flagReview: (id: string, reason: string) => api.post(`/api/reviews/${id}/flag`, { reason }),
};
