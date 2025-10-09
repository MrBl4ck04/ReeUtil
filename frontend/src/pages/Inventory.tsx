import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Search, 
  Filter,
  Archive,
  Package,
  Recycle,
  DollarSign
} from 'lucide-react';
import { inventoryApi, catalogApi } from '../services/api';

interface InventoryItem {
  idCatalogo: number;
  nombre: string;
  marca: string;
  tipo: string;
  idDispositivo: number;
  estadoCotizaci: string;
}

export const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const { data: inventory, isLoading } = useQuery(
    ['inventory', filterType, filterStatus],
    () => inventoryApi.getInventory(filterType, filterStatus)
  );
  const { data: types } = useQuery('catalogTypes', catalogApi.getTypes);

  const filteredInventory = inventory?.data?.filter((item: InventoryItem) => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.marca.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Para reciclar':
        return 'bg-green-100 text-green-800';
      case 'Para vender':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Para reciclar':
        return <Recycle className="h-4 w-4" />;
      case 'Para vender':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        <p className="mt-1 text-sm text-gray-500">
          Dispositivos listos para reciclar o vender
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar dispositivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input"
            >
              <option value="">Todos los tipos</option>
              {types?.data?.map((type: string) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="">Todos los estados</option>
              <option value="Para reciclar">Para reciclar</option>
              <option value="Para vender">Para vender</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-100">
              <Recycle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Para Reciclar</p>
              <p className="text-2xl font-semibold text-gray-900">
                {inventory?.data?.filter((item: InventoryItem) => item.estadoCotizaci === 'Para reciclar').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-100">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Para Vender</p>
              <p className="text-2xl font-semibold text-gray-900">
                {inventory?.data?.filter((item: InventoryItem) => item.estadoCotizaci === 'Para vender').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-purple-100">
              <Archive className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {inventory?.data?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID Catálogo</th>
                <th>Dispositivo</th>
                <th>Marca</th>
                <th>Tipo</th>
                <th>ID Dispositivo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory?.map((item: InventoryItem, index: number) => (
                <tr key={`${item.idCatalogo}-${item.idDispositivo}-${index}`}>
                  <td className="font-medium">#{item.idCatalogo}</td>
                  <td className="font-medium">{item.nombre}</td>
                  <td>{item.marca}</td>
                  <td>{item.tipo}</td>
                  <td className="font-medium">#{item.idDispositivo}</td>
                  <td>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.estadoCotizaci)}`}>
                      {getStatusIcon(item.estadoCotizaci)}
                      <span className="ml-1">{item.estadoCotizaci}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredInventory?.length === 0 && (
        <div className="text-center py-12">
          <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron dispositivos</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
};
