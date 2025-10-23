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
    default: generateUserId
  },
  name: {
    type: String,
    required: [true, 'Por favor ingresa tu nombre']
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
  createdAt: {
    type: Date,
    default: Date.now
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

// Middleware para encriptar la contraseña antes de guardarla
userSchema.pre('save', async function(next) {
  // Solo encriptar si la contraseña ha sido modificada
  if (!this.isModified('password')) return next();
  
  // Encriptar la contraseña con un costo de 12
  this.password = await bcrypt.hash(this.password, 12);
  
  // Eliminar passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

// Método para comparar contraseñas
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;