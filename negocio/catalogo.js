const mongoose = require('mongoose');

const catalogoSchema = new mongoose.Schema({
  nombre: String,
  marca: String,
  modelo: String,
  descripcion: String,
  tipo: String,
  idUsuario: mongoose.Schema.Types.ObjectId
}, { collection: 'catalogo' }); // Especifica el nombre de la colección


module.exports = mongoose.model('catalogo', catalogoSchema);
