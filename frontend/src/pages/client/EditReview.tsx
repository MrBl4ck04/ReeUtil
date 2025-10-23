import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, ArrowLeft } from 'lucide-react';
import { clientReviewsApi } from '../../services/clientReviewsApi';

export const EditReview: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStars, setSelectedStars] = useState(0);
  const [formData, setFormData] = useState({
    titulo: '',
    comentario: '',
    calificacion: 0
  });
  const [errors, setErrors] = useState<any>({});

  // Obtener la reseña actual (simulado por ahora)
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Aquí iría la lógica para obtener la reseña
    // Por ahora asumimos que viene del estado
    setIsLoading(false);
  }, []);

  const updateMutation = useMutation(
    (data: any) => clientReviewsApi.updateReview(id || '', data),
    {
      onSuccess: () => {
        navigate('/client/resenas');
      },
      onError: (error: any) => {
        setErrors({
          submit: error.response?.data?.message || 'Error al actualizar la reseña'
        });
      }
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    } else if (formData.titulo.length > 100) {
      newErrors.titulo = 'El título no debe exceder 100 caracteres';
    }

    if (!formData.comentario.trim()) {
      newErrors.comentario = 'El comentario es requerido';
    } else if (formData.comentario.length < 10) {
      newErrors.comentario = 'El comentario debe tener al menos 10 caracteres';
    } else if (formData.comentario.length > 1000) {
      newErrors.comentario = 'El comentario no debe exceder 1000 caracteres';
    }

    if (selectedStars === 0) {
      newErrors.calificacion = 'Debes seleccionar una calificación';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    updateMutation.mutate({
      titulo: formData.titulo,
      comentario: formData.comentario,
      calificacion: selectedStars
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-500">Cargando reseña...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate('/client/resenas')}
          className="flex items-center text-primary-600 hover:text-primary-700 mr-4"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Reseña</h1>
          <p className="mt-1 text-sm text-gray-500">
            Actualiza tu reseña cuando lo necesites
          </p>
        </div>
      </div>

      {/* Formulario */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Error general */}
          {errors.submit && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
              {errors.submit}
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título de la Reseña *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Ej: Excelente servicio de reparación"
              maxLength={100}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.titulo ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="mt-1 flex justify-between">
              {errors.titulo && <p className="text-sm text-red-500">{errors.titulo}</p>}
              <p className="text-xs text-gray-500">{formData.titulo.length}/100</p>
            </div>
          </div>

          {/* Calificación con estrellas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Calificación *
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setSelectedStars(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredStar || selectedStars)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-lg font-semibold text-gray-700">
                {selectedStars > 0 ? `${selectedStars} / 5` : 'Selecciona una calificación'}
              </span>
            </div>
            {errors.calificacion && <p className="mt-2 text-sm text-red-500">{errors.calificacion}</p>}
            
            {/* Etiquetas descriptivas */}
            <div className="mt-3 grid grid-cols-5 gap-2">
              <div className="text-center">
                <p className="text-xs text-gray-600">Muy Malo</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Malo</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Aceptable</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Bueno</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600">Excelente</p>
              </div>
            </div>
          </div>

          {/* Comentario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario Detallado *
            </label>
            <textarea
              name="comentario"
              value={formData.comentario}
              onChange={handleInputChange}
              placeholder="Describe tu experiencia con los detalles. Sé específico sobre qué estuvo bien y qué podría mejorar..."
              maxLength={1000}
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.comentario ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="mt-1 flex justify-between">
              {errors.comentario && <p className="text-sm text-red-500">{errors.comentario}</p>}
              <p className="text-xs text-gray-500">{formData.comentario.length}/1000</p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-4 justify-end">
            <button
              type="button"
              onClick={() => navigate('/client/resenas')}
              className="btn-outline px-6 py-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updateMutation.isLoading}
              className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isLoading ? 'Guardando...' : 'Actualizar Reseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
