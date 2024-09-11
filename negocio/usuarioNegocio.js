const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Definir esquema de usuario correctamente
const usuarioSchema = new mongoose.Schema({
  apellido: String,
  contraseA: String,
  direccion: String,
  email: String,
  nombre: String,
  rol: { type: Boolean, default: false }, // Siempre por defecto false
  telefono: String
}, {
  versionKey: false // Eliminar el campo __v
});

// Añadir autoincremento a idUsuario
usuarioSchema.plugin(AutoIncrement, { inc_field: 'idUsuario' });

// Modelo basado en el esquema
const Usuario = mongoose.model('usuarios', usuarioSchema);

// Función para registrar usuarios
const registrarUsuario = (req, res) => {
  console.log('Datos recibidos en el servidor:', req.body);
  const { apellido, pswd, direccion, email, txt, telefono } = req.body; // Remover 'rol'

  // Verificar que todos los campos obligatorios se reciban correctamente
  if (!txt || !apellido || !email || !pswd) {
    return res.status(400).send('Faltan datos obligatorios');
  }

  const nuevoUsuario = new Usuario({
    apellido: apellido,
    contraseA: pswd,
    direccion: direccion,
    email: email,
    nombre: txt,
    rol: false,  // Siempre será false
    telefono: telefono
  });

  // Guardar usuario en MongoDB
  nuevoUsuario.save((err) => {
    if (err) {
      console.error('Error al guardar usuario en MongoDB:', err); // Mostrar error en la consola
      return res.status(500).send(`Error al registrar usuario: ${err.message}`);
    }
    res.status(200).send('Usuario registrado con éxito');
  });
};

module.exports = {
  registrarUsuario
};
