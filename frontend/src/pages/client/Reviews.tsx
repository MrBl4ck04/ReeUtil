import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Star,
  Edit2,
  Trash2,
  ShoppingBag,
  Wrench,
  Recycle as RecycleIcon,
  User,
  Calendar
} from 'lucide-react';
import { clientReviewsApi } from '../../services/clientReviewsApi';

export const Reviews: React.FC = () => {
  const [activeTab, setActiveTab] = useState('my-reviews');
  
  // Obtener mis reseñas
  const { data: myReviews, isLoading: loadingMyReviews, refetch } = useQuery('myReviews', () => clientReviewsApi.getMyReviews());

  // Mutation para eliminar
  const deleteMutation = useMutation(
    (id: string) => clientReviewsApi.deleteReview(id),
    {
      onSuccess: () => {
        refetch();
      }
    }
  );
  
  // Eliminar una reseña
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta reseña?')) {
      deleteMutation.mutate(id);
    }
  };
  
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
  
  // Obtener icono según tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'compra':
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case 'reparacion':
        return <Wrench className="h-5 w-5 text-yellow-500" />;
      case 'reciclaje':
        return <RecycleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <Star className="h-5 w-5 text-orange-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reseñas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tus reseñas y calificaciones
          </p>
        </div>
        <Link
          to="/client/resenas/nuevo"
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Reseña
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('my-reviews')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-reviews'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Mis Reseñas
          </button>
        </nav>
      </div>

      {/* Lista de reseñas */}
      {loadingMyReviews ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Cargando tus reseñas...</p>
        </div>
      ) : myReviews?.data?.length > 0 ? (
        <div className="space-y-4">
          {myReviews?.data?.map((review: any) => (
            <div key={review._id} className="card hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Icono según tipo */}
                    <div className="p-2 rounded-full bg-gray-100">
                      {getTypeIcon(review.tipo)}
                    </div>
                    
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900 mr-2">
                          {review.titulo || `Reseña de ${review.tipo}`}
                        </h3>
                        {renderStars(review.calificacion)}
                      </div>
                      
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        <span>Para: {review.destinatario.nombre}</span>
                      </div>
                      
                      <div className="mt-1 flex items-center text-xs text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{new Date(review.fecha).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-600">{review.comentario}</p>
                </div>
                
                {/* Acciones */}
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="btn-outline-danger flex items-center text-xs px-3 py-1"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </button>
                  <Link
                    to={`/client/resenas/editar/${review._id}`}
                    className="btn-outline-primary flex items-center text-xs px-3 py-1"
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Editar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <Star className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No has dejado reseñas aún</h3>
          <p className="mt-1 text-gray-500">Comparte tu experiencia con otros usuarios</p>
          <Link
            to="/client/resenas/nuevo"
            className="btn-primary mt-4 inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Crear mi primera reseña
          </Link>
        </div>
      )}
      
      {/* Información sobre reseñas */}
      <div className="card mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">¿Por qué son importantes las reseñas?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-blue-100">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Ayudas a otros usuarios</h4>
            <p className="text-sm text-gray-500">
              Tus reseñas ayudan a otros a tomar mejores decisiones
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-green-100">
                <Star className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Mejoras la calidad</h4>
            <p className="text-sm text-gray-500">
              Contribuyes a mejorar la calidad de los servicios
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-yellow-100">
                <ShoppingBag className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Construyes confianza</h4>
            <p className="text-sm text-gray-500">
              Ayudas a construir una comunidad de confianza
            </p>
          </div>
        </div>
      </div>
      
      {/* Guía de reseñas */}
      <div className="card bg-blue-50 border-blue-100">
        <h3 className="text-lg font-medium text-blue-800 mb-4">Guía para escribir buenas reseñas</h3>
        <ul className="space-y-2 text-blue-700">
          <li className="flex items-start">
            <div className="bg-blue-100 rounded-full p-1 mr-2 flex-shrink-0 mt-0.5">
              <span className="block h-4 w-4 text-center text-xs font-bold text-blue-700">1</span>
            </div>
            <span>Sé específico sobre tu experiencia</span>
          </li>
          <li className="flex items-start">
            <div className="bg-blue-100 rounded-full p-1 mr-2 flex-shrink-0 mt-0.5">
              <span className="block h-4 w-4 text-center text-xs font-bold text-blue-700">2</span>
            </div>
            <span>Menciona tanto aspectos positivos como áreas de mejora</span>
          </li>
          <li className="flex items-start">
            <div className="bg-blue-100 rounded-full p-1 mr-2 flex-shrink-0 mt-0.5">
              <span className="block h-4 w-4 text-center text-xs font-bold text-blue-700">3</span>
            </div>
            <span>Sé honesto y respetuoso</span>
          </li>
          <li className="flex items-start">
            <div className="bg-blue-100 rounded-full p-1 mr-2 flex-shrink-0 mt-0.5">
              <span className="block h-4 w-4 text-center text-xs font-bold text-blue-700">4</span>
            </div>
            <span>Incluye detalles relevantes que puedan ayudar a otros</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
