const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const employeeSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'Por favor ingresa tu nombre'],
      trim: true,
    },
    apellido: {
      type: String,
      required: [true, 'Por favor ingresa tu apellido'],
      trim: true,
    },
    apellidoMaterno: {
      type: String,
      required: [true, 'Por favor ingresa tu apellido materno'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Por favor ingresa tu correo electrónico'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Por favor ingresa un correo electrónico válido'],
    },
    contraseA: {
      type: String,
      required: [true, 'Por favor ingresa una contraseña'],
      minlength: 8,
      select: false,
    },
    cargo: {
      type: String,
      trim: true,
    },
    genero: {
      type: String,
      required: [true, 'Por favor selecciona tu género'],
      enum: ['M', 'F', 'N', 'O'],
    },
    userId: {
      type: String,
      unique: true,
      index: true,
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, 'Por favor asigna un rol'],
    },
    customPermissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PermissionModule',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
    },
    fotoPerfil: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Middleware para encriptar la contraseña antes de guardarla
employeeSchema.pre('save', async function (next) {
  // Solo encriptar si la contraseña ha sido modificada
  if (!this.isModified('contraseA')) return next();

  // Encriptar la contraseña con un costo de 12
  this.contraseA = await bcrypt.hash(this.contraseA, 12);
  next();
});

// Método para comparar contraseñas
employeeSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Método para obtener todos los permisos (del rol + permisos personalizados)
employeeSchema.methods.getAllPermissions = async function () {
  await this.populate(['roleId', 'customPermissions']);
  const rolePermissions = this.roleId.permissions || [];
  const customPerms = this.customPermissions.map((p) => p.moduleId) || [];
  return [...new Set([...rolePermissions, ...customPerms])];
};

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
