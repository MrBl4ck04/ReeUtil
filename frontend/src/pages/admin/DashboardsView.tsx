import React, { useState } from 'react';
import { BarChart2, PieChart, LineChart, Calendar, DollarSign, ShoppingBag, ShoppingCart, ShoppingBag as ShoppingBagIcon } from 'lucide-react';
import { useQuery } from 'react-query';
import { ventasApi } from '../../services/ventasApi';

const DashboardsViewInner: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const { data: dashboardData, isLoading } = useQuery('ventasDashboard', ventasApi.obtenerEstadisticasDashboard, {
    refetchInterval: 5000,
    retry: 3,
    staleTime: 2000,
  });

  const responseData = dashboardData?.data;
  const dashboard = responseData?.data || {};

  const resumen = dashboard?.resumenVentas || {
    totalVentas: 0,
    totalCompradas: 0,
    totalDisponibles: 0,
    totalPausadas: 0,
    ingresoTotal: 0,
  };

  const ventasPorCategoria = dashboard?.ventasPorCategoria || [];
  const ingresosMensuales = dashboard?.ingresosMensuales || [];
  const dispositivosPorEstado = dashboard?.dispositivosPorEstado || dashboard?.dispositivosPorTipo || [];
  const actividadReciente = dashboard?.actividadReciente || [];

  const stats = [
    { name: 'Ventas Totales', value: resumen.totalVentas || 0, icon: ShoppingBag, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { name: 'Ingresos', value: `$${(resumen.ingresoTotal || 0).toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100' },
    { name: 'Compras', value: resumen.totalCompradas || 0, icon: ShoppingCart, color: 'text-green-600', bgColor: 'bg-green-100' },
    { name: 'Disponibles', value: resumen.totalDisponibles || 0, icon: ShoppingBag, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboards</h1>
          <p className="mt-1 text-sm text-gray-500">Visualiza estadísticas y métricas del sistema</p>
        </div>
        <div className="flex space-x-2">
          <button className={`px-3 py-1 text-sm rounded-md ${timeRange === 'week' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-500'}`} onClick={() => setTimeRange('week')}>Semana</button>
          <button className={`px-3 py-1 text-sm rounded-md ${timeRange === 'month' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-500'}`} onClick={() => setTimeRange('month')}>Mes</button>
          <button className={`px-3 py-1 text-sm rounded-md ${timeRange === 'year' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-500'}`} onClick={() => setTimeRange('year')}>Año</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => {
          const Icon = s.icon as any;
          return (
            <div key={s.name} className="card">
              <div className="flex items-center">
                <div className={`${s.bgColor} p-3 rounded-lg`}>
                  <Icon className={`${s.color} h-6 w-6`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{s.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Ventas por Categoría</h3>
            <BarChart2 className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg p-4 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40 text-gray-500">Cargando datos...</div>
            ) : ventasPorCategoria.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-500">Sin datos disponibles</div>
            ) : (
              <div className="space-y-2">
                {ventasPorCategoria.map((cat: any) => (
                  <div key={cat.categoria} className="flex items-center">
                    <span className="w-28 text-sm text-gray-600 capitalize">{cat.categoria}</span>
                    <div className="flex-1 h-3 bg-gray-200 rounded">
                      <div className="h-3 bg-blue-500 rounded" style={{ width: `${Math.round((cat.totalVentas / (Math.max(...ventasPorCategoria.map((c: any) => c.totalVentas || 1))) * 100))}%` }} />
                    </div>
                    <span className="ml-2 text-sm text-gray-700">{cat.totalVentas}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Ingresos Mensuales</h3>
            <LineChart className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg p-4 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40 text-gray-500">Cargando datos...</div>
            ) : ingresosMensuales.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-500">Sin datos</div>
            ) : (
              <div className="space-y-2">
                {ingresosMensuales.map((m: any) => (
                  <div key={`${m.year}-${m.month}`} className="flex items-center">
                    <span className="w-20 text-sm text-gray-600">{String(m.month).padStart(2, '0')}/{m.year}</span>
                    <div className="flex-1 h-3 bg-gray-200 rounded">
                      <div className="h-3 bg-green-500 rounded" style={{ width: `${Math.round((m.totalIngresos / (Math.max(...ingresosMensuales.map((x: any) => x.totalIngresos || 1))) * 100))}%` }} />
                    </div>
                    <span className="ml-2 text-sm text-gray-700">${m.totalIngresos}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Dispositivos por Estado</h3>
            <PieChart className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg p-4 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40 text-gray-500">Cargando datos...</div>
            ) : dispositivosPorEstado.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-500">Sin datos</div>
            ) : (
              <div className="space-y-2">
                {dispositivosPorEstado.map((item: any) => (
                  <div key={item.estado || item.tipo || JSON.stringify(item)} className="flex items-center">
                    <span className="w-28 text-sm text-gray-600 capitalize">{item.estado || item.tipo}</span>
                    <div className="flex-1 h-3 bg-gray-200 rounded">
                      <div className="h-3 bg-purple-500 rounded" style={{ width: `${Math.round((item.total / (Math.max(...dispositivosPorEstado.map((d: any) => d.total || 1))) * 100))}%` }} />
                    </div>
                    <span className="ml-2 text-sm text-gray-700">{item.total}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
            <Calendar className="h-5 w-5 text-gray-500" />
          </div>
          <div className="h-64 bg-gray-50 rounded-lg p-4 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-40 text-gray-500">Cargando datos...</div>
            ) : actividadReciente.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-500">Sin datos</div>
            ) : (
              <div className="space-y-3">
                {actividadReciente.map((actividad: any) => (
                  <div key={actividad._id} className="flex items-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <ShoppingBagIcon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{actividad.nombre}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{new Date(actividad.fechaCreacion).toLocaleDateString()}</span>
                        <span className="mx-1">•</span>
                        <span className="capitalize">{actividad.categoria}</span>
                        <span className="mx-1">•</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-xs ${actividad.estado === 'comprado' ? 'bg-green-100 text-green-800' : actividad.estado === 'pausado' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{actividad.estado}</span>
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
    </div>
  );
};


export default DashboardsViewInner;
