const Venta = require('../../models/Venta');
const Review = require('../../models/Review');
const User = require('../../models/User');

// Controlador para obtener estadísticas del dashboard
exports.obtenerEstadisticasDashboard = async (req, res) => {
  try {
    // Obtener estadísticas generales
    const totalVentas = await Venta.countDocuments();
    const totalCompradas = await Venta.countDocuments({ estado: 'comprado' });
    const totalDisponibles = await Venta.countDocuments({ estado: { $in: ['venta', 'disponible'] } });
    const totalPausadas = await Venta.countDocuments({ estado: 'pausado' });
    const ingresoTotalAgg = await Venta.aggregate([
      { $match: { estado: 'comprado' } },
      { $group: { _id: null, total: { $sum: '$precio' } } }
    ]);
    const ingresoTotal = ingresoTotalAgg.length > 0 ? ingresoTotalAgg[0].total : 0;

    // Ventas por categoría
    const ventasPorCategoria = await Venta.aggregate([
      { $group: { _id: '$categoria', totalVentas: { $sum: 1 }, totalIngresos: { $sum: '$precio' } } },
      { $project: { _id: 0, categoria: '$_id', totalVentas: 1, totalIngresos: 1 } }
    ]);

    // Ingresos mensuales (últimos 6 meses)
    const fechaActual = new Date();
    const seisAnteriores = new Date(fechaActual);
    seisAnteriores.setMonth(fechaActual.getMonth() - 6);

    const ingresosMensuales = await Venta.aggregate([
      { $match: { estado: 'comprado', fechaCreacion: { $gte: seisAnteriores } } },
      {
        $group: {
          _id: { year: { $year: '$fechaCreacion' }, month: { $month: '$fechaCreacion' } },
          totalIngresos: { $sum: '$precio' }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          totalIngresos: 1
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    // Dispositivos por tipo
    const dispositivosPorTipo = await Venta.aggregate([
      { $group: { _id: '$tipo', total: { $sum: 1 } } },
      { $project: { _id: 0, tipo: '$_id', total: 1 } }
    ]);

    // Actividad reciente (últimos 10 registros)
    const actividadReciente = await Venta.find()
      .sort({ fechaCreacion: -1 })
      .limit(10)
      .select('ventaId nombre categoria precio estado fechaCreacion usuario');

    // Solo mostrar datos de ejemplo si no hay datos reales
    if (totalVentas === 0) {
      console.log('No hay datos en la base de datos, generando datos de ejemplo para el dashboard');
      
      // Datos de ejemplo para el dashboard
      const resumenVentasEjemplo = {
        totalVentas: 120,
        totalCompradas: 85,
        totalDisponibles: 30,
        totalPausadas: 5,
        ingresoTotal: 12500
      };
      
      const ventasPorCategoriaEjemplo = [
        { categoria: 'smartphone', totalVentas: 45, totalIngresos: 5400 },
        { categoria: 'laptop', totalVentas: 25, totalIngresos: 4500 },
        { categoria: 'tablet', totalVentas: 15, totalIngresos: 2600 }
      ];
      
      const ingresosMensualesEjemplo = [
        { year: 2023, month: 9, totalIngresos: 3200 },
        { year: 2023, month: 10, totalIngresos: 4100 },
        { year: 2023, month: 11, totalIngresos: 5200 }
      ];
      
      const dispositivosPorTipoEjemplo = [
        { tipo: 'smartphone', total: 60 },
        { tipo: 'laptop', total: 35 },
        { tipo: 'tablet', total: 25 }
      ];
      
      const actividadRecienteEjemplo = Array(10).fill(null).map((_, i) => ({
        _id: `ejemplo${i}`,
        ventaId: `V${1000 + i}`,
        nombre: `Dispositivo de ejemplo ${i + 1}`,
        categoria: i % 3 === 0 ? 'smartphone' : i % 3 === 1 ? 'laptop' : 'tablet',
        precio: Math.floor(Math.random() * 1000) + 500,
        estado: i % 4 === 0 ? 'comprado' : i % 4 === 1 ? 'venta' : i % 4 === 2 ? 'disponible' : 'pausado',
        fechaCreacion: new Date(Date.now() - i * 86400000),
        usuario: `usuario${i % 5 + 1}`
      }));
      
      return res.status(200).json({
        status: 'success',
        data: {
          resumenVentas: resumenVentasEjemplo,
          ventasPorCategoria: ventasPorCategoriaEjemplo,
          ingresosMensuales: ingresosMensualesEjemplo,
          dispositivosPorTipo: dispositivosPorTipoEjemplo,
          actividadReciente: actividadRecienteEjemplo
        }
      });
    }

    // Devolver datos reales
    return res.status(200).json({
      status: 'success',
      data: {
        resumenVentas: {
          totalVentas,
          totalCompradas,
          totalDisponibles,
          totalPausadas,
          ingresoTotal
        },
        ventasPorCategoria,
        ingresosMensuales,
        dispositivosPorTipo,
        actividadReciente
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener estadísticas del dashboard',
      error: error.message
    });
  }
};

// NUEVO: Obtener todos los datos del dashboard para admin
exports.getAllDashboardData = async (req, res) => {
  try {
    // Obtener reparaciones pendientes
    const pendingRepairs = await Venta.countDocuments({ estado: 'reparacion_pendiente' });
    
    // Obtener reciclajes pendientes
    const pendingRecycle = await Venta.countDocuments({ estado: 'reciclaje_pendiente' });
    
    // Obtener ventas recientes (últimas 10)
    const recentSales = await Venta.find()
      .sort({ fechaCreacion: -1 })
      .limit(10)
      .select('_id producto cantidad precio estado fechaCreacion usuario')
      .lean();
    
    // Obtener reseñas nuevas (últimas 10)
    const newReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('autor', 'name')
      .populate('destinatario', 'name')
      .select('_id titulo comentario calificacion tipo createdAt autor destinatario')
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        pendingRepairs: {
          count: pendingRepairs
        },
        pendingRecycle: {
          count: pendingRecycle
        },
        recentSales: {
          count: recentSales.length,
          sales: recentSales
        },
        newReviews: {
          count: newReviews.length,
          reviews: newReviews
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener datos del dashboard admin:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener datos del dashboard',
      error: error.message
    });
  }
};

// Obtener datos del dashboard de cliente
exports.getClientDashboardData = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        status: 'fail',
        message: 'Usuario no autenticado'
      });
    }

    // Ventas activas del usuario
    const activesSales = await Venta.countDocuments({ usuario: userId, estado: { $in: ['venta', 'disponible'] } });
    
    // Compras realizadas
    const purchases = await Venta.countDocuments({ comprador: userId, estado: 'comprado' });
    
    // Reparaciones en proceso
    const repairsInProgress = await Venta.countDocuments({ usuario: userId, estado: 'reparacion_pendiente' });
    
    // Reciclajes realizados
    const recycleCount = await Venta.countDocuments({ usuario: userId, estado: 'reciclaje_completado' });
    
    // Últimas ventas del usuario
    const recentSales = await Venta.find({ usuario: userId })
      .sort({ fechaCreacion: -1 })
      .limit(5)
      .select('_id producto cantidad precio estado fechaCreacion')
      .lean();

    res.status(200).json({
      status: 'success',
      data: {
        activeSales: activesSales,
        purchases: purchases,
        repairsInProgress: repairsInProgress,
        recycleCount: recycleCount,
        recentSales: recentSales
      }
    });
  } catch (error) {
    console.error('Error al obtener datos del dashboard cliente:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener datos del dashboard',
      error: error.message
    });
  }
};