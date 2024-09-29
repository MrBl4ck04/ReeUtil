const mongoose = require("mongoose");

const dispositivoSchema = new mongoose.Schema({
    cotizacion: { type: Number, default: null },
    detalles: String,
    estadoCotizaci: { type: String, default: 'En Curso' },
    estadoDisposit: String,
    fecha: { type: Date, default: Date.now },
    idCatalogo: { type: Number, default: null },
    idUsuario: { type: Number, default: null },
    imagen: String
  });
  
  // Este nombre 'Dispositivo' es el nombre del modelo, pero MongoDB usará la colección 'dispositivos' en plural
  module.exports = mongoose.models.Dispositivo || mongoose.model('Dispositivo', dispositivoSchema);
