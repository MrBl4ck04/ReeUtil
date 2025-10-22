import React, { useState } from 'react';
import { Search, Star, Flag, User, Calendar, MessageCircle, CheckCircle, XCircle } from 'lucide-react';

export const CustomerSatisfaction: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showReported, setShowReported] = useState(false);
  
  // Datos de ejemplo para las reseñas
  const reviewsData = [
    { 
      id: 1, 
      author: 'Juan Pérez',
      recipient: 'María López',
      type: 'compra',
      rating: 5,
      title: 'Excelente vendedor',
      comment: 'Muy buen trato, el producto llegó en perfectas condiciones y antes de lo esperado.',
      date: '2023-10-15',
      reported: false
    },
    { 
      id: 2, 
      author: 'Carlos Rodríguez',
      recipient: 'Ana Martínez',
      type: 'reparacion',
      rating: 4,
      title: 'Buen servicio de reparación',
      comment: 'Repararon mi teléfono rápidamente y a buen precio. Le quito una estrella porque tardaron un poco en responder al principio.',
      date: '2023-10-14',
      reported: false
    },
    { 
      id: 3, 
      author: 'Pedro Sánchez',
      recipient: 'Laura Gómez',
      type: 'compra',
      rating: 2,
      title: 'Producto en mal estado',
      comment: 'El producto no estaba en las condiciones descritas. Tenía varios arañazos que no se mencionaban en la descripción.',
      date: '2023-10-12',
      reported: true,
      reportReason: 'Información falsa'
    },
    { 
      id: 4, 
      author: 'Elena Fernández',
      recipient: 'Roberto Jiménez',
      type: 'reciclaje',
      rating: 5,
      title: 'Muy buena compensación',
      comment: 'Me ofrecieron un precio justo por mi dispositivo antiguo. El proceso fue muy sencillo y rápido.',
      date: '2023-10-10',
      reported: false
    },
    { 
      id: 5, 
      author: 'Miguel Torres',
      recipient: 'Carmen Vázquez',
      type: 'compra',
      rating: 1,
      title: 'Pésima experiencia',
      comment: 'Nunca recibí el producto y el vendedor no responde a mis mensajes. Muy mala experiencia.',
      date: '2023-10-08',
      reported: true,
      reportReason: 'Contenido ofensivo'
    },
  ];

  // Filtrar reseñas
  const filteredReviews = reviewsData.filter(review => {
    const matchesSearch = 
      review.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || review.type === filterType;
    const matchesReported = !showReported || review.reported;
    
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
  const avgRating = reviewsData.reduce((acc, review) => acc + review.rating, 0) / totalReviews;
  const reportedReviews = reviewsData.filter(review => review.reported).length;
  
  // Distribución de calificaciones
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating,
    count: reviewsData.filter(review => review.rating === rating).length,
    percentage: (reviewsData.filter(review => review.rating === rating).length / totalReviews) * 100
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
        {filteredReviews.map((review) => (
          <div key={review.id} className={`card hover:shadow-md transition-shadow ${review.reported ? 'border-l-4 border-red-500' : ''}`}>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-900 mr-2">{review.title}</h3>
                    {renderStars(review.rating)}
                  </div>
                  
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-1" />
                    <span>De: {review.author} • Para: {review.recipient}</span>
                  </div>
                  
                  <div className="mt-1 flex items-center text-xs text-gray-400">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{review.date}</span>
                  </div>
                </div>
                
                {review.reported && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full flex items-center">
                    <Flag className="h-3 w-3 mr-1" />
                    Reportada
                  </span>
                )}
              </div>
              
              <div className="mt-4">
                <p className="text-gray-600">{review.comment}</p>
              </div>
              
              {review.reported && (
                <div className="mt-3 p-2 bg-red-50 text-red-700 text-sm rounded-md">
                  <span className="font-medium">Motivo del reporte:</span> {review.reportReason}
                </div>
              )}
              
              {/* Acciones */}
              <div className="mt-4 flex justify-end space-x-2">
                {review.reported && (
                  <>
                    <button className="btn-outline-danger flex items-center text-xs px-3 py-1">
                      <XCircle className="h-3 w-3 mr-1" />
                      Eliminar
                    </button>
                    <button className="btn-outline-primary flex items-center text-xs px-3 py-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aprobar
                    </button>
                  </>
                )}
                
                {!review.reported && (
                  <button className="btn-outline flex items-center text-xs px-3 py-1">
                    <Flag className="h-3 w-3 mr-1" />
                    Reportar
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {filteredReviews.length === 0 && (
          <div className="text-center py-12 card">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No hay reseñas</h3>
            <p className="mt-1 text-gray-500">No se encontraron reseñas que coincidan con los filtros</p>
          </div>
        )}
      </div>
    </div>
  );
};
