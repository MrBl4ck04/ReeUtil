import React, { useState } from 'react';
import { Search, ShoppingBag, DollarSign, CheckCircle, XCircle, AlertTriangle, User, Calendar, Tag } from 'lucide-react';

export const SalesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Datos de ejemplo para las ventas
  const salesData = [
    { 
      id: 1, 
      product: 'iPhone 11', 
      price: 450,
      seller: 'Juan Pérez', 
      buyer: 'María López',
      date: '2023-10-15', 
      status: 'completado',
      commission: 22.5,
      image: 'https://via.placeholder.com/150' 
    },
    { 
      id: 2, 
      product: 'Samsung Galaxy S20', 
      price: 380,
      seller: 'Carlos Rodríguez', 
      buyer: 'Ana Martínez',
      date: '2023-10-14', 
      status: 'en_proceso',
      commission: 19,
      image: 'https://via.placeholder.com/150' 
    },
    { 
      id: 3, 
      product: 'MacBook Air', 
      price: 850,
      seller: 'Pedro Sánchez', 
      buyer: 'Laura Gómez',
      date: '2023-10-12', 
      status: 'completado',
      commission: 42.5,
      image: 'https://via.placeholder.com/150' 
    },
    { 
      id: 4, 
      product: 'iPad Pro', 
      price: 650,
      seller: 'Elena Fernández', 
      buyer: 'Roberto Jiménez',
      date: '2023-10-10', 
      status: 'cancelado',
      commission: 0,
      image: 'https://via.placeholder.com/150' 
    },
    { 
      id: 5, 
      product: 'AirPods Pro', 
      price: 180,
      seller: 'Miguel Torres', 
      buyer: 'Carmen Vázquez',
      date: '2023-10-08', 
      status: 'completado',
      commission: 9,
      image: 'https://via.placeholder.com/150' 
    },
  ];

  // Filtrar ventas por búsqueda y estado
  const filteredSales = salesData.filter(sale => {
    const matchesSearch = 
      sale.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.buyer.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && sale.status === statusFilter;
  });

  // Obtener color según estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completado': return 'bg-green-100 text-green-800';
      case 'en_proceso': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Obtener texto según estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completado': return 'Completado';
      case 'en_proceso': return 'En proceso';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Administrar Ventas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona las ventas realizadas en el marketplace
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar ventas..."
            className="flex-1 border-none focus:ring-0 focus:outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          className="form-select rounded-lg border-gray-200 shadow-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="en_proceso">En proceso</option>
          <option value="completado">Completadas</option>
          <option value="cancelado">Canceladas</option>
        </select>
      </div>

      {/* Resumen de ventas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card bg-blue-50">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-3">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Total de Ventas</p>
              <p className="text-2xl font-semibold text-blue-900">247</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-green-50">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Ingresos por Comisiones</p>
              <p className="text-2xl font-semibold text-green-900">$1,258</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-yellow-50">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">Ventas Pendientes</p>
              <p className="text-2xl font-semibold text-yellow-900">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de ventas */}
      <div className="overflow-x-auto card">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendedor / Comprador
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio / Comisión
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSales.map((sale) => (
              <tr key={sale.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img src={sale.image} alt={sale.product} className="h-10 w-10 rounded-md object-cover" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{sale.product}</div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {sale.date}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <User className="h-4 w-4 text-gray-400 mr-1" />
                      <span>Vendedor: {sale.seller}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 text-gray-400 mr-1" />
                      <span>Comprador: {sale.buyer}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center text-sm text-gray-900">
                      <Tag className="h-4 w-4 text-gray-400 mr-1" />
                      <span>Precio: ${sale.price}</span>
                    </div>
                    <div className="flex items-center text-sm text-green-600">
                      <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                      <span>Comisión: ${sale.commission}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sale.status)}`}>
                    {getStatusText(sale.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {sale.status === 'en_proceso' && (
                      <>
                        <button className="text-red-600 hover:text-red-900">
                          <XCircle className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button className="text-primary-600 hover:text-primary-900">
                      Ver detalles
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredSales.length === 0 && (
          <div className="text-center py-8">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No hay ventas</h3>
            <p className="mt-1 text-gray-500">No se encontraron ventas que coincidan con los filtros</p>
          </div>
        )}
      </div>
    </div>
  );
};
