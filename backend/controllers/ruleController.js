const Rule = require('../models/Rule');

exports.getAllRules = async (req, res) => {
  try {
    const rules = await Rule.find();
    res.status(200).json({
      status: 'success',
      results: rules.length,
      data: rules
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.getRule = async (req, res) => {
  try {
    const rule = await Rule.findById(req.params.id);
    if (!rule) {
      return res.status(404).json({
        status: 'error',
        message: 'Regla no encontrada'
      });
    }
    res.status(200).json({
      status: 'success',
      data: rule
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.createRule = async (req, res) => {
  try {
    const { nombre, descripcion, estado } = req.body;

    if (!nombre || !descripcion) {
      return res.status(400).json({
        status: 'error',
        message: 'Por favor proporciona nombre y descripción'
      });
    }

    const rule = await Rule.create({
      nombre,
      descripcion,
      estado: estado !== undefined ? estado : true
    });

    res.status(201).json({
      status: 'success',
      data: rule
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Ya existe una regla con ese nombre'
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.updateRule = async (req, res) => {
  try {
    const { nombre, descripcion, estado } = req.body;

    const rule = await Rule.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        descripcion,
        estado,
        fechaActualizacion: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!rule) {
      return res.status(404).json({
        status: 'error',
        message: 'Regla no encontrada'
      });
    }

    res.status(200).json({
      status: 'success',
      data: rule
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'error',
        message: 'Ya existe una regla con ese nombre'
      });
    }
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

exports.deleteRule = async (req, res) => {
  try {
    const rule = await Rule.findByIdAndDelete(req.params.id);

    if (!rule) {
      return res.status(404).json({
        status: 'error',
        message: 'Regla no encontrada'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Regla eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
