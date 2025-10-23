const mongoose = require('mongoose');

const permissionModuleSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: [true, 'Por favor ingresa el ID del módulo'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    nombre: {
      type: String,
      required: [true, 'Por favor ingresa el nombre del módulo'],
      trim: true,
    },
    display: {
      type: String,
      required: [true, 'Por favor ingresa el nombre a mostrar'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: 'Settings',
    },
    orden: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const PermissionModule = mongoose.model('PermissionModule', permissionModuleSchema);

module.exports = PermissionModule;
