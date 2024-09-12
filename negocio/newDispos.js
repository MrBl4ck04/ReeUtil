const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Definir el esquema para dispositivos
const dispositivoSchema = new mongoose.Schema({
  idCatalogo: Number, // Este campo será autoincrementable
  descripcion: String,
  idUsuario: { type: Number, default: null }, // Por defecto, será null
  imagenProdu: String,
  marca: String,
  modelo: String,
  nombre: String,
  tipo: String
}, {
  versionKey: false // Eliminar el campo __v
});

// Añadir autoincremento a idCatalogo
dispositivoSchema.plugin(AutoIncrement, { inc_field: 'idCatalogo' });

// Modelo basado en el esquema, con la colección 'catalogo'
const Dispositivo = mongoose.model('Dispositivo', dispositivoSchema, 'catalogo');

// Función para registrar un dispositivo
const registrarDispositivo = async (req, res) => {
  const { descripcion, imagenProdu, marca, modelo, nombre, tipo } = req.body;

  if (!descripcion || !imagenProdu || !marca || !modelo || !nombre || !tipo) {
    return res.status(400).send('Faltan datos obligatorios');
  }

  try {
    // Crear una nueva instancia del modelo
    const nuevoDispositivo = new Dispositivo({
      descripcion,
      imagenProdu,
      marca,
      modelo,
      nombre,
      tipo
    });

    console.log('Datos que se intentan guardar:', nuevoDispositivo);

    // Guardar el dispositivo en la base de datos
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
