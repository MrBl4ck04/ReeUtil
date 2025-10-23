const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  ventaId: {
    type: String,
    required: [true, 'El ID de venta es requerido'],
    unique: true,
    default: function() {
      return 'VTA-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
  },
  nombre: {
    type: String,
    required: [true, 'El nombre del dispositivo es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  usuario: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'La venta debe estar asociada a un usuario']
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['venta', 'disponible', 'vendido', 'pausado'],
    default: 'venta'
  },
  categoria: {
    type: String,
    enum: ['smartphone', 'tablet', 'laptop', 'desktop', 'accesorio', 'otro'],
    default: 'otro'
  },
  condicion: {
    type: String,
    enum: ['nuevo', 'usado-excelente', 'usado-bueno', 'usado-regular'],
    default: 'usado-bueno'
  }
});

// Índices para mejorar el rendimiento
ventaSchema.index({ usuario: 1 });
ventaSchema.index({ estado: 1 });
ventaSchema.index({ categoria: 1 });
ventaSchema.index({ precio: 1 });

// Middleware para popular el usuario automáticamente
ventaSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'usuario',
    select: 'name email'
  });
  next();
});

const Venta = mongoose.model('Venta', ventaSchema);

module.exports = Venta;