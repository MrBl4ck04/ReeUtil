const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const ventasRoutes = require('./routes/ventas');
const employeesRoutes = require('./routes/employees');
const rolesRoutes = require('./routes/roles');
const permissionsRoutes = require('./routes/permissions');

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// Rutas
app.use('/auth', authRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/permissions', permissionsRoutes);

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