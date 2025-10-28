import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Search, ShoppingBag, DollarSign, CheckCircle, XCircle, AlertTriangle, User, Calendar, Tag, Trash2, Eye } from 'lucide-react';
import { ventasApi } from '../../services/ventasApi';
import toast from 'react-hot-toast';

export const SalesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Obtener todas las ventas usando useQuery
  const { data: allSales, isLoading, refetch } = useQuery('allSales', ventasApi.obtenerVentas);
  
  // Normalizar datos
  const salesList = allSales?.data?.data?.ventas || [];
  
  // Filtrar ventas por búsqueda y estado
  const filteredSales = salesList.filter((sale: any) => {
    const matchesSearch = 
      (sale.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.usuario?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Por defecto ("all"), solo mostrar ventas habilitadas
    if (statusFilter === 'all') return matchesSearch && (sale.estadoAdmin === 'habilitado' || !sale.estadoAdmin);
    return matchesSearch && sale.estadoAdmin === statusFilter;
  });

  // Función para deshabilitar una venta
  const handleDisableSale = async (saleId: string) => {
    if (window.confirm('¿Estás seguro de que deseas deshabilitar esta venta?')) {
      try {
        // Usar endpoint específico de admin para deshabilitar
        await ventasApi.deshabilitarVenta(saleId);
        toast.success('Venta deshabilitada correctamente');
        refetch();
      } catch (error: any) {
        console.error('Error al deshabilitar la venta:', error);
        toast.error(error?.response?.data?.message || 'Error al deshabilitar la venta');
      }
    }
  };

  // Función para habilitar una venta
  const handleEnableSale = async (saleId: string) => {
    if (window.confirm('¿Estás seguro de que deseas habilitar esta venta?')) {
      try {
        // Usar endpoint específico de admin para habilitar
        await ventasApi.habilitarVenta(saleId);
        toast.success('Venta habilitada correctamente');
        refetch();
      } catch (error: any) {
        console.error('Error al habilitar la venta:', error);
        toast.error(error?.response?.data?.message || 'Error al habilitar la venta');
      }
    }
  };

  // Obtener color según estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'comprado': return 'bg-green-100 text-green-800';
      case 'venta': return 'bg-blue-100 text-blue-800';
      case 'disponible': return 'bg-blue-100 text-blue-800';
      case 'vendido': return 'bg-green-100 text-green-800';
      case 'pausado': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Obtener texto según estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'comprado': return 'Comprado';
      case 'venta': return 'En venta';
      case 'disponible': return 'Disponible';
      case 'vendido': return 'Vendido';
      case 'pausado': return 'Pausado';
      default: return status;
    }
  };

  // Obtener color según estado de administración
  const getAdminStatusColor = (estadoAdmin: string) => {
    switch (estadoAdmin) {
      case 'habilitado': return 'bg-green-100 text-green-800';
      case 'deshabilitado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener texto según estado de administración
  const getAdminStatusText = (estadoAdmin: string) => {
    switch (estadoAdmin) {
      case 'habilitado': return 'Habilitado';
      case 'deshabilitado': return 'Deshabilitado';
      default: return estadoAdmin;
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // Calcular comisión (5% del precio)
  const calculateCommission = (price: number) => {
    return Math.round(price * 0.05 * 100) / 100;
  };

  // Calcular estadísticas
  const totalVentas = salesList.filter((sale: any) => sale.estadoAdmin === 'habilitado').length;
  const ventasDeshabilitadas = salesList.filter((sale: any) => sale.estadoAdmin === 'deshabilitado').length;
  const ventasCompletadas = salesList.filter((sale: any) => sale.estado === 'comprado' && sale.estadoAdmin === 'habilitado').length;
  const ingresosComisiones = salesList
    .filter((sale: any) => sale.estado === 'comprado' && sale.estadoAdmin === 'habilitado')
    .reduce((total: number, sale: any) => total + calculateCommission(sale.precio), 0);

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
          <option value="habilitado">Habilitadas</option>
          <option value="deshabilitado">Deshabilitadas</option>
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
              <p className="text-2xl font-semibold text-blue-900">{totalVentas}</p>
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
              <p className="text-2xl font-semibold text-green-900">${ingresosComisiones.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-yellow-50">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">Ventas Deshabilitadas</p>
              <p className="text-2xl font-semibold text-yellow-900">{ventasDeshabilitadas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de ventas */}
      <div className="overflow-x-auto card">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-500">Cargando ventas...</p>
          </div>
        ) : filteredSales?.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendedor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio / Comisión
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Admin
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale: any) => (
                <tr key={sale._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{sale.nombre}</div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(sale.fechaCreacion)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <User className="h-4 w-4 text-gray-400 mr-1" />
                      <span>{sale.usuario?.name || 'Sin nombre'}</span>
                    </div>
                    <div className="text-xs text-gray-500">{sale.usuario?.email || 'Sin email'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Tag className="h-4 w-4 text-gray-400 mr-1" />
                        <span>Precio: ${sale.precio}</span>
                      </div>
                      <div className="flex items-center text-sm text-green-600">
                        <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                        <span>Comisión: ${calculateCommission(sale.precio)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(sale.estado)}`}>
                      {getStatusText(sale.estado)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getAdminStatusColor(sale.estadoAdmin || 'habilitado')}`}>
                      {getAdminStatusText(sale.estadoAdmin || 'habilitado')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {(sale.estadoAdmin || 'habilitado') === 'habilitado' ? (
                        <button 
                          onClick={() => handleDisableSale(sale._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Deshabilitar venta"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleEnableSale(sale._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Habilitar venta"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
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
