const Employee = require('../../models/Employee');
const Role = require('../../models/Role');
const User = require('../../models/User');

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
    const { nombre, apellido, apellidoMaterno, email, contraseA, confirmPassword, genero, cargo, roleId } = req.body;

    // Validaciones básicas
    if (!nombre || !apellido || !apellidoMaterno || !email || !contraseA || !genero || !roleId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Por favor completa todos los campos requeridos: nombre, apellido paterno, apellido materno, género, email, contraseña y rol.',
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

    // Validar que el rol existe
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        status: 'fail',
        message: 'Rol no encontrado',
      });
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
    console.log('📝 Body recibido:', req.body);
    let { customPermissions } = req.body; // puede ser array de moduleId o de ObjectIds
    
    console.log('📝 customPermissions recibidos:', customPermissions);

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
      console.log('🔍 Buscando por _id');
      modules = await PermissionModule.find({ _id: { $in: customPermissions } });
    } else {
      console.log('🔍 Buscando por moduleId:', customPermissions);
      modules = await PermissionModule.find({ moduleId: { $in: customPermissions } });
    }

    console.log('✅ Módulos encontrados:', modules.map(m => ({ _id: m._id, moduleId: m.moduleId })));

    const moduleIds = modules.map((m) => m._id);

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { customPermissions: moduleIds },
      { new: true, runValidators: false }
    ).populate('customPermissions');

    if (!employee) {
      return res.status(404).json({ status: 'fail', message: 'Empleado no encontrado' });
    }

    console.log('💾 Permisos guardados en BD:', employee.customPermissions.map(p => p.moduleId));

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
