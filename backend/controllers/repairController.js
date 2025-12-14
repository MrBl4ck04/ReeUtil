const Repair = require('../models/Repair');

// Crear una nueva solicitud de reparación
exports.crearReparacion = async (req, res) => {
  try {
    // PREVENCIÓN DE MASS ASSIGNMENT: Seleccionar explícitamente los campos permitidos
    const {
      tipoDispositivo,
      marca,
      modelo,
      problema,
      descripcion,
      imagenes
    } = req.body;

    const repairData = {
      tipoDispositivo,
      marca,
      modelo,
      problema,
      descripcion,
      imagenes,
      usuario: req.user.id,
      // estado, fechaSolicitud, y repairId se manejan automáticamente o por defecto
    };

    const nuevaReparacion = await Repair.create(repairData);

    res.status(201).json({
      status: 'success',
      data: {
        repair: nuevaReparacion
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Obtener solicitudes de reparación del usuario autenticado
exports.obtenerMisReparaciones = async (req, res) => {
  try {
    const reparaciones = await Repair.find({
      usuario: req.user.id
    }).sort({ fechaSolicitud: -1 });

    res.status(200).json({
      status: 'success',
      results: reparaciones.length,
      data: reparaciones
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Obtener una reparación específica
exports.obtenerReparacion = async (req, res) => {
  try {
    const reparacion = await Repair.findById(req.params.id);

    if (!reparacion) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró la reparación con ese ID'
      });
    }

    // Verificar que el usuario sea el dueño o sea admin
    if (reparacion.usuario._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'No tienes permisos para ver esta reparación'
      });
    }

    res.status(200).json({
      status: 'success',
      data: reparacion
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

    const reparacion = await Repair.findById(req.params.id);

    if (!reparacion) {
      console.log('❌ Reparación no encontrada');
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró la reparación con ese ID'
      });
    }



    // Comparar directamente como ObjectId
    if (!reparacion.usuario || reparacion.usuario.toString() !== req.user.id) {

      return res.status(403).json({
        status: 'fail',
        message: 'No tienes permisos para aceptar esta cotización'
      });
    }

    if (reparacion.estado !== 'cotizado') {

      return res.status(400).json({
        status: 'fail',
        message: `La reparación no está en estado cotizado. Estado actual: ${reparacion.estado}`
      });
    }

    reparacion.estado = 'en_reparacion';
    await reparacion.save();



    res.status(200).json({
      status: 'success',
      data: reparacion
    });
  } catch (err) {

    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Rechazar cotización (usuario) - Elimina la reparación
exports.rechazarCotizacion = async (req, res) => {
  try {
    const reparacion = await Repair.findById(req.params.id);

    if (!reparacion) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró la reparación con ese ID'
      });
    }

    // Comparar directamente como ObjectId
    if (!reparacion.usuario || reparacion.usuario.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'No tienes permisos para rechazar esta cotización'
      });
    }

    if (reparacion.estado !== 'cotizado') {
      return res.status(400).json({
        status: 'fail',
        message: 'La reparación no está en estado cotizado'
      });
    }

    // Eliminar la reparación en lugar de cambiar el estado
    await Repair.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Reparación rechazada y eliminada correctamente',
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

// Obtener todas las reparaciones (admin)
exports.obtenerTodasReparaciones = async (req, res) => {
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

    const reparaciones = await Repair.find(filtros).sort({ fechaSolicitud: -1 });

    // Calcular estadísticas
    const totalReparaciones = await Repair.countDocuments();
    const pendientes = await Repair.countDocuments({ estado: 'pendiente' });
    const enProceso = await Repair.countDocuments({ estado: { $in: ['evaluando', 'cotizado', 'en_reparacion'] } });
    const completadas = await Repair.countDocuments({ estado: 'completado' });

    res.status(200).json({
      status: 'success',
      results: reparaciones.length,
      data: {
        reparaciones,
        estadisticas: {
          totalReparaciones,
          pendientes,
          enProceso,
          completadas
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
    const reparacion = await Repair.findById(req.params.id);

    if (!reparacion) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró la reparación con ese ID'
      });
    }

    reparacion.cotizacion = {
      monto: req.body.monto,
      tiempoEstimado: req.body.tiempoEstimado,
      detalles: req.body.detalles
    };
    reparacion.estado = 'cotizado';
    await reparacion.save();

    res.status(200).json({
      status: 'success',
      message: 'Cotización actualizada correctamente',
      data: reparacion
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Actualizar estado de reparación (admin)
exports.actualizarEstado = async (req, res) => {
  try {
    const reparacion = await Repair.findById(req.params.id);

    if (!reparacion) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró la reparación con ese ID'
      });
    }

    const { estado, estadoReparacion, detallesReparacion, fechaEstimadaFinalizacion } = req.body;

    if (estado) {
      reparacion.estado = estado;
    }

    if (estadoReparacion) {
      reparacion.estadoReparacion = estadoReparacion;
    }

    if (detallesReparacion) {
      reparacion.detallesReparacion = detallesReparacion;
    }

    if (fechaEstimadaFinalizacion) {
      reparacion.fechaEstimadaFinalizacion = fechaEstimadaFinalizacion;
    }

    if (estado === 'completado') {
      reparacion.fechaFinalizacion = Date.now();
    }

    await reparacion.save();

    res.status(200).json({
      status: 'success',
      message: 'Estado actualizado correctamente',
      data: reparacion
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Cambiar estado a evaluando (admin)
exports.evaluarReparacion = async (req, res) => {
  try {
    const reparacion = await Repair.findById(req.params.id);

    if (!reparacion) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró la reparación con ese ID'
      });
    }

    if (reparacion.estado !== 'pendiente') {
      return res.status(400).json({
        status: 'fail',
        message: 'La reparación no está en estado pendiente'
      });
    }

    reparacion.estado = 'evaluando';
    await reparacion.save();

    res.status(200).json({
      status: 'success',
      message: 'Reparación en evaluación',
      data: reparacion
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Rechazar reparación (admin)
exports.rechazarReparacion = async (req, res) => {
  try {
    const reparacion = await Repair.findById(req.params.id);

    if (!reparacion) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró la reparación con ese ID'
      });
    }

    reparacion.estado = 'rechazado';
    await reparacion.save();

    res.status(200).json({
      status: 'success',
      message: 'Reparación rechazada',
      data: reparacion
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Completar reparación (admin)
exports.completarReparacion = async (req, res) => {
  try {
    const reparacion = await Repair.findById(req.params.id);

    if (!reparacion) {
      return res.status(404).json({
        status: 'fail',
        message: 'No se encontró la reparación con ese ID'
      });
    }

    if (reparacion.estado !== 'en_reparacion') {
      return res.status(400).json({
        status: 'fail',
        message: 'La reparación no está en estado "en reparación"'
      });
    }

    reparacion.estado = 'completado';
    reparacion.fechaFinalizacion = Date.now();

    // Opcional: agregar detalles de finalización si se envían
    if (req.body.detallesReparacion) {
      reparacion.detallesReparacion = req.body.detallesReparacion;
    }

    await reparacion.save();

    res.status(200).json({
      status: 'success',
      message: 'Reparación completada exitosamente',
      data: reparacion
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
