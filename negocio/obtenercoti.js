
const mongoose = require('mongoose');

const cotizarSchema = new mongoose.Schema({
    cotizacion: { type: Number, default: null }, 
    detalles: String,
    estadoCotizaci: { type: String, default: 'En Curso'}, 
    estadoDisposit: String,
    fecha: { type: Date, default: Date.now }, 
    idCatalogo: { type: Number, default: null }, 
    idUsuario: { type: Number, default: null }, 
    imagen: String 
}, {
  versionKey: false 
});

const  cot = mongoose.model('cot', cotizarSchema,'dispositivos');

const obtenercoti = async (req, res) => {
    try {
        const dispositivos = await cot.find({});
        res.status(200).json(dispositivos);
    } catch (err) {
        console.error('Error al obtener los dispositivos:', err);
        res.status(500).send(`Error al obtener los dispositivos: ${err.message}`);
    }
};

  module.exports = {
    obtenercoti
  };