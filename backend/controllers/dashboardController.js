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

// ============ ENDPOINTS PARA CLIENTE ============

// Obtener mis ventas (productos que he vendido)
exports.getClientMySales = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const mySales = await Venta.find({ usuario: userId })
      .sort({ fechaCreacion: -1 })
      .limit(10)
      .select('_id nombre descripcion precio estado fechaCreacion')
      .lean();
    
    res.status(200).json({
      status: 'success',
      data: {
        count: mySales.length,
        sales: mySales
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Obtener mis compras (productos que he comprado)
exports.getClientMyPurchases = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Por ahora retorna vacío - el modelo de Venta no tiene campo comprador
    // Cuando se implemente la lógica de compra, se deberá:
    // 1. Agregar campo 'comprador' al modelo de Venta, o
    // 2. Crear una colección separada de 'Compras'
    
    res.status(200).json({
      status: 'success',
      data: {
        count: 0,
        purchases: []
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Obtener mis reparaciones (por ahora mockup, estructura lista)
exports.getClientMyRepairs = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Cuando exista la colección de Repair, aquí iría:
    // const myRepairs = await Repair.find({ usuario: userId })
    
    res.status(200).json({
      status: 'success',
      data: {
        count: 0,
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

// Obtener mi reciclaje (por ahora mockup, estructura lista)
exports.getClientMyRecycle = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Cuando exista la colección de Recycle, aquí iría:
    // const myRecycle = await Recycle.find({ usuario: userId })
    
    res.status(200).json({
      status: 'success',
      data: {
        count: 0,
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

// Obtener mis notificaciones
exports.getClientMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Por ahora retorna 0 (estructura lista para cuando exista la colección)
    res.status(200).json({
      status: 'success',
      data: {
        count: 0,
        notifications: []
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Obtener todos los datos del dashboard cliente
exports.getClientDashboardData = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const mySales = await Venta.find({ usuario: userId })
      .sort({ fechaCreacion: -1 })
      .limit(10)
      .select('_id nombre descripcion precio estado fechaCreacion')
      .lean();
    
    res.status(200).json({
      status: 'success',
      data: {
        mySales: { count: mySales.length, sales: mySales },
        myPurchases: { count: 0, purchases: [] },
        myRepairs: { count: 0, repairs: [] },
        myRecycle: { count: 0, recycleRequests: [] },
        myNotifications: { count: 0, notifications: [] }
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
