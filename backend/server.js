const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const authRoutes = require('./routes/auth');
const ventasRoutes = require('./routes/ventas');
const employeesRoutes = require('./routes/employees');
const rolesRoutes = require('./routes/roles');
const permissionsRoutes = require('./routes/permissions');
const reviewsRoutes = require('./routes/reviews');
const dashboardRoutes = require('./routes/dashboard');
const rulesRoutes = require('./routes/rules');
const repairsRoutes = require('./routes/repairs');
const recycleRoutes = require('./routes/recycle');
const logsRoutes = require('./routes/logs');

// Cargar variables de entorno
dotenv.config();

// Inicializar Express
const app = express();

// Middleware
// Configurar trust proxy de forma segura (evita configuración permisiva incompatible con express-rate-limit)
app.set('trust proxy', process.env.TRUST_PROXY || 'loopback');

// CORS restrictivo por defecto (seguridad por defecto)
app.use(cors({
  origin: (origin, callback) => {
    const allowed = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!origin || allowed.length === 0 || allowed.includes(origin)) return callback(null, true);
    return callback(new Error('Origen no permitido por CORS'));
  },
  credentials: true
}));

// HTTP headers endurecidos
app.use(helmet());
// Política de COEP/CORP/CSP básica; puede ajustarse por frontend
app.use(helmet.crossOriginResourcePolicy({ policy: 'same-site' }));

// Rate limit para todas las rutas de API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

// SEGURIDAD: Rate limit más estricto para recuperación de contraseña (prevenir abuso)
// IMPORTANTE: Debe ir ANTES del rate limiter general de /auth para que tenga prioridad
app.use('/auth/send-verification-code', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 'fail',
    message: 'Demasiados intentos de recuperación. Intenta nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Rate limit general para rutas de autenticación
app.use('/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use('/api', apiLimiter);

// Body parser
app.use(express.json());

// Sanitización contra NoSQL injection y XSS
app.use(mongoSanitize());
app.use(xss());

// Prevención de HPP con lista blanca de parámetros repetidos
app.use(hpp({ whitelist: ['precioMin', 'precioMax', 'categoria', 'estado', 'condicion', 'search'] }));

// Compresión de respuestas
app.use(compression());

// Rutas
app.use('/auth', authRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/repairs', repairsRoutes);
app.use('/recycle', recycleRoutes);
app.use('/api/logs', logsRoutes);

// Rutas de mock para evitar errores 404

app.get('/marketplace/products', (req, res) => {
  res.json({ status: 'success', data: [] });
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de ReeUtil funcionando correctamente');
});

// Conexión a MongoDB
mongoose.set('strictQuery', true);

const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
};

// Solo permitir certificados inválidos en desarrollo explícitamente
if (process.env.NODE_ENV === 'development') {
  mongoOptions.tls = true;
  mongoOptions.tlsAllowInvalidCertificates = true;
}

mongoose.connect(process.env.MONGODB_URI, mongoOptions)
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
