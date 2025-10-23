const Role = require('../../models/Role');
const PermissionModule = require('../../models/PermissionModule');

// Obtener todos los roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find()
      .populate('permissions', 'moduleId nombre display icon');

    res.status(200).json({
      status: 'success',
      results: roles.length,
      data: roles,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Obtener rol por ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id)
      .populate('permissions', 'moduleId nombre display icon');

    if (!role) {
      return res.status(404).json({
        status: 'fail',
        message: 'Rol no encontrado',
      });
    }

    res.status(200).json({
      status: 'success',
      data: role,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Crear nuevo rol
exports.createRole = async (req, res) => {
  try {
    const { nombre, description, permissions } = req.body;

    const newRole = await Role.create({
      nombre,
      description,
      permissions,
      isSystem: false,
    });

    await newRole.populate('permissions', 'moduleId nombre display icon');

    res.status(201).json({
      status: 'success',
      data: newRole,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Actualizar rol
exports.updateRole = async (req, res) => {
  try {
    const { nombre, description, permissions } = req.body;

    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        status: 'fail',
        message: 'Rol no encontrado',
      });
    }

    // No permitir modificar roles del sistema
    if (role.isSystem) {
      return res.status(403).json({
        status: 'fail',
        message: 'No puedes modificar un rol del sistema',
      });
    }

    role.nombre = nombre || role.nombre;
    role.description = description || role.description;
    if (permissions) role.permissions = permissions;

    await role.save();
    await role.populate('permissions', 'moduleId nombre display icon');

    res.status(200).json({
      status: 'success',
      data: role,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Eliminar rol
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        status: 'fail',
        message: 'Rol no encontrado',
      });
    }

    if (role.isSystem) {
      return res.status(403).json({
        status: 'fail',
        message: 'No puedes eliminar un rol del sistema',
      });
    }

    await Role.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
