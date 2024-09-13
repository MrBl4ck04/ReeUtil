const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const dispositivoSchema = new mongoose.Schema({
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

dispositivoSchema.plugin(AutoIncrement, { inc_field: 'idCatalogo' });

const Dispositivo = mongoose.model('Dispositivo', dispositivoSchema, 'catalogo');

const registrarDispositivo = async (req, res) => {
  const { descripcion, imagenProdu, marca, modelo, nombre, tipo, idUsuario } = req.body;

  // Convertir idUsuario a número, si es posible
  const idUsuarioNum = parseInt(idUsuario, 10);

  if (!descripcion || !imagenProdu || !marca || !modelo || !nombre || !tipo) {
    return res.status(400).send('Faltan datos obligatorios');
  }

  try {
    const nuevoDispositivo = new Dispositivo({
      descripcion,
      imagenProdu,
      marca,
      modelo,
      nombre,
      tipo,
      idUsuario: isNaN(idUsuarioNum) ? null : idUsuarioNum // Asignar null si idUsuario no es un número válido
    });

    console.log('Datos que se intentan guardar:', nuevoDispositivo);

    const resultado = await nuevoDispositivo.save();
    console.log('Dispositivo guardado en la base de datos:', resultado);

    res.status(200).send('Dispositivo registrado con éxito');
  } catch (err) {
    console.error('Error al guardar dispositivo en MongoDB:', err);
    res.status(500).send(`Error al registrar dispositivo: ${err.message}`);
  }
};

module.exports = {
  registrarDispositivo
};
