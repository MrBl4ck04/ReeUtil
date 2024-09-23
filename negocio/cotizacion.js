const mongoose = require('mongoose');

const cotizacionSchema = new mongoose.Schema({
    idDispositivo: { type: Number, required: true },
    idCatalogo: { type: Number, required: true },
    fecha: { type: Date, default: Date.now },
    estadoCotizaci: { type: String, enum: ['aceptado', 'Para reciclar', 'Para vender'], required: true },
    cotizacion: { type: Number, required: true },
});

const Cotizacion = mongoose.model('Cotizacion', cotizacionSchema);

module.exports = Cotizacion;
