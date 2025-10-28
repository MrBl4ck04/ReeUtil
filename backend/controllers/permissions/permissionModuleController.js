const PermissionModule = require('../../models/PermissionModule');

// Obtener todos los módulos
exports.getAllModules = async (req, res) => {
  try {
    const modules = await PermissionModule.find({ isActive: true })
      .sort({ orden: 1 });

    res.status(200).json({
      status: 'success',
      results: modules.length,
      data: modules,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Obtener módulo por ID
exports.getModuleById = async (req, res) => {
  try {
    const module = await PermissionModule.findById(req.params.id);

    if (!module) {
      return res.status(404).json({
        status: 'fail',
        message: 'Módulo no encontrado',
      });
    }

    res.status(200).json({
      status: 'success',
      data: module,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Crear nuevo módulo
exports.createModule = async (req, res) => {
  try {
    const { moduleId, nombre, display, description, icon, orden } = req.body;

    const newModule = await PermissionModule.create({
      moduleId,
      nombre,
      display,
      description,
      icon: icon || 'Settings',
      orden: orden || 0,
    });

    res.status(201).json({
      status: 'success',
      data: newModule,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Actualizar módulo
exports.updateModule = async (req, res) => {
  try {
    const { nombre, display, description, icon, orden, isActive } = req.body;

    const module = await PermissionModule.findByIdAndUpdate(
      req.params.id,
      { nombre, display, description, icon, orden, isActive },
      { new: true, runValidators: true }
    );

    if (!module) {
      return res.status(404).json({
        status: 'fail',
        message: 'Módulo no encontrado',
      });
    }

    res.status(200).json({
      status: 'success',
      data: module,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Eliminar módulo
exports.deleteModule = async (req, res) => {
  try {
    const module = await PermissionModule.findByIdAndDelete(req.params.id);

    if (!module) {
      return res.status(404).json({
        status: 'fail',
        message: 'Módulo no encontrado',
      });
    }

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
