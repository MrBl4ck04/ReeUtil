const mongoose = require('mongoose');

const reglaSchema = new mongoose.Schema({
    idReglas: { type: Number, required: true, unique: true }, // autoincrementado
    nombreRegla: { type: String, required: true },
    descripcionRE: { type: String, required: true },
    idCatalogo: { type: mongoose.Schema.Types.ObjectId, ref: 'Catalogo', required: true },
});

const Regla = mongoose.model('Reglas', reglaSchema);

module.exports = Regla;
