import React, { useState } from 'react';
import { Wrench, Search, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';

export const RepairsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Datos de ejemplo para las reparaciones
  const repairsData = [
    { 
      id: 1, 
      device: 'iPhone 11', 
      problem: 'Pantalla rota', 
      customer: 'Juan Pérez', 
      date: '2023-10-15', 
      status: 'pendiente',
      images: ['https://via.placeholder.com/150'] 
    },
    { 
      id: 2, 
      device: 'Samsung Galaxy S20', 
      problem: 'No carga la batería', 
      customer: 'María López', 
      date: '2023-10-14', 
      status: 'evaluando',
      images: ['https://via.placeholder.com/150'] 
    },
    { 
      id: 3, 
      device: 'MacBook Pro', 
      problem: 'No enciende', 
      customer: 'Carlos Rodríguez', 
      date: '2023-10-12', 
      status: 'cotizado',
      quote: { amount: 150, time: 3 },
      images: ['https://via.placeholder.com/150'] 
    },
    { 
      id: 4, 
      device: 'Lenovo ThinkPad', 
      problem: 'Teclado no funciona', 
      customer: 'Ana Martínez', 
      date: '2023-10-10', 
      status: 'en_reparacion',
      quote: { amount: 80, time: 2 },
      images: ['https://via.placeholder.com/150'] 
    },
    { 
      id: 5, 
      device: 'iPad Air', 
      problem: 'Botón home no funciona', 
      customer: 'Pedro Sánchez', 
      date: '2023-10-08', 
      status: 'completado',
      quote: { amount: 60, time: 1 },
      images: ['https://via.placeholder.com/150'] 
    },
  ];

  // Filtrar reparaciones por búsqueda y estado
  const filteredRepairs = repairsData.filter(repair => {
    const matchesSearch = 
      repair.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.problem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repair.customer.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && repair.status === statusFilter;
  });

  // Obtener color según estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'evaluando': return 'bg-blue-100 text-blue-800';
      case 'cotizado': return 'bg-purple-100 text-purple-800';
      case 'en_reparacion': return 'bg-orange-100 text-orange-800';
      case 'completado': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Obtener texto según estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'evaluando': return 'En evaluación';
      case 'cotizado': return 'Cotizado';
      case 'en_reparacion': return 'En reparación';
      case 'completado': return 'Completado';
      case 'rechazado': return 'Rechazado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Reparaciones</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administra las solicitudes de reparación de dispositivos
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <Search className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Buscar reparaciones..."
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
          <option value="pendiente">Pendientes</option>
          <option value="evaluando">En evaluación</option>
          <option value="cotizado">Cotizadas</option>
          <option value="en_reparacion">En reparación</option>
          <option value="completado">Completadas</option>
          <option value="rechazado">Rechazadas</option>
        </select>
      </div>

      {/* Lista de reparaciones */}
      <div className="space-y-4">
        {filteredRepairs.map((repair) => (
          <div key={repair.id} className="card hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {/* Icono */}
                  <div className="p-2 rounded-full bg-blue-100">
                    <Wrench className="h-5 w-5 text-blue-600" />
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">{repair.device}</h3>
                    <p className="text-sm text-gray-500 mt-1">{repair.problem}</p>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Clock className="h-4 w-4 text-gray-400 mr-1" />
                      <span>Solicitado el {repair.date}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Cliente: {repair.customer}
                    </div>
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(repair.status)}`}>
                  {getStatusText(repair.status)}
                </span>
              </div>
              
              {/* Imágenes */}
              {repair.images && repair.images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Imágenes:</h4>
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {repair.images.map((img: string, idx: number) => (
                      <div key={idx} className="h-16 w-16 rounded-md bg-gray-200 flex-shrink-0 overflow-hidden">
                        <img src={img} alt={`Imagen ${idx + 1}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Cotización */}
              {repair.quote && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Cotización:</h4>
                      <div className="flex items-center mt-1">
                        <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                        <span className="font-medium text-gray-900">{repair.quote.amount}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Tiempo estimado: {repair.quote.time} días
                      </div>
                    </div>
                    
                    {repair.status === 'cotizado' && (
                      <div className="flex space-x-2">
                        <button className="btn-outline-danger flex items-center text-xs px-3 py-1">
                          <XCircle className="h-3 w-3 mr-1" />
                          Rechazar
                        </button>
                        <button className="btn-outline-primary flex items-center text-xs px-3 py-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aprobar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Acciones */}
              <div className="mt-4 flex justify-end space-x-2">
                {repair.status === 'pendiente' && (
                  <button className="btn-primary flex items-center text-xs px-3 py-1">
                    Evaluar
                  </button>
                )}
                
                {repair.status === 'evaluando' && (
                  <button className="btn-primary flex items-center text-xs px-3 py-1">
                    Cotizar
                  </button>
                )}
                
                {repair.status === 'en_reparacion' && (
                  <button className="btn-primary flex items-center text-xs px-3 py-1">
                    Marcar como completado
                  </button>
                )}
                
                <button className="btn-outline flex items-center text-xs px-3 py-1">
                  Ver detalles
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredRepairs.length === 0 && (
          <div className="text-center py-12 card">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No hay reparaciones</h3>
            <p className="mt-1 text-gray-500">No se encontraron solicitudes de reparación que coincidan con los filtros</p>
          </div>
        )}
      </div>
    </div>
  );
};
