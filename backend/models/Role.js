const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'Por favor ingresa el nombre del rol'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PermissionModule',
      },
    ],
    isSystem: {
      type: Boolean,
      default: false,
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

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
