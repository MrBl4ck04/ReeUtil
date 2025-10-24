const mongoose = require('mongoose');
const Repair = require('../models/Repair');
require('dotenv').config();

async function dropOldIndexes() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener todos los índices actuales
    const indexes = await Repair.collection.getIndexes();
    console.log('\n📋 Índices actuales:');
    console.log(JSON.stringify(indexes, null, 2));

    // Intentar eliminar el índice problemático si existe
    try {
      await Repair.collection.dropIndex('idRepair_1');
      console.log('\n✅ Índice "idRepair_1" eliminado correctamente');
    } catch (error) {
      if (error.code === 27) {
        console.log('\n⚠️  El índice "idRepair_1" no existe (esto es normal)');
      } else {
        throw error;
      }
    }

    // Sincronizar índices del modelo
    await Repair.syncIndexes();
    console.log('✅ Índices sincronizados con el modelo');

    // Mostrar índices finales
    const finalIndexes = await Repair.collection.getIndexes();
    console.log('\n📋 Índices finales:');
    console.log(JSON.stringify(finalIndexes, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

dropOldIndexes();
