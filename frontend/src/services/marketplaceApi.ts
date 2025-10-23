import api from './api';

// API para el marketplace (ventas y compras)
export const marketplaceApi = {
  // Productos a la venta
  getAllProducts: (filters?: any) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    return api.get(`/marketplace/products?${params.toString()}`);
  },
  getProductById: (id: string) => api.get(`/marketplace/products/${id}`),
  
  // Mis productos (como vendedor)
  getMyProducts: () => api.get('/marketplace/my-products'),
  createProduct: (data: any) => api.post('/marketplace/products', data),
  updateProduct: (id: string, data: any) => api.patch(`/marketplace/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/marketplace/products/${id}`),
  
  // Compras
  getMyPurchases: () => api.get('/marketplace/my-purchases'),
  purchaseProduct: (productId: string) => api.post('/marketplace/purchase', { productId }),
  
  // Ventas realizadas
  getMySales: () => api.get('/marketplace/my-sales'),
  
  // Simulación de pagos
  simulatePayment: (data: any) => api.post('/marketplace/simulate-payment', data),
};

// API para reparaciones
export const repairApi = {
  // Cliente
  getMyRepairRequests: () => api.get('/repairs/my-requests'),
  createRepairRequest: (data: any) => api.post('/repairs/request', data),
  acceptRepairQuote: (id: string) => api.post(`/repairs/${id}/accept`),
  rejectRepairQuote: (id: string) => api.post(`/repairs/${id}/reject`),
  
  // Admin
  getAllRepairRequests: (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return api.get(`/repairs/all?${params.toString()}`);
  },
  getRepairById: (id: string) => api.get(`/repairs/${id}`),
  updateRepairQuote: (id: string, data: any) => api.patch(`/repairs/${id}/quote`, data),
  updateRepairStatus: (id: string, data: any) => api.patch(`/repairs/${id}/status`, data),
};

// API para reciclaje
export const recycleApi = {
  // Cliente
  getMyRecycleRequests: () => api.get('/recycle/my-requests'),
  createRecycleRequest: (data: any) => api.post('/recycle/request', data),
  acceptRecycleQuote: (id: string) => api.post(`/recycle/${id}/accept`),
  rejectRecycleQuote: (id: string) => api.post(`/recycle/${id}/reject`),
  
  // Admin
  getAllRecycleRequests: (status?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    return api.get(`/recycle/all?${params.toString()}`);
  },
  getRecycleById: (id: string) => api.get(`/recycle/${id}`),
  updateRecycleQuote: (id: string, data: any) => api.patch(`/recycle/${id}/quote`, data),
  updateRecycleStatus: (id: string, data: any) => api.patch(`/recycle/${id}/status`, data),
  updateEntregaInfo: (id: string, data: any) => api.patch(`/recycle/${id}/entrega`, data),
};

// API para reseñas
export const reviewsApi = {
  // Cliente
  getMyReviews: () => api.get('/reviews/my-reviews'),
  createReview: (data: any) => api.post('/reviews', data),
  updateReview: (id: string, data: any) => api.patch(`/reviews/${id}`, data),
  deleteReview: (id: string) => api.delete(`/reviews/${id}`),
  
  // Ambos
  getSellerReviews: (sellerId: number) => api.get(`/reviews/seller/${sellerId}`),
  
  // Admin
  getAllReviews: () => api.get('/reviews/all'),
  getReviewsStats: () => api.get('/reviews/stats'),
  flagReview: (id: string, reason: string) => api.post(`/reviews/${id}/flag`, { reason }),
};

// API para notificaciones
export const notificationsApi = {
  getMyNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};
