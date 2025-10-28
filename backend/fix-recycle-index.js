const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('recycles');

    // Obtener todos los índices
    const indexes = await collection.indexes();
    console.log('📋 Índices actuales:', indexes);

    // Eliminar el índice problemático si existe
    try {
      await collection.dropIndex('idRecycle_1');
      console.log('✅ Índice idRecycle_1 eliminado');
    } catch (err) {
      console.log('ℹ️  El índice idRecycle_1 no existe o ya fue eliminado');
    }

    // Verificar índices después
    const indexesAfter = await collection.indexes();
    console.log('📋 Índices después:', indexesAfter);

    console.log('✅ Proceso completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixIndex();
