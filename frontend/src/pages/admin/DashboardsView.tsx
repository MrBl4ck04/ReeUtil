import React, { useState } from 'react';
import { BarChart2, PieChart, LineChart, Calendar, DollarSign, ShoppingBag, ShoppingCart, Users, Recycle as RecycleIcon } from 'lucide-react';

export const DashboardsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  
  // Datos de ejemplo para las estadísticas
  const stats = [
    {
      name: 'Ventas Totales',
      value: 247,
      change: '+12%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Ingresos',
      value: '$12,580',
      change: '+8%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Usuarios Activos',
      value: 1358,
      change: '+5%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Dispositivos Reciclados',
      value: 132,
      change: '+18%',
      trend: 'up',
      icon: RecycleIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboards</h1>
          <p className="mt-1 text-sm text-gray-500">
            Visualiza estadísticas y métricas del sistema
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'week'
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'month'
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setTimeRange('year')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'year'
                ? 'bg-primary-100 text-primary-700 font-medium'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            Año
          </button>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <span className={`ml-2 text-xs font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de ventas */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Ventas por Categoría</h3>
            <div className="flex items-center text-gray-500">
              <BarChart2 className="h-5 w-5 mr-1" />
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Gráfico de barras aquí</p>
          </div>
        </div>
        
        {/* Gráfico de ingresos */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Ingresos Mensuales</h3>
            <div className="flex items-center text-gray-500">
              <LineChart className="h-5 w-5 mr-1" />
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Gráfico de líneas aquí</p>
          </div>
        </div>
        
        {/* Gráfico de dispositivos */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Dispositivos por Tipo</h3>
            <div className="flex items-center text-gray-500">
              <PieChart className="h-5 w-5 mr-1" />
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Gráfico circular aquí</p>
          </div>
        </div>
        
        {/* Calendario de actividades */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
            <div className="flex items-center text-gray-500">
              <Calendar className="h-5 w-5 mr-1" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="p-2 rounded-full bg-blue-100 mr-3">
                <ShoppingBag className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Nueva venta: iPhone 12</p>
                <p className="text-xs text-gray-500">Hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="p-2 rounded-full bg-green-100 mr-3">
                <RecycleIcon className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Dispositivo reciclado: Samsung Galaxy S10</p>
                <p className="text-xs text-gray-500">Hace 3 horas</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="p-2 rounded-full bg-purple-100 mr-3">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Nuevo usuario registrado: María López</p>
                <p className="text-xs text-gray-500">Hace 5 horas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabla de resumen */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Ventas</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ventas
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingresos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">iPhone 12</td>
                <td className="px-6 py-4 whitespace-nowrap">Smartphones</td>
                <td className="px-6 py-4 whitespace-nowrap">45</td>
                <td className="px-6 py-4 whitespace-nowrap">$31,500</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Samsung Galaxy S21</td>
                <td className="px-6 py-4 whitespace-nowrap">Smartphones</td>
                <td className="px-6 py-4 whitespace-nowrap">38</td>
                <td className="px-6 py-4 whitespace-nowrap">$26,600</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">MacBook Pro</td>
                <td className="px-6 py-4 whitespace-nowrap">Laptops</td>
                <td className="px-6 py-4 whitespace-nowrap">22</td>
                <td className="px-6 py-4 whitespace-nowrap">$44,000</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">Dell XPS 13</td>
                <td className="px-6 py-4 whitespace-nowrap">Laptops</td>
                <td className="px-6 py-4 whitespace-nowrap">18</td>
                <td className="px-6 py-4 whitespace-nowrap">$27,000</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">iPad Pro</td>
                <td className="px-6 py-4 whitespace-nowrap">Tablets</td>
                <td className="px-6 py-4 whitespace-nowrap">29</td>
                <td className="px-6 py-4 whitespace-nowrap">$23,200</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
