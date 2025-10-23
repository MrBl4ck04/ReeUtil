const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');

// Función para generar token JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Función para crear y enviar token (usuarios cliente)
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  // Enviar respuesta
  res.status(statusCode).json({
    status: 'success',
    access_token: token,
    user: {
      idUsuario: user._id,
      nombre: user.name,
      apellido: user.lastName || '',
      apellidoMaterno: user.motherLastName || '',
      genero: user.gender || '',
      userId: user.userId,
      email: user.email,
      rol: user.role,
      loginAttempts: user.loginAttempts || 0,
      isBlocked: user.isBlocked || false
    }
  });
};

// Registro de usuario
exports.signup = async (req, res) => {
  try {
    const { name, lastName, motherLastName, email, password, passwordConfirm, gender } = req.body;

    if (!name || !lastName || !motherLastName || !email || !password || !passwordConfirm || !gender) {
      return res.status(400).json({
        status: 'fail',
        message: 'Por favor completa todos los campos: nombre, apellido paterno, apellido materno, género, email y contraseñas.'
      });
    }

    // Validar género permitido (M, F, N, O)
    const genderCode = (gender || '').trim().charAt(0).toUpperCase();
    const allowed = ['M', 'F', 'N', 'O'];
    if (!allowed.includes(genderCode)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Género inválido. Valores permitidos: M, F, N, O.'
      });
    }

    // Generar userId por iniciales: USR-NPMG
    const initial = (s) => (s || '').trim().charAt(0).toUpperCase();
    const initials = `${initial(name)}${initial(lastName)}${initial(motherLastName)}${genderCode}`;
    const userId = `USR-${initials}`;

    // Verificar duplicados de userId
    const existingUserId = await User.findOne({ userId });
    if (existingUserId) {
      return res.status(400).json({
        status: 'fail',
        code: 'USERID_DUPLICATE',
        message: `El código de usuario generado (${userId}) ya existe. Intenta variar el nombre o verifica tus datos.`
      });
    }

    const newUser = await User.create({
      userId,
      name,
      lastName,
      motherLastName,
      gender: genderCode,
      email,
      password,
      passwordConfirm
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Login de usuario o empleado
exports.login = async (req, res) => {
  try {
    const { email, contraseA } = req.body;

    if (!email || !contraseA) {
      return res.status(400).json({
        status: 'fail',
        message: 'Por favor proporciona email y contraseña'
      });
    }

    // 1) Intentar login como EMPLEADO
    const employee = await Employee.findOne({ email }).select('+contraseA');
    if (employee) {
      const isCorrect = await employee.correctPassword(contraseA, employee.contraseA);
      if (!isCorrect) {
        return res.status(401).json({
          status: 'fail',
          message: 'Email o contraseña incorrectos'
        });
      }

      if (employee.isBlocked) {
        return res.status(403).json({
          status: 'fail',
          message: 'La cuenta de empleado está bloqueada'
        });
      }

      const token = signToken(employee._id);
      return res.status(200).json({
        status: 'success',
        access_token: token,
        user: {
          idUsuario: employee._id,
          nombre: employee.nombre,
          apellido: employee.apellido || '',
          email: employee.email,
          rol: true, // empleado => admin
          cargo: employee.cargo || '',
          loginAttempts: employee.loginAttempts || 0,
          isBlocked: employee.isBlocked || false
        }
      });
    }

    // 2) Si no es empleado, intentar login como USUARIO (cliente)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(contraseA, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email o contraseña incorrectos'
      });
    }

    // NUEVO: Forzar cambio de contraseña si expiró (60 días)
    if (typeof user.isPasswordExpired === 'function' && user.isPasswordExpired()) {
      return res.status(403).json({
        status: 'fail',
        code: 'PASSWORD_EXPIRED',
        message: 'Tu contraseña ha expirado. Debes cambiarla.'
      });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Middleware para proteger rutas
exports.protect = async (req, res, next) => {
  try {
    // 1) Obtener token y verificar si existe
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'No has iniciado sesión. Por favor inicia sesión para obtener acceso.'
      });
    }

    // 2) Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Verificar si el usuario aún existe (en cualquiera de las colecciones)
    let currentUser = await Employee.findById(decoded.id);
    if (!currentUser) {
      currentUser = await User.findById(decoded.id);
    }

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'El usuario al que pertenece este token ya no existe.'
      });
    }

    // 4) Otorgar acceso a la ruta protegida
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: 'No autorizado: ' + err.message
    });
  }
};

// Middleware para restringir acceso solo a administradores
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'fail',
        message: 'No tienes permisos para realizar esta acción'
      });
    }
    next();
  };
};

// NUEVO: Endpoint para cambiar contraseña con validación de historial
exports.changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword, newPasswordConfirm } = req.body;

    if (!email || !currentPassword || !newPassword || !newPasswordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Datos incompletos para cambiar la contraseña.'
      });
    }

    const user = await User.findOne({ email }).select('+password +passwordHistory');
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Usuario no encontrado.'
      });
    }

    const isCorrect = await user.correctPassword(currentPassword, user.password);
    if (!isCorrect) {
      return res.status(401).json({
        status: 'fail',
        message: 'La contraseña actual es incorrecta.'
      });
    }

    // Validar que la nueva contraseña no esté en el historial
    const history = user.passwordHistory || [];
    for (const prevHash of history) {
      const reused = await bcrypt.compare(newPassword, prevHash);
      if (reused) {
        return res.status(400).json({
          status: 'fail',
          message: 'No puedes reutilizar una contraseña anterior.'
        });
      }
    }

    // Asignar nueva contraseña y confirmar para activar validaciones del modelo
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Contraseña actualizada correctamente.'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};