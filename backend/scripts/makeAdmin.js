const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Script para asignar rol de administrador a un usuario
async function makeUserAdmin(email) {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Buscar el usuario por email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ No se encontró usuario con email: ${email}`);
      return;
    }

    // Verificar si ya es admin
    if (user.role === 'admin') {
      console.log(`✅ El usuario ${email} ya es administrador`);
      return;
    }

    // Asignar rol de administrador
    user.role = 'admin';
    await user.save();

    console.log(`✅ Usuario ${email} ahora es administrador`);
    console.log(`   - Nombre: ${user.name}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Rol: ${user.role}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('Conexión cerrada');
  }
}

// Obtener email desde argumentos de línea de comandos
const email = process.argv[2];

if (!email) {
  console.log('❌ Uso: node makeAdmin.js <email>');
  console.log('   Ejemplo: node makeAdmin.js admin@example.com');
  process.exit(1);
}

// Ejecutar el script
makeUserAdmin(email);
