const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    autor: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    destinatario: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    comentario: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000
    },
    calificacion: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    tipo: {
      type: String,
      enum: ['compra', 'reparacion', 'reciclaje'],
      required: true
    },
    ventaId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Venta'
    },
    reparacionId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Repair'
    },
    recicljeId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Recycle'
    },
    visible: {
      type: Boolean,
      default: true
    },
    reportes: [
      {
        usuario: {
          type: mongoose.Schema.ObjectId,
          ref: 'User'
        },
        razon: String,
        fecha: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Índices
reviewSchema.index({ autor: 1 });
reviewSchema.index({ destinatario: 1 });
reviewSchema.index({ tipo: 1 });
reviewSchema.index({ createdAt: -1 });

// Middleware para poblar datos antes de devolver
reviewSchema.pre(/^find/, function(next) {
  if (this.options._recursed) {
    return next();
  }
  this.populate({
    path: 'autor',
    select: 'nombre apellido email foto'
  }).populate({
    path: 'destinatario',
    select: 'nombre apellido email foto'
  });
  next();
});

module.exports = mongoose.model('Review', reviewSchema);
