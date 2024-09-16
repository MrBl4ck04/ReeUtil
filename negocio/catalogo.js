
const mongoose = require('mongoose');

// Definir el esquema para el catálogo
const catalogoSchema = new mongoose.Schema({
  idCatalogo: Number,
  descripcion: String,
  idUsuario: { type: Number, default: null },
  imagenProdu: String,
  marca: String,
  modelo: String,
  nombre: String,
  tipo: String
}, {
  versionKey: false
});

const cat = mongoose.model('cat', catalogoSchema,'catalogo');

const obtenerCatalogo = async (req, res) => {
    try {
        const dispositivos = await cat.find({});
        res.status(200).json(dispositivos);
      } catch (err) {
        console.error('Error al obtener los dispositivos:', err);
        res.status(500).send(`Error al obtener los dispositivos: ${err.message}`);
      }
};

  module.exports = {
    obtenerCatalogo
  };