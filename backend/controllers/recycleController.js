const Recycle = require('../models/Recycle');
const User = require('../models/User');

// Obtener todas las solicitudes de reciclaje (admin)
exports.getAllRecycleRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status && status !== 'all') {
      query.estado = status;
    }
    
    const recycleRequests = await Recycle.find(query).sort({ fechaSolicitud: -1 });
    
    res.status(200).json({
      success: true,
      data: recycleRequests
    });
  } catch (error) {
    console.error('Error al obtener solicitudes de reciclaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes de reciclaje',
      error: error.message
    });
  }
};

// Obtener mis solicitudes de reciclaje (cliente)
exports.getMyRecycleRequests = async (req, res) => {
  try {
    const idUsuario = req.user.idUsuario;
    
    const recycleRequests = await Recycle.find({ idUsuario }).sort({ fechaSolicitud: -1 });
    
    res.status(200).json({
      success: true,
      data: recycleRequests
    });
  } catch (error) {
    console.error('Error al obtener mis solicitudes de reciclaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mis solicitudes de reciclaje',
      error: error.message
    });
  }
};

// Obtener una solicitud de reciclaje específica
exports.getRecycleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const recycleRequest = await Recycle.findById(id);
    
    if (!recycleRequest) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de reciclaje no encontrada'
      });
    }
    
    // Verificar si el usuario es admin o el dueño de la solicitud
    if (!req.user.rol && recycleRequest.idUsuario !== req.user.idUsuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a esta solicitud'
      });
    }
    
    res.status(200).json({
      success: true,
      data: recycleRequest
    });
  } catch (error) {
    console.error('Error al obtener solicitud de reciclaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitud de reciclaje',
      error: error.message
    });
  }
};

// Crear nueva solicitud de reciclaje
exports.createRecycleRequest = async (req, res) => {
  try {
    const { tipoDispositivo, marca, modelo, descripcion, imagenes } = req.body;
    const idUsuario = req.user.idUsuario;
    
    // Validar datos requeridos
    if (!tipoDispositivo || !marca || !modelo || !descripcion) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }
    
    // Crear nueva solicitud
    const recycleRequest = new Recycle({
      tipoDispositivo,
      marca,
      modelo,
      descripcion,
      idUsuario,
      imagenes: imagenes || []
    });
    
    await recycleRequest.save();
    
    res.status(201).json({
      success: true,
      message: 'Solicitud de reciclaje creada exitosamente',
      data: recycleRequest
    });
  } catch (error) {
    console.error('Error al crear solicitud de reciclaje:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear solicitud de reciclaje',
      error: error.message
    });
  }
};

// Actualizar cotización de reciclaje (admin)
exports.updateRecycleQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto, comentarios } = req.body;
    
    // Validar datos requeridos
    if (!monto) {
      return res.status(400).json({
        success: false,
        message: 'El monto de la cotización es requerido'
      });
    }
    
    const recycleRequest = await Recycle.findById(id);
    
    if (!recycleRequest) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de reciclaje no encontrada'
      });
    }
    
    // Actualizar cotización
    recycleRequest.cotizacion = {
      monto,
      comentarios: comentarios || '',
      fecha: Date.now()
    };
    recycleRequest.estado = 'cotizado';
    
    await recycleRequest.save();
    
    res.status(200).json({
      success: true,
      message: 'Cotización actualizada exitosamente',
      data: recycleRequest
    });
  } catch (error) {
    console.error('Error al actualizar cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar cotización',
      error: error.message
    });
  }
};

// Actualizar estado de reciclaje (admin)
exports.updateRecycleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    // Validar datos requeridos
    if (!estado) {
      return res.status(400).json({
        success: false,
        message: 'El estado es requerido'
      });
    }
    
    const recycleRequest = await Recycle.findById(id);
    
    if (!recycleRequest) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de reciclaje no encontrada'
      });
    }
    
    // Actualizar estado
    recycleRequest.estado = estado;
    
    // Si se completa el reciclaje, establecer la fecha de finalización
    if (estado === 'completado') {
      recycleRequest.fechaFinalizacion = Date.now();
      recycleRequest.compensacionFinal = recycleRequest.cotizacion.monto;
    }
    
    await recycleRequest.save();
    
    res.status(200).json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: recycleRequest
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar estado',
      error: error.message
    });
  }
};

// Aceptar cotización de reciclaje (cliente)
exports.acceptRecycleQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.idUsuario;
    
    const recycleRequest = await Recycle.findById(id);
    
    if (!recycleRequest) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de reciclaje no encontrada'
      });
    }
    
    // Verificar si el usuario es el dueño de la solicitud
    if (recycleRequest.idUsuario !== idUsuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para aceptar esta cotización'
      });
    }
    
    // Verificar si la solicitud está en estado cotizado
    if (recycleRequest.estado !== 'cotizado') {
      return res.status(400).json({
        success: false,
        message: 'La solicitud no está en estado cotizado'
      });
    }
    
    // Actualizar a estado en proceso de reciclaje
    recycleRequest.estado = 'completado';
    recycleRequest.fechaFinalizacion = Date.now();
    recycleRequest.compensacionFinal = recycleRequest.cotizacion.monto;
    
    await recycleRequest.save();
    
    res.status(200).json({
      success: true,
      message: 'Cotización aceptada exitosamente',
      data: recycleRequest
    });
  } catch (error) {
    console.error('Error al aceptar cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al aceptar cotización',
      error: error.message
    });
  }
};

// Rechazar cotización de reciclaje (cliente)
exports.rejectRecycleQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.idUsuario;
    
    const recycleRequest = await Recycle.findById(id);
    
    if (!recycleRequest) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de reciclaje no encontrada'
      });
    }
    
    // Verificar si el usuario es el dueño de la solicitud
    if (recycleRequest.idUsuario !== idUsuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para rechazar esta cotización'
      });
    }
    
    // Verificar si la solicitud está en estado cotizado
    if (recycleRequest.estado !== 'cotizado') {
      return res.status(400).json({
        success: false,
        message: 'La solicitud no está en estado cotizado'
      });
    }
    
    // Actualizar a estado rechazado
    recycleRequest.estado = 'rechazado';
    
    await recycleRequest.save();
    
    res.status(200).json({
      success: true,
      message: 'Cotización rechazada exitosamente',
      data: recycleRequest
    });
  } catch (error) {
    console.error('Error al rechazar cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error al rechazar cotización',
      error: error.message
    });
  }
};
