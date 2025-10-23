import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Tag, 
  DollarSign,
  ShoppingBag
} from 'lucide-react';
import { ventasApi } from '../../services/ventasApi';
import NuevoProductoModal from '../../components/ventas/NuevoProductoModal';

export const Sales: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Obtener productos del usuario
  const { data: myProducts, isLoading, refetch } = useQuery('myProducts', ventasApi.obtenerMisVentas);
  
  // Normalizar datos
  const productsList = myProducts?.data?.data?.ventas || [];

  // Filtrar productos por búsqueda
  const filteredProducts = productsList.filter((product: any) => 
    (product.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Eliminar un producto
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await ventasApi.eliminarVenta(id);
        refetch();
      } catch (error) {
        console.error('Error al eliminar el producto:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Productos en Venta</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona tus productos a la venta en el marketplace
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Producto
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Buscar en mis productos..."
          className="flex-1 border-none focus:ring-0 focus:outline-none text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de productos */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Cargando tus productos...</p>
        </div>
      ) : filteredProducts?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product: any) => (
            <div key={product._id} className="card hover:shadow-md transition-shadow">
              {/* Imagen del producto */}
              <div className="relative h-48 rounded-t-lg bg-gray-200 overflow-hidden">
                {product.imagen ? (
                  <img 
                    src={product.imagen} 
                    alt={product.nombre} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ShoppingBag className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium text-gray-700 shadow">
                  {product.estado || 'venta'}
                </div>
              </div>
              
              {/* Información del producto */}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">{product.nombre}</h3>
                  <div className="flex items-center text-green-600 font-semibold">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {Number(product.precio).toFixed(2)}
                  </div>
                </div>
                
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.descripcion}</p>
                
                <div className="mt-3 flex items-center">
                  <Tag className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-xs text-gray-500">{product.categoria || 'Sin categoría'}</span>
                </div>
                
                {/* Acciones */}
                <div className="mt-4 flex justify-between">
                  {/* TODO: implementar edición en otra tarea */}
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="btn-outline-danger flex items-center text-xs px-3 py-1"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No tienes productos en venta</h3>
          <p className="mt-1 text-gray-500">Comienza a vender tus productos usados en nuestro marketplace</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary mt-4 inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Publicar mi primer producto
          </button>
        </div>
      )}

      {/* Modal de nuevo producto */}
      <NuevoProductoModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => refetch()}
      />
    </div>
  );
};
