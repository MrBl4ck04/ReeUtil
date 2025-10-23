import React, { useState } from 'react';
import { BarChart2, PieChart, LineChart, Calendar, DollarSign, ShoppingBag, ShoppingCart, Users, Recycle as RecycleIcon } from 'lucide-react';
import { useQuery } from 'react-query';
import { ventasApi } from '../../services/ventasApi';

export const DashboardsView: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  
  // Datos en tiempo real desde backend (refresca cada 5s)
  const { data: dashboardData, isLoading, error } = useQuery('ventasDashboard', ventasApi.obtenerEstadisticasDashboard, {
    refetchInterval: 5000,
    retry: 3,
    onError: (err) => console.error('Error al cargar datos del dashboard:', err),
    staleTime: 2000
  });

  // Extraer datos del dashboard con manejo de valores nulos
  console.log('Dashboard data:', dashboardData); // Para depuración
  
  // Acceso correcto a la estructura de datos
  const responseData = dashboardData?.data;
  const dashboard = responseData?.data || {};
  
  // Extraer datos específicos con manejo de valores nulos
  const resumen = dashboard?.resumenVentas || {
    totalVentas: 0,
    totalCompradas: 0,
    totalDisponibles: 0,
    totalPausadas: 0,
    ingresoTotal: 0
  };
  
  const ventasPorCategoria = dashboard?.ventasPorCategoria || [];
  const ingresosMensuales = dashboard?.ingresosMensuales || [];
  const dispositivosPorTipo = dashboard?.dispositivosPorTipo || [];
  const actividadReciente = dashboard?.actividadReciente || [];
  
  // Verificar si tenemos datos válidos
  const tieneDataValida = dashboard && Object.keys(dashboard).length > 0;

  // Estadísticas principales derivadas de la base de datos
  const stats = [
    {
      name: 'Ventas Totales',
      value: resumen?.totalVentas ?? 0,
      change: '',
      trend: 'up',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Ingresos',
      value: `$${(resumen?.ingresoTotal ?? 0).toLocaleString()}`,
      change: '',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Compras Realizadas',
      value: resumen?.totalCompradas ?? 0,
      change: '',
      trend: 'up',
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Disponibles',
      value: resumen?.totalDisponibles ?? 0,
      change: '',
      trend: 'up',
      icon: ShoppingBag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
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
          <div className="h-64 bg-gray-50 rounded-lg p-4 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40 text-gray-500">
                Cargando datos...
              </div>
            ) : ventasPorCategoria.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-500">
                Sin datos disponibles
              </div>
            ) : (
              <div className="space-y-2">
                {(() => {
                  const max = Math.max(...ventasPorCategoria.map((c: any) => c.totalVentas || 0));
                  return ventasPorCategoria.map((cat: any) => (
                    <div key={cat.categoria} className="flex items-center">
                      <span className="w-28 text-sm text-gray-600 capitalize">{cat.categoria}</span>
                      <div className="flex-1 h-3 bg-gray-200 rounded">
                        <div
                          className="h-3 bg-blue-500 rounded"
                          style={{ width: `${Math.round(((cat.totalVentas / (max || 1)) * 100))}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm text-gray-700">{cat.totalVentas}</span>
                    </div>
                  ));
                })()}
              </div>
            )}
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
          <div className="h-64 bg-gray-50 rounded-lg p-4 overflow-y-auto">
            {isLoading ? (
              <p className="text-gray-500">Cargando datos...</p>
            ) : ingresosMensuales.length === 0 ? (
              <p className="text-gray-500">Sin datos</p>
            ) : (
              <div className="space-y-2">
                {(() => {
                  const maxIng = Math.max(...ingresosMensuales.map((m: any) => m.totalIngresos || 0));
                  return ingresosMensuales.map((m: any) => (
                    <div key={`${m.year}-${m.month}`} className="flex items-center">
                      <span className="w-20 text-sm text-gray-600">{String(m.month).padStart(2,'0')}/{m.year}</span>
                      <div className="flex-1 h-3 bg-gray-200 rounded">
                        <div
                          className="h-3 bg-green-500 rounded"
                          style={{ width: `${Math.round(((m.totalIngresos / (maxIng || 1)) * 100))}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm text-gray-700">${m.totalIngresos}</span>
                    </div>
                  ));
                })()}
              </div>
            )}
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
          <div className="h-64 bg-gray-50 rounded-lg p-4 overflow-y-auto">
            {isLoading ? (
              <p className="text-gray-500">Cargando datos...</p>
            ) : dispositivosPorTipo.length === 0 ? (
              <p className="text-gray-500">Sin datos</p>
            ) : (
              <div className="space-y-2">
                {(() => {
                  const maxDisp = Math.max(...dispositivosPorTipo.map((d: any) => d.total || 0));
                  return dispositivosPorTipo.map((tipo: any) => (
                    <div key={tipo.tipo} className="flex items-center">
                      <span className="w-28 text-sm text-gray-600 capitalize">{tipo.tipo}</span>
                      <div className="flex-1 h-3 bg-gray-200 rounded">
                        <div
                          className="h-3 bg-purple-500 rounded"
                          style={{ width: `${Math.round(((tipo.total / (maxDisp || 1)) * 100))}%` }}
                        />
                      </div>
                      <span className="ml-2 text-sm text-gray-700">{tipo.total}</span>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
        
        {/* Actividad reciente */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
            <div className="flex items-center text-gray-500">
              <Calendar className="h-5 w-5 mr-1" />
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg p-4 overflow-y-auto">
            {isLoading ? (
              <p className="text-gray-500">Cargando datos...</p>
            ) : actividadReciente.length === 0 ? (
              <p className="text-gray-500">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {actividadReciente.map((actividad: any) => (
                  <div key={actividad._id} className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <ShoppingBag className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{actividad.nombre}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{new Date(actividad.fechaCreacion).toLocaleDateString()}</span>
                        <span className="mx-1">•</span>
                        <span className="capitalize">{actividad.categoria}</span>
                        <span className="mx-1">•</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                          actividad.estado === 'comprado' ? 'bg-green-100 text-green-800' : 
                          actividad.estado === 'pausado' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {actividad.estado}
                        </span>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <span className="text-sm font-medium text-gray-900">${actividad.precio}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tabla de resumen */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Resumen de Ventas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Métrica
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={2} className="px-6 py-4 text-sm text-gray-500">Cargando datos...</td>
                </tr>
              ) : (
                <>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Total de Ventas
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resumen.totalVentas || 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Compras Realizadas
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resumen.totalCompradas || 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Productos Disponibles
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resumen.totalDisponibles || 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Productos Pausados
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resumen.totalPausadas || 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Ingresos Totales
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(resumen.ingresoTotal || 0).toLocaleString()}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
