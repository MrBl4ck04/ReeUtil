const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const ventasRoutes = require('./routes/ventas');
const employeesRoutes = require('./routes/employees');
const rolesRoutes = require('./routes/roles');
const permissionsRoutes = require('./routes/permissions');
const reviewsRoutes = require('./routes/reviews');
const dashboardRoutes = require('./routes/dashboard');
const repairsRoutes = require('./routes/repairs');

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
app.use('/api/reviews', reviewsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/repairs', repairsRoutes);

// Rutas de mock para evitar errores 404

app.get('/recycle/all', (req, res) => {
  res.json({ status: 'success', data: [] });
});

app.get('/marketplace/products', (req, res) => {
  res.json({ status: 'success', data: [] });
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de ReeUtil funcionando correctamente');
});

// Conexión a MongoDB
// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  tls: true,
  tlsAllowInvalidCertificates: true, // ignora certificados (solo para desarrollo)
  serverSelectionTimeoutMS: 10000,   // 10 segundos de espera
})
  .then(() => {
    console.log('✅ Conexión a MongoDB establecida correctamente');
    
    const PORT = process.env.PORT || 5500;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error al conectar a MongoDB:', err);
    process.exit(1);
  });
