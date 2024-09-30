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
  
module.exports = mongoose.models.Dispositivo || mongoose.model('Dispositivo', dispositivoSchema);
