import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, ArrowLeft, Search } from 'lucide-react';
import { clientReviewsApi } from '../../services/clientReviewsApi';
import api from '../../services/api';

export const CreateReview: React.FC = () => {
  const navigate = useNavigate();
  const { vendedorId } = useParams<{ vendedorId: string }>();
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStars, setSelectedStars] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    comentario: '',
    calificacion: 0,
    tipo: 'compra',
    destinatarioId: vendedorId || '',
    ventaId: ''
  });
  const [errors, setErrors] = useState<any>({});

  // Query para buscar usuarios por nombre
  const { data: searchResults = [], isLoading: isSearching } = useQuery(
    ['searchUsers', searchQuery],
    async () => {
      if (!searchQuery.trim()) return [];
      try {
        const response = await api.get(`/auth/users/search?q=${encodeURIComponent(searchQuery)}`);
        return response.data?.data || [];
      } catch {
        return [];
      }
    },
    { enabled: searchQuery.length > 1 }
  );

  const createMutation = useMutation(
    (data: any) => clientReviewsApi.createReview(data),
    {
      onSuccess: () => {
        navigate('/client/resenas');
      },
      onError: (error: any) => {
        setErrors({
          submit: error.response?.data?.message || 'Error al crear la reseña'
        });
      }
    }
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

    if (!formData.tipo) {
      newErrors.tipo = 'Debes seleccionar el tipo de reseña';
    }

    if (!formData.destinatarioId) {
      newErrors.destinatarioId = 'Debes seleccionar a quién va dirigida la reseña';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    createMutation.mutate({
      ...formData,
      calificacion: selectedStars,
      destinatarioId: formData.destinatarioId
    });
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Nueva Reseña</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comparte tu experiencia de forma honesta y detallada
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

          {/* Tipo de reseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Reseña *
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.tipo ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona un tipo</option>
              <option value="compra">Compra</option>
              <option value="reparacion">Reparación</option>
              <option value="reciclaje">Reciclaje</option>
            </select>
            {errors.tipo && <p className="mt-1 text-sm text-red-500">{errors.tipo}</p>}
          </div>

          {/* Destinatario - Búsqueda por nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la persona *
            </label>
            <div className="relative">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5 text-gray-400 absolute left-3" />
                <input
                  type="text"
                  value={selectedUser ? selectedUser.name : searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedUser) setSelectedUser(null);
                    setShowSearchResults(true);
                    if (errors.destinatarioId) {
                      setErrors((prev: any) => ({...prev, destinatarioId: ''}));
                    }
                  }}
                  placeholder="Escribe el nombre de la persona..."
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.destinatarioId ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>

              {/* Resultados de búsqueda */}
              {showSearchResults && searchQuery.length > 1 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-3 text-center text-gray-500">Buscando...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((user: any) => (
                      <button
                        key={user._id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          setFormData(prev => ({ ...prev, destinatarioId: user._id }));
                          setSearchQuery('');
                          setShowSearchResults(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-200 last:border-b-0 transition"
                      >
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-center text-gray-500">No se encontraron resultados</div>
                  )}
                </div>
              )}
            </div>
            
            {/* Usuario seleccionado */}
            {selectedUser && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-900">{selectedUser.name}</p>
                  <p className="text-sm text-green-700">{selectedUser.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setFormData(prev => ({ ...prev, destinatarioId: '' }));
                    setSearchQuery('');
                  }}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Cambiar
                </button>
              </div>
            )}
            
            {errors.destinatarioId && <p className="mt-1 text-sm text-red-500">{errors.destinatarioId}</p>}
          </div>

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
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1">
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
            <div className="mt-4 flex justify-between px-1" style={{ width: '180px' }}>
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

          {/* Información sobre reseñas */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Consejos para una buena reseña</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Sé específico y detallado sobre tu experiencia</li>
              <li>✓ Menciona tanto lo positivo como lo que podría mejorar</li>
              <li>✓ Sé honesto y respetuoso</li>
              <li>✓ Evita lenguaje ofensivo o discriminatorio</li>
              <li>✓ Basate en hechos, no en rumores</li>
            </ul>
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
              disabled={createMutation.isLoading}
              className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isLoading ? 'Guardando...' : 'Publicar Reseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
