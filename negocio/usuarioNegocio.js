const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const AutoIncrement = require('mongoose-sequence')(mongoose);

// Definir esquema de usuario correctamente
const usuarioSchema = new mongoose.Schema({
  apellido: String,
  contraseA: String, // Aquí se guardará la contraseña hasheada
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

// // Función para validar la contraseña
// const validarContraseña = (contraseña) => {
//   const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
//   return regex.test(contraseña);
// };

// Función para registrar usuarios
const registrarUsuario = async (req, res) => {
  console.log('Datos recibidos en el servidor:', req.body);
  const { apellido, pswd, direccion, email, txt, telefono } = req.body;

  // Verificar que todos los campos obligatorios se reciban correctamente
  if (!txt || !apellido || !email || !pswd) {
    return res.status(400).send('Faltan datos obligatorios');
  }

  // Validar la contraseña
  // if (!validarContraseña(pswd)) {
  //   return res.status(400).send('La contraseña debe tener al menos 8 caracteres, un número y un carácter especial.');
  // }

  // Hashear la contraseña antes de guardarla
  try {
    const salt = await bcrypt.genSalt(10); // Generar un salt con un factor de costo 10
    const hashedPassword = await bcrypt.hash(pswd, salt); // Hashear la contraseña

    const nuevoUsuario = new Usuario({
      apellido: apellido,
      contraseA: hashedPassword, // Guardar la contraseña hasheada
      direccion: direccion,
      email: email,
      nombre: txt,
      rol: false,  // Siempre será false
      telefono: telefono
    });

    // Guardar usuario en MongoDB
    await nuevoUsuario.save();
    res.status(200).send('Usuario registrado con éxito');

  } catch (err) {
    console.error('Error al guardar usuario en MongoDB:', err); // Mostrar error en la consola
    res.status(500).send(`Error al registrar usuario: ${err.message}`);
  }
};

module.exports = {
  registrarUsuario
};
