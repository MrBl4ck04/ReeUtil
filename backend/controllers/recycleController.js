const Recycle = require('../models/Recycle');

// Crear una nueva solicitud de reciclaje
exports.crearReciclaje = async (req, res) => {
  try {
    const recycleData = {
      ...req.body,
      usuario: req.user.id
    };

    const nuevoReciclaje = await Recycle.create(recycleData);

    res.status(201).json({
      status: 'success',
      data: {
        recycle: nuevoReciclaje
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Obtener solicitudes de reciclaje del usuario autenticado
exports.obtenerMisReciclajes = async (req, res) => {
  try {
    const reciclajes = await Recycle.find({
      usuario: req.user.id
    }).sort({ fechaSolicitud: -1 });

    res.status(200).json({
      status: 'success',
      results: reciclajes.length,
      data: reciclajes
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Obtener un reciclaje específico
exports.obtenerReciclaje = async (req, res) => {
  try {
    const reciclaje = await Recycle.findById(req.params.id);

    if (!reciclaje) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró el reciclaje con ese ID'
      });
    }

    // Verificar que el usuario sea el dueño o sea admin
    if (reciclaje.usuario._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'No tienes permisos para ver este reciclaje'
      });
    }

    res.status(200).json({
      status: 'success',
      data: reciclaje
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Aceptar cotización (usuario)
exports.aceptarCotizacion = async (req, res) => {
  try {
    const reciclaje = await Recycle.findById(req.params.id);

    if (!reciclaje) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró el reciclaje con ese ID'
      });
    }

    // Comparar directamente como ObjectId
    if (!reciclaje.usuario || reciclaje.usuario.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'No tienes permisos para aceptar esta cotización'
      });
    }

    if (reciclaje.estado !== 'cotizado') {
      return res.status(400).json({
        status: 'fail',
        message: `El reciclaje no está en estado cotizado. Estado actual: ${reciclaje.estado}`
      });
    }

    reciclaje.estado = 'en_reparacion';
    await reciclaje.save();

    res.status(200).json({
      status: 'success',
      data: reciclaje
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Rechazar cotización (usuario) - Elimina el reciclaje
exports.rechazarCotizacion = async (req, res) => {
  try {
    const reciclaje = await Recycle.findById(req.params.id);

    if (!reciclaje) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró el reciclaje con ese ID'
      });
    }

    // Comparar directamente como ObjectId
    if (!reciclaje.usuario || reciclaje.usuario.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'No tienes permisos para rechazar esta cotización'
      });
    }

    if (reciclaje.estado !== 'cotizado') {
      return res.status(400).json({
        status: 'fail',
        message: 'El reciclaje no está en estado cotizado'
      });
    }

    // Eliminar el reciclaje en lugar de cambiar el estado
    await Recycle.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Reciclaje rechazado y eliminado correctamente',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// ========== FUNCIONES ESPECÍFICAS DEL ADMIN ==========

// Obtener todos los reciclajes (admin)
exports.obtenerTodosReciclajes = async (req, res) => {
  try {
    const filtros = {};
    
    if (req.query.estado) {
      filtros.estado = req.query.estado;
    }

    if (req.query.search) {
      filtros.$or = [
        { tipoDispositivo: { $regex: req.query.search, $options: 'i' } },
        { marca: { $regex: req.query.search, $options: 'i' } },
        { modelo: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const reciclajes = await Recycle.find(filtros).sort({ fechaSolicitud: -1 });

    // Calcular estadísticas
    const totalReciclajes = await Recycle.countDocuments();
    const pendientes = await Recycle.countDocuments({ estado: 'pendiente' });
    const enProceso = await Recycle.countDocuments({ estado: { $in: ['evaluando', 'cotizado', 'en_reparacion'] } });
    const completados = await Recycle.countDocuments({ estado: 'completado' });

    res.status(200).json({
      status: 'success',
      results: reciclajes.length,
      data: {
        reciclajes,
        estadisticas: {
          totalReciclajes,
          pendientes,
          enProceso,
          completados
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Actualizar cotización (admin)
exports.actualizarCotizacion = async (req, res) => {
  try {
    const reciclaje = await Recycle.findById(req.params.id);

    if (!reciclaje) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró el reciclaje con ese ID'
      });
    }

    reciclaje.cotizacion = {
      monto: req.body.monto,
      tiempoEstimado: req.body.tiempoEstimado,
      detalles: req.body.detalles
    };
    reciclaje.estado = 'cotizado';
    await reciclaje.save();

    res.status(200).json({
      status: 'success',
      message: 'Cotización actualizada correctamente',
      data: reciclaje
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Actualizar estado de reciclaje (admin)
exports.actualizarEstado = async (req, res) => {
  try {
    const reciclaje = await Recycle.findById(req.params.id);

    if (!reciclaje) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró el reciclaje con ese ID'
      });
    }

    const { estado } = req.body;

    if (estado) {
      reciclaje.estado = estado;
    }

    if (estado === 'completado') {
      reciclaje.fechaFinalizacion = Date.now();
    }

    await reciclaje.save();

    res.status(200).json({
      status: 'success',
      message: 'Estado actualizado correctamente',
      data: reciclaje
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Cambiar estado a evaluando (admin)
exports.evaluarReciclaje = async (req, res) => {
  try {
    const reciclaje = await Recycle.findById(req.params.id);

    if (!reciclaje) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró el reciclaje con ese ID'
      });
    }

    if (reciclaje.estado !== 'pendiente') {
      return res.status(400).json({
        status: 'fail',
        message: 'El reciclaje no está en estado pendiente'
      });
    }

    reciclaje.estado = 'evaluando';
    await reciclaje.save();

    res.status(200).json({
      status: 'success',
      message: 'Reciclaje en evaluación',
      data: reciclaje
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Rechazar reciclaje (admin)
exports.rechazarReciclaje = async (req, res) => {
  try {
    const reciclaje = await Recycle.findById(req.params.id);

    if (!reciclaje) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró el reciclaje con ese ID'
      });
    }

    reciclaje.estado = 'rechazado';
    await reciclaje.save();

    res.status(200).json({
      status: 'success',
      message: 'Reciclaje rechazado',
      data: reciclaje
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Completar reciclaje (admin)
exports.completarReciclaje = async (req, res) => {
  try {
    const reciclaje = await Recycle.findById(req.params.id);

    if (!reciclaje) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró el reciclaje con ese ID'
      });
    }

    if (reciclaje.estado !== 'en_reparacion') {
      return res.status(400).json({
        status: 'fail',
        message: 'El reciclaje no está en estado "en reparación"'
      });
    }

    reciclaje.estado = 'completado';
    reciclaje.fechaFinalizacion = Date.now();

    await reciclaje.save();

    res.status(200).json({
      status: 'success',
      message: 'Reciclaje completado exitosamente',
      data: reciclaje
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
