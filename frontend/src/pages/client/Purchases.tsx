import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Search, 
  Filter,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  Star,
  User,
  Tag
} from 'lucide-react';
import { marketplaceApi } from '../../services/marketplaceApi';

export const Purchases: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categoria: '',
    precioMin: '',
    precioMax: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Obtener productos disponibles (excluyendo los propios)
  const { data: availableProducts, isLoading } = useQuery(['availableProducts', filters], () => 
    marketplaceApi.getAllProducts({
      categoria: filters.categoria || undefined,
      precioMin: filters.precioMin || undefined,
      precioMax: filters.precioMax || undefined,
    })
  );
  
  // Obtener historial de compras
  const { data: myPurchases } = useQuery('myPurchases', marketplaceApi.getMyPurchases);
  
  // Filtrar productos por búsqueda
  const filteredProducts = availableProducts?.data?.filter((product: any) => 
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Manejar compra de producto
  const handlePurchase = async (productId: string) => {
    if (window.confirm('¿Estás seguro de que deseas comprar este producto?')) {
      try {
        await marketplaceApi.purchaseProduct(productId);
        // Simular el pago
        await marketplaceApi.simulatePayment({
          productId,
          paymentMethod: 'credit_card',
          amount: filteredProducts.find((p: any) => p._id === productId).precio
        });
        
        // Recargar los datos
        window.location.reload();
      } catch (error) {
        console.error('Error al comprar el producto:', error);
      }
    }
  };
  
  // Categorías disponibles (ejemplo)
  const categorias = [
    'Electrónicos', 'Computadoras', 'Celulares', 'Tablets', 
    'Accesorios', 'Componentes', 'Otros'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comprar Productos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Explora productos disponibles en nuestro marketplace
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-outline flex items-center"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </button>
      </div>

      {/* Buscador y filtros */}
      <div className="space-y-4">
        <div className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar productos..."
            className="flex-1 border-none focus:ring-0 focus:outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {showFilters && (
          <div className="card">
            <h3 className="font-medium text-gray-900 mb-3">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  className="form-select w-full"
                  value={filters.categoria}
                  onChange={(e) => setFilters({...filters, categoria: e.target.value})}
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio mínimo
                </label>
                <input
                  type="number"
                  className="form-input w-full"
                  placeholder="0"
                  value={filters.precioMin}
                  onChange={(e) => setFilters({...filters, precioMin: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio máximo
                </label>
                <input
                  type="number"
                  className="form-input w-full"
                  placeholder="10000"
                  value={filters.precioMax}
                  onChange={(e) => setFilters({...filters, precioMax: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setFilters({categoria: '', precioMin: '', precioMax: ''})}
                className="btn-outline mr-2"
              >
                Limpiar
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="btn-primary"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de productos */}
      <h2 className="text-xl font-semibold text-gray-900">Productos disponibles</h2>
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Cargando productos...</p>
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
              </div>
              
              {/* Información del producto */}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900">{product.nombre}</h3>
                  <div className="flex items-center text-green-600 font-semibold">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {product.precio.toFixed(2)}
                  </div>
                </div>
                
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.descripcion}</p>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">{product.categoria}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">{product.vendedor.nombre}</span>
                  </div>
                </div>
                
                <div className="mt-2 flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        className={`h-4 w-4 ${i < (product.vendedor.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500 ml-1">
                    ({product.vendedor.totalReviews || 0} reseñas)
                  </span>
                </div>
                
                {/* Botón de compra */}
                <button
                  onClick={() => handlePurchase(product._id)}
                  className="mt-4 w-full btn-primary flex items-center justify-center"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Comprar ahora
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No hay productos disponibles</h3>
          <p className="mt-1 text-gray-500">No se encontraron productos que coincidan con tu búsqueda</p>
        </div>
      )}
      
      {/* Historial de compras */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Mi historial de compras</h2>
        
        {myPurchases?.data?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendedor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myPurchases?.data?.map((purchase: any) => (
                  <tr key={purchase._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 mr-3">
                          {purchase.producto.imagen ? (
                            <img 
                              src={purchase.producto.imagen} 
                              alt={purchase.producto.nombre}
                              className="h-10 w-10 rounded-full object-cover" 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <ShoppingBag className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {purchase.producto.nombre}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{purchase.vendedor.nombre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${purchase.precio.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(purchase.fecha).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        purchase.estado === 'completado' 
                          ? 'bg-green-100 text-green-800' 
                          : purchase.estado === 'en proceso'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {purchase.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 card">
            <ShoppingCart className="h-10 w-10 text-gray-400 mx-auto" />
            <p className="mt-2 text-gray-500">Aún no has realizado ninguna compra</p>
          </div>
        )}
      </div>
    </div>
  );
};
