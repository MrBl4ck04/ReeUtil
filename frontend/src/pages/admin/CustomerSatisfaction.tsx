import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { Search, Star, Flag, User, Calendar, MessageCircle, CheckCircle, XCircle } from 'lucide-react';
import { adminSatisfactionApi } from '../../services/adminApi';

export const CustomerSatisfaction: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showReported, setShowReported] = useState(false);
  
  // Obtener todas las reseñas de la BD
  const { data: reviewsResponse, isLoading, refetch } = useQuery(
    'adminReviews',
    () => adminSatisfactionApi.getAllReviews(),
    { retry: 1, staleTime: 30000 }
  );

  const reviewsData = reviewsResponse?.data?.reviews || [];

  // Mutation para eliminar reseña
  const deleteMutation = useMutation(
    (id: string) => adminSatisfactionApi.deleteReview(id),
    {
      onSuccess: () => {
        refetch();
      }
    }
  );

  const handleDeleteReview = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta reseña reportada?')) {
      deleteMutation.mutate(id);
    }
  };

  // Filtrar reseñas
  const filteredReviews = reviewsData.filter((review: any) => {
    const matchesSearch = 
      review.autor?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.destinatario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comentario?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || review.tipo === filterType;
    const matchesReported = !showReported || (review.reportes && review.reportes.length > 0);
    
    return matchesSearch && matchesType && matchesReported;
  });

  // Renderizar estrellas según calificación
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  // Estadísticas generales
  const totalReviews = reviewsData.length;
  const avgRating = totalReviews > 0
    ? reviewsData.reduce((acc: number, review: any) => acc + review.calificacion, 0) / totalReviews
    : 0;
  const reportedReviews = reviewsData.filter((review: any) => review.reportes && review.reportes.length > 0).length;
  
  // Distribución de calificaciones
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating,
    count: reviewsData.filter((review: any) => review.calificacion === rating).length,
    percentage: totalReviews > 0 
      ? (reviewsData.filter((review: any) => review.calificacion === rating).length / totalReviews) * 100
      : 0
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Satisfacción del Cliente</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona las reseñas y calificaciones de los usuarios
        </p>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card bg-blue-50">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-3">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Total de Reseñas</p>
              <p className="text-2xl font-semibold text-blue-900">{totalReviews}</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-yellow-50">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-3">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">Calificación Promedio</p>
              <div className="flex items-center">
                <p className="text-2xl font-semibold text-yellow-900">{avgRating.toFixed(1)}</p>
                <div className="ml-2">{renderStars(Math.round(avgRating))}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card bg-red-50">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-3">
              <Flag className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">Reseñas Reportadas</p>
              <p className="text-2xl font-semibold text-red-900">{reportedReviews}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Distribución de calificaciones */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución de Calificaciones</h3>
        <div className="space-y-3">
          {ratingDistribution.map(item => (
            <div key={item.rating} className="flex items-center">
              <div className="w-16 text-sm font-medium text-gray-900">
                {item.rating} {item.rating === 1 ? 'estrella' : 'estrellas'}
              </div>
              <div className="flex-1 mx-4">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      item.rating >= 4 ? 'bg-green-500' : 
                      item.rating === 3 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-16 text-right text-sm text-gray-500">
                {item.count} ({item.percentage.toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar reseñas..."
            className="flex-1 border-none focus:ring-0 focus:outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <select
            className="form-select rounded-lg border-gray-200 shadow-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Todos los tipos</option>
            <option value="compra">Compras</option>
            <option value="reparacion">Reparaciones</option>
            <option value="reciclaje">Reciclaje</option>
          </select>
          
          <div className="flex items-center">
            <input
              id="show-reported"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              checked={showReported}
              onChange={(e) => setShowReported(e.target.checked)}
            />
            <label htmlFor="show-reported" className="ml-2 block text-sm text-gray-700">
              Solo reportadas
            </label>
          </div>
        </div>
      </div>

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-500">Cargando reseñas...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 card">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No hay reseñas</h3>
            <p className="mt-1 text-gray-500">No se encontraron reseñas que coincidan con los filtros</p>
          </div>
        ) : (
          filteredReviews.map((review: any) => {
            const hasReports = review.reportes && review.reportes.length > 0;
            return (
              <div key={review._id} className={`card hover:shadow-md transition-shadow ${hasReports ? 'border-l-4 border-red-500' : ''}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900 mr-2">{review.titulo}</h3>
                        {renderStars(review.calificacion)}
                      </div>
                      
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        <span>De: {review.autor?.nombre || 'Usuario'} • Para: {review.destinatario?.nombre || 'Usuario'}</span>
                      </div>
                      
                      <div className="mt-1 flex items-center text-xs text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {hasReports && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center">
                        <Flag className="h-3 w-3 mr-1" />
                        Reportada
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-gray-600">{review.comentario}</p>
                  </div>
                  
                  {hasReports && (
                    <div className="mt-3 p-2 bg-red-50 text-red-700 text-sm rounded-md">
                      <span className="font-medium">Reportes:</span> {review.reportes.map((r: any) => r.razon).join(', ')}
                    </div>
                  )}
                  
                  {/* Acciones */}
                  <div className="mt-4 flex justify-end space-x-2">
                    {hasReports && (
                      <>
                        <button 
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={deleteMutation.isLoading}
                          className="btn-outline-danger flex items-center text-xs px-3 py-1 disabled:opacity-50"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Eliminar
                        </button>
                        <button className="btn-outline-primary flex items-center text-xs px-3 py-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aprobar
                        </button>
                      </>
                    )}
                    
                    {!hasReports && (
                      <button className="btn-outline flex items-center text-xs px-3 py-1">
                        <Flag className="h-3 w-3 mr-1" />
                        Reportar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
