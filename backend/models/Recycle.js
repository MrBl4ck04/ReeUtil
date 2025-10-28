const mongoose = require('mongoose');

const recycleSchema = new mongoose.Schema({
  recycleId: {
    type: String,
    required: [true, 'El ID de reciclaje es requerido'],
    unique: true,
    default: function() {
      return 'REC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
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
  estadoDispositivo: {
    type: String,
    required: [true, 'El estado del dispositivo es requerido'],
    enum: ['funcional', 'parcialmente_funcional', 'no_funcional'],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  usuario: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'El reciclaje debe estar asociado a un usuario']
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
      type: String,
      maxlength: [100, 'El tiempo estimado no puede exceder 100 caracteres']
    },
    detalles: {
      type: String,
      maxlength: [500, 'Los detalles no pueden exceder 500 caracteres']
    }
  },
  fechaFinalizacion: {
    type: Date
  },
  imagenes: [{
    type: String
  }]
});

// Índices para mejorar el rendimiento
recycleSchema.index({ usuario: 1 });
recycleSchema.index({ estado: 1 });
recycleSchema.index({ fechaSolicitud: -1 });

// Middleware para popular el usuario automáticamente
recycleSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'usuario',
    select: 'name email'
  });
  next();
});

const Recycle = mongoose.model('Recycle', recycleSchema);

module.exports = Recycle;
