const Review = require('../models/Review');
const Venta = require('../models/Venta');

// Obtener reparaciones pendientes
exports.getPendingRepairs = async (req, res) => {
  try {
    // Por ahora retorna 0 (estructura lista para cuando exista la colección)
    const pendingCount = 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        count: pendingCount,
        repairs: []
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Obtener reciclaje pendiente
exports.getPendingRecycle = async (req, res) => {
  try {
    // Por ahora retorna 0 (estructura lista para cuando exista la colección)
    const pendingCount = 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        count: pendingCount,
        recycleRequests: []
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Obtener ventas recientes (últimas 10)
exports.getRecentSales = async (req, res) => {
  try {
    const recentSales = await Venta.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('_id producto cantidad precio estado createdAt')
      .lean();
    
    res.status(200).json({
      status: 'success',
      data: {
        count: recentSales.length,
        sales: recentSales
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Obtener reseñas nuevas (últimas 5)
exports.getNewReviews = async (req, res) => {
  try {
    const newReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('autor', 'name')
      .populate('destinatario', 'name')
      .select('titulo calificacion tipo autor destinatario createdAt')
      .lean();
    
    res.status(200).json({
      status: 'success',
      data: {
        count: newReviews.length,
        reviews: newReviews
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Obtener todos los datos del dashboard
exports.getAllDashboardData = async (req, res) => {
  try {
    const [recentSales, newReviews] = await Promise.all([
      Venta.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('_id producto cantidad precio estado createdAt')
        .lean(),
      Review.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('autor', 'name')
        .populate('destinatario', 'name')
        .select('titulo calificacion tipo autor destinatario createdAt')
        .lean()
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        pendingRepairs: { count: 0, repairs: [] },
        pendingRecycle: { count: 0, recycleRequests: [] },
        recentSales: { count: recentSales.length, sales: recentSales },
        newReviews: { count: newReviews.length, reviews: newReviews }
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
