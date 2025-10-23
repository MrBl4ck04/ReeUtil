const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema({
  idRepair: {
    type: Number,
    required: true,
    unique: true
  },
  tipoDispositivo: {
    type: String,
    required: true
  },
  marca: {
    type: String,
    required: true
  },
  modelo: {
    type: String,
    required: true
  },
  descripcionProblema: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'diagnosticado', 'cotizado', 'reparacion', 'completado', 'rechazado'],
    default: 'pendiente'
  },
  idUsuario: {
    type: Number,
    ref: 'User',
    required: true
  },
  fechaSolicitud: {
    type: Date,
    default: Date.now
  },
  fechaDiagnostico: {
    type: Date
  },
  fechaReparacion: {
    type: Date
  },
  fechaFinalizacion: {
    type: Date
  },
  imagenes: [{
    type: String
  }],
  diagnostico: {
    descripcion: {
      type: String
    },
    fecha: {
      type: Date
    }
  },
  cotizacion: {
    monto: {
      type: Number
    },
    comentarios: {
      type: String
    },
    fecha: {
      type: Date
    }
  },
  resena: {
    type: Boolean,
    default: false
  },
  montoFinal: {
    type: Number
  }
});

// Middleware para auto-incrementar idRepair
repairSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  try {
    const lastRecord = await this.constructor.findOne({}, {}, { sort: { 'idRepair': -1 } });
    this.idRepair = lastRecord ? lastRecord.idRepair + 1 : 1;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Repair', repairSchema);
