const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const recycleRoutes = require('./routes/recycle');
const repairsRoutes = require('./routes/repairs');

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Rutas
app.use('/auth', authRoutes);
app.use('/recycle', recycleRoutes);
app.use('/repairs', repairsRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de ReeUtil funcionando correctamente');
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conexión a MongoDB establecida correctamente');
    
    // Iniciar servidor
    const PORT = process.env.PORT || 5500;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err.message);
    process.exit(1);
  });