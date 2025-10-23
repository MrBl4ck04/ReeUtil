const Repair = require('../models/Repair');
const User = require('../models/User');

// Obtener todas las solicitudes de reparación (admin)
exports.getAllRepairRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    
    if (status && status !== 'all') {
      query.estado = status;
    }
    
    const repairRequests = await Repair.find(query).sort({ fechaSolicitud: -1 });
    
    res.status(200).json({
      success: true,
      data: repairRequests
    });
  } catch (error) {
    console.error('Error al obtener solicitudes de reparación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes de reparación',
      error: error.message
    });
  }
};

// Obtener mis solicitudes de reparación (cliente)
exports.getMyRepairRequests = async (req, res) => {
  try {
    const idUsuario = req.user.idUsuario;
    
    const repairRequests = await Repair.find({ idUsuario }).sort({ fechaSolicitud: -1 });
    
    res.status(200).json({
      success: true,
      data: repairRequests
    });
  } catch (error) {
    console.error('Error al obtener mis solicitudes de reparación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mis solicitudes de reparación',
      error: error.message
    });
  }
};

// Obtener una solicitud de reparación específica
exports.getRepairById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const repairRequest = await Repair.findById(id);
    
    if (!repairRequest) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de reparación no encontrada'
      });
    }
    
    // Verificar si el usuario es admin o el dueño de la solicitud
    if (!req.user.rol && repairRequest.idUsuario !== req.user.idUsuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a esta solicitud'
      });
    }
    
    res.status(200).json({
      success: true,
      data: repairRequest
    });
  } catch (error) {
    console.error('Error al obtener solicitud de reparación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitud de reparación',
      error: error.message
    });
  }
};

// Crear nueva solicitud de reparación
exports.createRepairRequest = async (req, res) => {
  try {
    const { tipoDispositivo, marca, modelo, descripcionProblema, imagenes } = req.body;
    const idUsuario = req.user.idUsuario;
    
    // Validar datos requeridos
    if (!tipoDispositivo || !marca || !modelo || !descripcionProblema) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }
    
    // Crear nueva solicitud
    const repairRequest = new Repair({
      tipoDispositivo,
      marca,
      modelo,
      descripcionProblema,
      idUsuario,
      imagenes: imagenes || []
    });
    
    await repairRequest.save();
    
    res.status(201).json({
      success: true,
      message: 'Solicitud de reparación creada exitosamente',
      data: repairRequest
    });
  } catch (error) {
    console.error('Error al crear solicitud de reparación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear solicitud de reparación',
      error: error.message
    });
  }
};

// Actualizar diagnóstico de reparación (admin)
exports.updateRepairDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const { descripcion } = req.body;
    
    // Validar datos requeridos
    if (!descripcion) {
      return res.status(400).json({
        success: false,
        message: 'La descripción del diagnóstico es requerida'
      });
    }
    
    const repairRequest = await Repair.findById(id);
    
    if (!repairRequest) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de reparación no encontrada'
      });
    }
    
    // Actualizar diagnóstico
    repairRequest.diagnostico = {
      descripcion,
      fecha: Date.now()
    };
    repairRequest.estado = 'diagnosticado';
    repairRequest.fechaDiagnostico = Date.now();
    
    await repairRequest.save();
    
    res.status(200).json({
      success: true,
      message: 'Diagnóstico actualizado exitosamente',
      data: repairRequest
    });
  } catch (error) {
    console.error('Error al actualizar diagnóstico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar diagnóstico',
      error: error.message
    });
  }
};

// Actualizar cotización de reparación (admin)
exports.updateRepairQuote = async (req, res) => {
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
    
    const repairRequest = await Repair.findById(id);
    
    if (!repairRequest) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de reparación no encontrada'
      });
    }
    
    // Verificar que exista un diagnóstico previo
    if (!repairRequest.diagnostico || !repairRequest.diagnostico.descripcion) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un diagnóstico antes de cotizar'
      });
    }
    
    // Actualizar cotización
    repairRequest.cotizacion = {
      monto,
      comentarios: comentarios || '',
      fecha: Date.now()
    };
    repairRequest.estado = 'cotizado';
    
    await repairRequest.save();
    
    res.status(200).json({
      success: true,
      message: 'Cotización actualizada exitosamente',
      data: repairRequest
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

// Actualizar estado de reparación (admin)
exports.updateRepairStatus = async (req, res) => {
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
    
    const repairRequest = await Repair.findById(id);
    
    if (!repairRequest) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de reparación no encontrada'
      });
    }
    
    // Actualizar estado
    repairRequest.estado = estado;
    
    // Actualizar fechas según el estado
    if (estado === 'reparacion') {
      repairRequest.fechaReparacion = Date.now();
    } else if (estado === 'completado') {
      repairRequest.fechaFinalizacion = Date.now();
      repairRequest.montoFinal = repairRequest.cotizacion.monto;
    }
    
    await repairRequest.save();
    
    res.status(200).json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: repairRequest
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

// Aceptar cotización de reparación (cliente)
exports.acceptRepairQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.idUsuario;
    
    const repairRequest = await Repair.findById(id);
    
    if (!repairRequest) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de reparación no encontrada'
      });
    }
    
    // Verificar si el usuario es el dueño de la solicitud
    if (repairRequest.idUsuario !== idUsuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para aceptar esta cotización'
      });
    }
    
    // Verificar si la solicitud está en estado cotizado
    if (repairRequest.estado !== 'cotizado') {
      return res.status(400).json({
        success: false,
        message: 'La solicitud no está en estado cotizado'
      });
    }
    
    // Actualizar a estado en proceso de reparación
    repairRequest.estado = 'reparacion';
    repairRequest.fechaReparacion = Date.now();
    
    await repairRequest.save();
    
    res.status(200).json({
      success: true,
      message: 'Cotización aceptada exitosamente',
      data: repairRequest
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

// Rechazar cotización de reparación (cliente)
exports.rejectRepairQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.user.idUsuario;
    
    const repairRequest = await Repair.findById(id);
    
    if (!repairRequest) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de reparación no encontrada'
      });
    }
    
    // Verificar si el usuario es el dueño de la solicitud
    if (repairRequest.idUsuario !== idUsuario) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para rechazar esta cotización'
      });
    }
    
    // Verificar si la solicitud está en estado cotizado
    if (repairRequest.estado !== 'cotizado') {
      return res.status(400).json({
        success: false,
        message: 'La solicitud no está en estado cotizado'
      });
    }
    
    // Actualizar a estado rechazado
    repairRequest.estado = 'rechazado';
    
    await repairRequest.save();
    
    res.status(200).json({
      success: true,
      message: 'Cotización rechazada exitosamente',
      data: repairRequest
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
