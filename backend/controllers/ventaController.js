const Venta = require('../models/Venta');

// Crear una nueva venta
exports.crearVenta = async (req, res) => {
  try {
    // Agregar el usuario autenticado a los datos de la venta
    const ventaData = {
      ...req.body,
      usuario: req.user.id
    };

    const nuevaVenta = await Venta.create(ventaData);

    res.status(201).json({
      status: 'success',
      data: {
        venta: nuevaVenta
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Obtener todas las ventas
exports.obtenerVentas = async (req, res) => {
  try {
    // Filtros opcionales
    const filtros = {};
    
    if (req.query.categoria) filtros.categoria = req.query.categoria;
    if (req.query.estado) filtros.estado = req.query.estado;
    if (req.query.condicion) filtros.condicion = req.query.condicion;
    
    // Filtro de precio
    if (req.query.precioMin || req.query.precioMax) {
      filtros.precio = {};
      if (req.query.precioMin) filtros.precio.$gte = Number(req.query.precioMin);
      if (req.query.precioMax) filtros.precio.$lte = Number(req.query.precioMax);
    }

    const ventas = await Venta.find(filtros).sort({ fechaCreacion: -1 });

    res.status(200).json({
      status: 'success',
      results: ventas.length,
      data: {
        ventas
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Obtener una venta específica
exports.obtenerVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);

    if (!venta) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró la venta con ese ID'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        venta
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Obtener ventas del usuario autenticado
exports.obtenerMisVentas = async (req, res) => {
  try {
    const ventas = await Venta.find({ usuario: req.user.id }).sort({ fechaCreacion: -1 });

    res.status(200).json({
      status: 'success',
      results: ventas.length,
      data: {
        ventas
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Actualizar una venta
exports.actualizarVenta = async (req, res) => {
  try {
    // Verificar que la venta pertenece al usuario autenticado
    const venta = await Venta.findById(req.params.id);
    
    if (!venta) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró la venta con ese ID'
      });
    }

    if (venta.usuario._id.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'No tienes permisos para actualizar esta venta'
      });
    }

    const ventaActualizada = await Venta.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        venta: ventaActualizada
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Eliminar una venta
exports.eliminarVenta = async (req, res) => {
  try {
    // Verificar que la venta pertenece al usuario autenticado
    const venta = await Venta.findById(req.params.id);
    
    if (!venta) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró la venta con ese ID'
      });
    }

    if (venta.usuario._id.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'No tienes permisos para eliminar esta venta'
      });
    }

    await Venta.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Comprar una venta
exports.comprarVenta = async (req, res) => {
  try {
    const venta = await Venta.findById(req.params.id);

    if (!venta) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró la venta con ese ID'
      });
    }

    // No permitir comprar la propia venta
    if (venta.usuario._id.toString() === req.user.id) {
      return res.status(400).json({
        status: 'fail',
        message: 'No puedes comprar tu propio producto'
      });
    }

    // Solo permitir compra si está en estado "venta" o "disponible"
    if (!['venta', 'disponible'].includes(venta.estado)) {
      return res.status(400).json({
        status: 'fail',
        message: 'El producto no está disponible para comprar'
      });
    }

    venta.estado = 'comprado';
    await venta.save();

    res.status(200).json({
      status: 'success',
      data: {
        venta
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Buscar ventas por texto
exports.buscarVentas = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        status: 'fail',
        message: 'Se requiere un término de búsqueda'
      });
    }

    const ventas = await Venta.find({
      $or: [
        { nombre: { $regex: q, $options: 'i' } },
        { descripcion: { $regex: q, $options: 'i' } }
      ],
      estado: 'disponible'
    }).sort({ fechaCreacion: -1 });

    res.status(200).json({
      status: 'success',
      results: ventas.length,
      data: {
        ventas
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};