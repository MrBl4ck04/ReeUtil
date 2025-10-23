const Employee = require('../../models/Employee');
const Role = require('../../models/Role');

// Obtener todos los empleados
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate('roleId', 'nombre description')
      .populate('customPermissions', 'moduleId nombre display icon')
      .select('-contraseA');

    res.status(200).json(employees);  // Solo devuelve el array
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Obtener empleado por ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('roleId', 'nombre description')
      .populate('customPermissions', 'moduleId nombre display icon')
      .select('-contraseA');

    if (!employee) {
      return res.status(404).json({
        status: 'fail',
        message: 'Empleado no encontrado',
      });
    }

    res.status(200).json({
      status: 'success',
      data: employee,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Crear nuevo empleado
exports.createEmployee = async (req, res) => {
  try {
    const { nombre, apellido, email, contraseA, cargo, roleId } = req.body;

    // Validar que el rol existe
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        status: 'fail',
        message: 'Rol no encontrado',
      });
    }

    // Crear empleado
    const newEmployee = await Employee.create({
      nombre,
      apellido,
      email,
      contraseA,
      cargo,
      roleId,
    });

    // Populate para la respuesta
    await newEmployee.populate('roleId', 'nombre description');

    res.status(201).json({
      status: 'success',
      data: newEmployee,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Actualizar empleado
exports.updateEmployee = async (req, res) => {
  try {
    const { nombre, apellido, email, cargo, roleId, isActive } = req.body;

    const updateData = { nombre, apellido, email, cargo, isActive };
    if (roleId) updateData.roleId = roleId;

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('roleId', 'nombre description')
      .populate('customPermissions', 'moduleId nombre display icon')
      .select('-contraseA');

    if (!employee) {
      return res.status(404).json({
        status: 'fail',
        message: 'Empleado no encontrado',
      });
    }

    res.status(200).json({
      status: 'success',
      data: employee,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Eliminar empleado
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        status: 'fail',
        message: 'Empleado no encontrado',
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

// Resetear contraseña de empleado
exports.resetEmployeePassword = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        status: 'fail',
        message: 'Empleado no encontrado',
      });
    }

    // Generar contraseña temporal
    const tempPassword = Math.random().toString(36).slice(-12);

    employee.contraseA = tempPassword;
    await employee.save();

    res.status(200).json({
      status: 'success',
      message: 'Contraseña reseteada correctamente',
      tempPassword: tempPassword, // En producción, enviar por email
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Obtener permisos de un empleado
exports.getEmployeePermissions = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('roleId', 'permissions')
      .populate('customPermissions');

    if (!employee) {
      return res.status(404).json({
        status: 'fail',
        message: 'Empleado no encontrado',
      });
    }

    const allPermissions = await employee.getAllPermissions();

    res.status(200).json({
      status: 'success',
      data: {
        roleId: employee.roleId?._id,
        roleName: employee.roleId?.nombre,
        permissions: allPermissions,
        customPermissions: employee.customPermissions,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Actualizar permisos personalizados
exports.updateEmployeePermissions = async (req, res) => {
  try {
    const { customPermissions } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { customPermissions },
      { new: true, runValidators: true }
    ).populate('customPermissions');

    if (!employee) {
      return res.status(404).json({
        status: 'fail',
        message: 'Empleado no encontrado',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Permisos actualizados correctamente',
      data: employee.customPermissions,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

// Bloquear/Desbloquear empleado
exports.toggleBlockEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        status: 'fail',
        message: 'Empleado no encontrado',
      });
    }

    employee.isBlocked = !employee.isBlocked;
    employee.loginAttempts = 0;
    await employee.save();

    res.status(200).json({
      status: 'success',
      message: `Empleado ${employee.isBlocked ? 'bloqueado' : 'desbloqueado'}`,
      data: { isBlocked: employee.isBlocked },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
