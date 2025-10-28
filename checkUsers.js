const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config();

// Script para verificar usuarios y sus roles
async function checkUsers() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener todos los usuarios
    const users = await User.find({}).select('name email role createdAt');
    
    console.log(`\n📊 Total de usuarios: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('❌ No hay usuarios registrados');
      return;
    }

    // Mostrar información de cada usuario
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   👤 Rol: ${user.role || 'user'}`);
      console.log(`   📅 Creado: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });

    // Contar usuarios por rol
    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role === 'user' || !u.role).length;
    
    console.log('📈 Resumen:');
    console.log(`   👑 Administradores: ${adminCount}`);
    console.log(`   👤 Usuarios normales: ${userCount}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar el script
checkUsers();
