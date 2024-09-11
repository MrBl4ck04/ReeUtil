// negocio/usuarioNegocio.js
const mongoose = require('mongoose');

// Definir esquema de usuario correctamente
const usuarioSchema = new mongoose.Schema({
  
  apellido: String,
  contraseA: String,
  direccion: String,
  email: String,
  nombre: String,
  rol: Boolean,
  telefono: String
});

// Modelo basado en el esquema
const Usuario = mongoose.model('Usuario', usuarioSchema);

// Función para registrar usuarios
// negocio/usuarioNegocio.js
const registrarUsuario = (req, res) => {
    console.log('Datos recibidos en el servidor:', req.body);
    const { apellido, pswd, direccion, email, txt, rol, telefono } = req.body;
  
    // Verificar que todos los campos obligatorios se reciban correctamente
    if (!txt || !apellido || !email || !pswd) {
      return res.status(400).send('Faltan datos obligatorios', txt, apellido);
      
    }
  
    const nuevoUsuario = new Usuario({
        apellido: apellido,
        contraseA: pswd,
        direccion: direccion,
        email: email,
        nombre: txt,
        rol: rol ? true : false,  // Si no se envía, lo marcamos como false
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
