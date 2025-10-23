const mongoose = require('mongoose');

const recycleSchema = new mongoose.Schema({
  idRecycle: {
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
  descripcion: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'evaluando', 'cotizado', 'completado', 'rechazado'],
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
  fechaFinalizacion: {
    type: Date
  },
  imagenes: [{
    type: String
  }],
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
  compensacionFinal: {
    type: Number
  },
  resena: {
    type: Boolean,
    default: false
  }
});

// Middleware para auto-incrementar idRecycle
recycleSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }
  
  try {
    const lastRecord = await this.constructor.findOne({}, {}, { sort: { 'idRecycle': -1 } });
    this.idRecycle = lastRecord ? lastRecord.idRecycle + 1 : 1;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Recycle', recycleSchema);
