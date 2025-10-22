import React, { useState } from 'react';
import { Settings, Plus, Edit2, Trash2, Search } from 'lucide-react';

export const RulesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Datos de ejemplo para las reglas
  const rulesData = [
    { id: 1, name: 'Dispositivos Android', description: 'No se aceptan dispositivos con Android menor a 4.0', active: true },
    { id: 2, name: 'Baterías', description: 'No se aceptan dispositivos con baterías hinchadas o dañadas', active: true },
    { id: 3, name: 'Pantallas', description: 'Dispositivos con pantalla rota tienen una reducción del 30% en su valor', active: true },
    { id: 4, name: 'Dispositivos Apple', description: 'Dispositivos Apple deben tener iCloud desactivado', active: true },
    { id: 5, name: 'Accesorios', description: 'Dispositivos con accesorios originales tienen un 10% adicional en su valor', active: false },
  ];

  // Filtrar reglas por búsqueda
  const filteredRules = rulesData.filter(rule =>
    rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rule.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Reglas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra las reglas del sistema para evaluación de dispositivos
          </p>
        </div>
        <button
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Regla
        </button>
      </div>

      {/* Buscador */}
      <div className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
        <Search className="h-5 w-5 text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Buscar reglas..."
          className="flex-1 border-none focus:ring-0 focus:outline-none text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Lista de reglas */}
      <div className="overflow-x-auto card">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Descripción
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
            {filteredRules.map((rule) => (
              <tr key={rule.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-lg">
                      <Settings className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{rule.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{rule.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    rule.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {rule.active ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      className="text-primary-600 hover:text-primary-900"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
