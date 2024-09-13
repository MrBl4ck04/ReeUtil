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

// Función para registrar usuarios
const registrarUsuario = async (req, res) => {
  console.log('Datos recibidos en el servidor:', req.body);
  const { apellido, pswd, direccion, email, txt, telefono } = req.body;

  // Verificar que todos los campos obligatorios se reciban correctamente
  if (!txt || !apellido || !email || !pswd) {
    return res.status(400).send('Faltan datos obligatorios');
  }

  try {
    // Hashear la contraseña antes de guardarla
    const salt = await bcrypt.genSalt(10); // Generar un salt con un factor de costo 10
    const hashedPassword = await bcrypt.hash(pswd, salt); // Hashear la contraseña

    // Asignar rol basado en el dominio del correo
    let rolAsignado = false;
    if (email.endsWith('@adm.bo')) {
      rolAsignado = true;
    }

    const nuevoUsuario = new Usuario({
      apellido: apellido,
      contraseA: hashedPassword, // Guardar la contraseña hasheada
      direccion: direccion,
      email: email,
      nombre: txt,
      rol: rolAsignado,  // Asignar rol basado en el dominio del correo
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

// Función para manejar el login del usuario
const loginUsuario = async (req, res) => {
  const { email, pswd } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const validPassword = await bcrypt.compare(pswd, usuario.contraseA);
    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    res.json({
      idUsuario: usuario.idUsuario.toString(), // Convertir idUsuario a cadena
      redirect: usuario.rol ? 'adminPrincipal.html' : 'clientesPrincipal.html'
    });
  } catch (error) {
    console.error('Error en el proceso de login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario
};
