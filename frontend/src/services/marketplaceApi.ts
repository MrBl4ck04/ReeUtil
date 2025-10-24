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
  getRepairById: (id: string) => api.get(`/repairs/${id}`),
  
  // Admin
  getAllRepairRequests: (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.search) params.append('search', filters.search);
    return api.get(`/repairs/all?${params.toString()}`);
  },
  updateRepairQuote: (id: string, data: any) => api.patch(`/repairs/${id}/quote`, data),
  updateRepairStatus: (id: string, data: any) => api.patch(`/repairs/${id}/status`, data),
  evaluateRepair: (id: string) => api.post(`/repairs/${id}/evaluate`),
  rejectRepairAdmin: (id: string) => api.post(`/repairs/${id}/reject-admin`),
  completeRepair: (id: string, data?: any) => api.post(`/repairs/${id}/complete`, data || {}),
};

// API para reciclaje
export const recycleApi = {
  // Cliente
  getMyRecycleRequests: () => api.get('/recycle/my-requests'),
  createRecycleRequest: (data: any) => api.post('/recycle/request', data),
  acceptRecycleQuote: (id: string) => api.post(`/recycle/${id}/accept`),
  rejectRecycleQuote: (id: string) => api.post(`/recycle/${id}/reject`),
  getRecycleById: (id: string) => api.get(`/recycle/${id}`),
  
  // Admin
  getAllRecycleRequests: (filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.search) params.append('search', filters.search);
    return api.get(`/recycle/all?${params.toString()}`);
  },
  updateRecycleQuote: (id: string, data: any) => api.patch(`/recycle/${id}/quote`, data),
  updateRecycleStatus: (id: string, data: any) => api.patch(`/recycle/${id}/status`, data),
  evaluateRecycle: (id: string) => api.post(`/recycle/${id}/evaluate`),
  rejectRecycleAdmin: (id: string) => api.post(`/recycle/${id}/reject-admin`),
  completeRecycle: (id: string, data?: any) => api.post(`/recycle/${id}/complete`, data || {}),
};

// API para reseñas
export const reviewsApi = {
  // Cliente
  getMyReviews: () => api.get('/api/reviews/my-reviews'),
  createReview: (data: any) => api.post('/api/reviews', data),
  updateReview: (id: string, data: any) => api.patch(`/api/reviews/${id}`, data),
  deleteReview: (id: string) => api.delete(`/api/reviews/${id}`),
  
  // Ambos
  getSellerReviews: (sellerId: string) => api.get(`/api/reviews/seller/${sellerId}`),
  
  // Admin
  getAllReviews: () => api.get('/api/reviews/all'),
  getReviewsStats: () => api.get('/api/reviews/stats'),
  flagReview: (id: string, reason: string) => api.post(`/api/reviews/${id}/flag`, { reason }),
};

// API para notificaciones
export const notificationsApi = {
  getMyNotifications: () => api.get('/notifications'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};
