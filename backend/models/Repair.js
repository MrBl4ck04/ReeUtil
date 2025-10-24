const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema({
  repairId: {
    type: String,
    required: [true, 'El ID de reparación es requerido'],
    unique: true,
    default: function() {
      return 'REP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
  },
  tipoDispositivo: {
    type: String,
    required: [true, 'El tipo de dispositivo es requerido'],
    trim: true,
    maxlength: [100, 'El tipo de dispositivo no puede exceder 100 caracteres']
  },
  marca: {
    type: String,
    required: [true, 'La marca es requerida'],
    trim: true,
    maxlength: [100, 'La marca no puede exceder 100 caracteres']
  },
  modelo: {
    type: String,
    required: [true, 'El modelo es requerido'],
    trim: true,
    maxlength: [100, 'El modelo no puede exceder 100 caracteres']
  },
  descripcionProblema: {
    type: String,
    required: [true, 'La descripción del problema es requerida'],
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  usuario: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'La reparación debe estar asociada a un usuario']
  },
  fechaSolicitud: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['pendiente', 'evaluando', 'cotizado', 'en_reparacion', 'completado', 'rechazado'],
    default: 'pendiente'
  },
  cotizacion: {
    monto: {
      type: Number,
      min: [0, 'El monto no puede ser negativo']
    },
    tiempoEstimado: {
      type: String
    },
    detalles: {
      type: String,
      maxlength: [500, 'Los detalles no pueden exceder 500 caracteres']
    }
  },
  estadoReparacion: {
    type: String,
    maxlength: [200, 'El estado de reparación no puede exceder 200 caracteres']
  },
  fechaEstimadaFinalizacion: {
    type: Date
  },
  fechaFinalizacion: {
    type: Date
  },
  detallesReparacion: {
    type: String,
    maxlength: [500, 'Los detalles de reparación no pueden exceder 500 caracteres']
  },
  imagenes: [{
    type: String
  }]
});

// Índices para mejorar el rendimiento
repairSchema.index({ usuario: 1 });
repairSchema.index({ estado: 1 });
repairSchema.index({ fechaSolicitud: -1 });

// Middleware para popular el usuario automáticamente
repairSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'usuario',
    select: 'name email'
  });
  next();
});

const Repair = mongoose.model('Repair', repairSchema);

module.exports = Repair;
