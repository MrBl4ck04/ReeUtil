const Employee = require('../../models/Employee');
const Role = require('../../models/Role');
const User = require('../../models/User');
const { logEvent } = require('../../services/auditService');

// Obtener todos los empleados
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true })
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

// Obtener empleados bloqueados
exports.getBlockedEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ isBlocked: true, isActive: true })
      .populate('roleId', 'nombre description')
      .populate('customPermissions', 'moduleId nombre display icon')
      .select('-contraseA');

    res.status(200).json({
      status: 'success',
      data: employees
    });
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
    const employee = await Employee.findOne({ _id: req.params.id, isActive: true })
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
    const { nombre, apellido, apellidoMaterno, email, contraseA, confirmPassword, genero, cargo, roleId } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido || !apellidoMaterno || !email || !contraseA || !genero) {
      return res.status(400).json({
        status: 'fail',
        message: 'Por favor completa todos los campos requeridos: nombre, apellido paterno, apellido materno, género, email y contraseña.',
      });
    }

    // Validar confirmación de contraseña si viene
    if (typeof confirmPassword !== 'undefined' && contraseA !== confirmPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Las contraseñas no coinciden.',
      });
    }

    // Validar género permitido (M, F, N, O)
    const genderCode = String(genero).trim().charAt(0).toUpperCase();
    const allowed = ['M', 'F', 'N', 'O'];
    if (!allowed.includes(genderCode)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Género inválido. Valores permitidos: M, F, N, O.',
      });
    }

    // roleId es opcional; si se provee, puede validarse, pero no es requerido
    let roleFound = null;
    if (roleId) {
      roleFound = await Role.findById(roleId);
      if (!roleFound) {
        return res.status(404).json({ status: 'fail', message: 'Rol no encontrado' });
      }
    }

    // Generar userId único como en authController
    const initial = (s) => (s || '').trim().charAt(0).toUpperCase();
    const initials = `${initial(nombre)}${initial(apellido)}${initial(apellidoMaterno)}${genderCode}`;
    const userId = `USR-${initials}`;

    // Verificar duplicados en Employees y Users
    const existingEmpId = await Employee.findOne({ userId });
    const existingUserId = await User.findOne({ userId });
    if (existingEmpId || existingUserId) {
      return res.status(400).json({
        status: 'fail',
        code: 'USERID_DUPLICATE',
        message: `El código de usuario generado (${userId}) ya existe. Intenta variar el nombre o verifica tus datos.`,
      });
    }

    // Crear empleado
    const newEmployee = await Employee.create({
      userId,
      nombre,
      apellido,
      apellidoMaterno,
      email,
      contraseA,
      genero: genderCode,
      cargo,
      ...(roleFound ? { roleId } : {}),
    });

    // Populate para la respuesta
    await newEmployee.populate('roleId', 'nombre description');

    try {
      await logEvent({
        type: 'EMPLOYEE_CREATED',
        userType: 'employee',
        userId: newEmployee._id,
        email: newEmployee.email,
        name: `${newEmployee.nombre || ''} ${newEmployee.apellido || ''}`.trim(),
        metadata: { roleId: newEmployee.roleId?._id || null }
      });
    } catch (_) { }

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
    const { nombre, apellido, apellidoMaterno, email, cargo, roleId, isActive, genero } = req.body;

    const updateData = { nombre, apellido, apellidoMaterno, email, cargo, isActive };
    if (genero) updateData.genero = String(genero).trim().charAt(0).toUpperCase();
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
    const employee = await Employee.findById(req.params.id);

    if (!employee || employee.isActive === false) {
      return res.status(404).json({
        status: 'fail',
        message: 'Empleado no encontrado',
      });
    }

    employee.isActive = false;
    await employee.save({ validateBeforeSave: false });

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

    try {
      await logEvent({
        type: 'PASSWORD_RESET',
        userType: 'employee',
        userId: employee._id,
        email: employee.email,
        name: `${employee.nombre || ''} ${employee.apellido || ''}`.trim(),
        metadata: { method: 'admin-reset' }
      });
    } catch (_) { }

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

    // Extraer solo los moduleId de customPermissions para el frontend
    const customPermissionIds = employee.customPermissions.map((p) => p.moduleId);

    res.status(200).json({
      status: 'success',
      data: {
        roleId: employee.roleId?._id,
        roleName: employee.roleId?.nombre,
        permissions: customPermissionIds, // Array de moduleId (strings)
        customPermissions: employee.customPermissions, // Objetos completos por si se necesitan
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

    let { customPermissions } = req.body; // puede ser array de moduleId o de ObjectIds



    // Normalizar: si llega string único, convertir a array
    if (!Array.isArray(customPermissions)) customPermissions = [customPermissions];

    // Buscar los módulos correspondientes a los moduleId (o _id) recibidos
    const PermissionModule = require('../../models/PermissionModule');

    // Si los elementos parecen ObjectId de 24 hex, usarlos directo; de lo contrario buscar por moduleId
    const isObjectId = (v) => /^[a-fA-F0-9]{24}$/.test(String(v));

    let modules;
    if (customPermissions.length === 0) {
      modules = [];
    } else if (customPermissions.every(isObjectId)) {

      modules = await PermissionModule.find({ _id: { $in: customPermissions } });
    } else {

      modules = await PermissionModule.find({ moduleId: { $in: customPermissions } });
    }



    const moduleIds = modules.map((m) => m._id);

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { customPermissions: moduleIds },
      { new: true, runValidators: false }
    ).populate('customPermissions');

    if (!employee) {
      return res.status(404).json({ status: 'fail', message: 'Empleado no encontrado' });
    }



    res.status(200).json({
      status: 'success',
      message: 'Permisos actualizados correctamente',
      data: employee.customPermissions,
    });
  } catch (err) {
    console.error('❌ Error al actualizar permisos:', err);
    res.status(400).json({ status: 'fail', message: err.message });
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

    try {
      await logEvent({
        type: employee.isBlocked ? 'ACCOUNT_BLOCKED' : 'ACCOUNT_UNBLOCKED',
        userType: 'employee',
        userId: employee._id,
        email: employee.email,
        name: `${employee.nombre || ''} ${employee.apellido || ''}`.trim(),
        metadata: { by: 'admin' }
      });
    } catch (_) { }

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

// Desbloquear empleado por ID
exports.unblockEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false, loginAttempts: 0, blockedAt: null },
      { new: true, runValidators: false }
    );

    if (!employee) {
      return res.status(404).json({
        status: 'fail',
        message: 'Empleado no encontrado'
      });
    }

    try {
      await logEvent({
        type: 'ACCOUNT_UNBLOCKED',
        userType: 'employee',
        userId: employee._id,
        email: employee.email,
        name: `${employee.nombre || ''} ${employee.apellido || ''}`.trim(),
        metadata: { by: 'admin' }
      });
    } catch (_) { }

    res.status(200).json({
      status: 'success',
      message: 'Empleado desbloqueado exitosamente'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Bloquear empleado por ID
exports.blockEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true, blockedAt: new Date() },
      { new: true, runValidators: false }
    );

    if (!employee) {
      return res.status(404).json({
        status: 'fail',
        message: 'Empleado no encontrado'
      });
    }

    try {
      await logEvent({
        type: 'ACCOUNT_BLOCKED',
        userType: 'employee',
        userId: employee._id,
        email: employee.email,
        name: `${employee.nombre || ''} ${employee.apellido || ''}`.trim(),
        metadata: { by: 'admin' }
      });
    } catch (_) { }

    res.status(200).json({
      status: 'success',
      message: 'Empleado bloqueado exitosamente'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
