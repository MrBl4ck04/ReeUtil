const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Por favor proporciona un nombre para la regla'],
    unique: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'Por favor proporciona una descripción'],
    trim: true
  },
  estado: {
    type: Boolean,
    default: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Rule', ruleSchema);
