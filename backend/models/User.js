const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto');

// Función para generar un ID de usuario con formato estándar
const generateUserId = () => {
  // Formato: USR-XXXX-XXXX donde X es alfanumérico
  const segment1 = crypto.randomBytes(2).toString('hex').toUpperCase();
  const segment2 = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `USR-${segment1}-${segment2}`;
};

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: [true, 'El código de usuario es requerido']
  },
  name: {
    type: String,
    required: [true, 'Por favor ingresa tu nombre']
  },
  // Nuevo: Apellido paterno
  lastName: {
    type: String,
    required: [true, 'Por favor ingresa tu apellido paterno']
  },
  // Nuevo: Apellido materno
  motherLastName: {
    type: String,
    required: [true, 'Por favor ingresa tu apellido materno']
  },
  // Nuevo: Género (M, F, N, O)
  gender: {
    type: String,
    enum: ['M', 'F', 'N', 'O'],
    required: [true, 'Por favor selecciona tu género']
  },
  email: {
    type: String,
    required: [true, 'Por favor ingresa tu correo electrónico'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Por favor ingresa un correo electrónico válido']
  },
  password: {
    type: String,
    required: [true, 'Por favor ingresa una contraseña'],
    minlength: 12,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Por favor confirma tu contraseña'],
    validate: {
      // Esta validación solo funciona en CREATE y SAVE
      validator: function(el) {
        return el === this.password;
      },
      message: 'Las contraseñas no coinciden'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // NUEVO: Fecha de último cambio de contraseña
  passwordChangedAt: {
    type: Date,
    default: Date.now
  },
  // NUEVO: Historial de contraseñas (hashes)
  passwordHistory: {
    type: [String],
    select: false,
    default: []
  },
  // NUEVO: Contador de intentos fallidos de login
  loginAttempts: {
    type: Number,
    default: 0
  },
  // NUEVO: Estado de bloqueo de cuenta
  isBlocked: {
    type: Boolean,
    default: false
  },
  // NUEVO: Fecha de bloqueo de cuenta
  blockedAt: {
    type: Date,
    default: null
  }
});

// Middleware para validar la fortaleza de la contraseña
userSchema.pre('save', function(next) {
  // Verificar si la contraseña tiene al menos una mayúscula
  if (!/[A-Z]/.test(this.password)) {
    const error = new Error('La contraseña debe contener al menos una letra mayúscula');
    return next(error);
  }
  
  // Verificar si la contraseña tiene al menos un símbolo especial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(this.password)) {
    const error = new Error('La contraseña debe contener al menos un símbolo especial');
    return next(error);
  }
  
  next();
});

// Middleware para encriptar la contraseña antes de guardarla y actualizar historial/fecha
userSchema.pre('save', async function(next) {
  // Solo encriptar si la contraseña ha sido modificada
  if (!this.isModified('password')) return next();
  
  const hashed = await bcrypt.hash(this.password, 12);
  this.password = hashed;
  
  // Eliminar passwordConfirm
  this.passwordConfirm = undefined;
  
  // Actualizar fecha de cambio de contraseña
  this.passwordChangedAt = Date.now();
  
  // Inicializar historial si no existe y agregar el hash actual si no está
  if (!Array.isArray(this.passwordHistory)) this.passwordHistory = [];
  if (!this.passwordHistory.includes(hashed)) {
    this.passwordHistory.push(hashed);
  }
  if (this.passwordHistory.length > 3) {
    this.passwordHistory = this.passwordHistory.slice(-3);
  }

  next();
});

// Método para comparar contraseñas
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// NUEVO: Método para verificar si la contraseña está expirada (60 días)
userSchema.methods.isPasswordExpired = function() {
  const lastChange = this.passwordChangedAt || this.createdAt;
  const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(lastChange).getTime() > SIXTY_DAYS_MS;
};

const User = mongoose.model('User', userSchema);

module.exports = User;