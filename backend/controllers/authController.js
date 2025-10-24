const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('../services/emailService');

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

// Almacenamiento en memoria para captchas: id -> { text, expires }
const captchas = new Map();
const CAPTCHA_TTL_MS = 2 * 60 * 1000; // 2 minutos

function makeId() {
  return crypto.randomBytes(16).toString('hex');
}

function randomText(len = 5) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function svgForText(text) {
  const width = 160, height = 60;
  const letters = text.split('').map((ch, i) => {
    const x = 20 + i * 25 + Math.random() * 5;
    const y = 35 + Math.random() * 10 - 5;
    const rotate = -20 + Math.random() * 40;
    const color = `hsl(${Math.floor(Math.random() * 360)},70%,40%)`;
    return `<text x="${x}" y="${y}" fill="${color}" font-size="28" font-family="Arial" transform="rotate(${rotate} ${x} ${y})">${ch}</text>`;
  }).join('');
  const noiseLines = Array.from({ length: 4 }).map(() => {
    const x1 = Math.random() * width, y1 = Math.random() * height;
    const x2 = Math.random() * width, y2 = Math.random() * height;
    const color = `rgba(0,0,0,0.${Math.floor(Math.random() * 5) + 2})`;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#f3f4f6"/>${noiseLines}${letters}</svg>`;
}

function createCaptcha() {
  const id = makeId();
  const text = randomText(5);
  const svg = svgForText(text);
  const image = Buffer.from(svg).toString('base64');
  captchas.set(id, { text, expires: Date.now() + CAPTCHA_TTL_MS });
  return { id, image: `data:image/svg+xml;base64,${image}` };
}

function pruneExpired() {
  const now = Date.now();
  for (const [id, data] of captchas.entries()) {
    if (data.expires < now) captchas.delete(id);
  }
}

exports.getCaptcha = (req, res) => {
  pruneExpired();
  const { id, image } = createCaptcha();
  res.status(200).json({ id, image });
};

// Almacenamiento en memoria para códigos de verificación: email -> { code, expires }
const verificationCodes = new Map();
const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000; // 10 minutos

// Almacenamiento en memoria para sesiones de login pendientes: email -> { userId, code, expires, isEmployee }
const pendingLogins = new Map();
const PENDING_LOGIN_TTL_MS = 10 * 60 * 1000; // 10 minutos

function generateVerificationCode() {
  // Generar código de 6 dígitos
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function pruneExpiredCodes() {
  const now = Date.now();
  for (const [email, data] of verificationCodes.entries()) {
    if (data.expires < now) verificationCodes.delete(email);
  }
}

function pruneExpiredPendingLogins() {
  const now = Date.now();
  for (const [email, data] of pendingLogins.entries()) {
    if (data.expires < now) pendingLogins.delete(email);
  }
}

// NUEVO: Endpoint para enviar código de verificación por email
exports.sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'El email es requerido.'
      });
    }

    // Verificar que el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Usuario no encontrado.'
      });
    }

    // Generar código de verificación
    const code = generateVerificationCode();
    
    // Guardar código con tiempo de expiración
    verificationCodes.set(email, {
      code,
      expires: Date.now() + VERIFICATION_CODE_TTL_MS
    });

    // Enviar código por email
    await emailService.sendVerificationCode(email, code);

    // Limpiar códigos expirados
    pruneExpiredCodes();

    return res.status(200).json({
      status: 'success',
      message: 'Código de verificación enviado a tu email.'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message || 'No se pudo enviar el código de verificación.'
    });
  }
};

// Login de usuario o empleado
exports.login = async (req, res) => {
  try {
    const { email, contraseA, captchaId, captchaValue } = req.body;

    if (!email || !contraseA) {
      return res.status(400).json({
        status: 'fail',
        message: 'Por favor proporciona email y contraseña'
      });
    }

    // Validación de captcha de imagen
    if (!captchaId || !captchaValue) {
      return res.status(400).json({
        status: 'fail',
        message: 'Captcha requerido.'
      });
    }
    pruneExpired();
    const record = captchas.get(captchaId);
    if (!record) {
      return res.status(400).json({
        status: 'fail',
        message: 'Captcha inválido o expirado.'
      });
    }
    const provided = String(captchaValue).trim().toUpperCase();
    if (provided !== record.text.toUpperCase()) {
      captchas.delete(captchaId);
      return res.status(400).json({
        status: 'fail',
        message: 'Verificación captcha incorrecta.'
      });
    }
    // Consumir captcha para evitar reutilización
    captchas.delete(captchaId);

    // 1) Intentar login como EMPLEADO
    const employee = await Employee.findOne({ email })
      .select('+contraseA')
      .populate('customPermissions');
      
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

      // Obtener permisos personalizados (moduleId)
      const permissions = employee.customPermissions.map(p => p.moduleId);

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
          permissions: permissions, // NUEVO: permisos para filtrar módulos
          loginAttempts: employee.loginAttempts || 0,
          isBlocked: employee.isBlocked || false
        }
      });
    }

    // 2) Si no es empleado, intentar login como USUARIO (cliente)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email o contraseña incorrectos'
      });
    }

    // NUEVO: Verificar si la cuenta está bloqueada
    if (user.isBlocked) {
      return res.status(403).json({
        status: 'fail',
        code: 'ACCOUNT_BLOCKED',
        message: 'Tu cuenta ha sido bloqueada por múltiples intentos fallidos de inicio de sesión. Por favor contacta con soporte.',
        blockedAt: user.blockedAt
      });
    }

    // Verificar la contraseña
    const isPasswordCorrect = await user.correctPassword(contraseA, user.password);
    if (!isPasswordCorrect) {
      // Incrementar contador de intentos fallidos
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      // Si alcanza 3 intentos, bloquear la cuenta
      if (user.loginAttempts >= 3) {
        user.isBlocked = true;
        user.blockedAt = new Date();
        await user.save({ validateBeforeSave: false });
        
        return res.status(403).json({
          status: 'fail',
          code: 'ACCOUNT_BLOCKED',
          message: 'Tu cuenta ha sido bloqueada por múltiples intentos fallidos de inicio de sesión. Por favor contacta con soporte.',
          blockedAt: user.blockedAt
        });
      }
      
      // Guardar el incremento de intentos
      await user.save({ validateBeforeSave: false });
      
      const attemptsLeft = 3 - user.loginAttempts;
      return res.status(401).json({
        status: 'fail',
        message: `Email o contraseña incorrectos. Te quedan ${attemptsLeft} intento(s) antes de que tu cuenta sea bloqueada.`,
        loginAttempts: user.loginAttempts,
        attemptsLeft
      });
    }

    // Si la contraseña es correcta, resetear intentos fallidos
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      await user.save({ validateBeforeSave: false });
    }

    // NUEVO: Forzar cambio de contraseña si expiró (60 días)
    if (typeof user.isPasswordExpired === 'function' && user.isPasswordExpired()) {
      return res.status(403).json({
        status: 'fail',
        code: 'PASSWORD_EXPIRED',
        message: 'Tu contraseña ha expirado. Debes cambiarla.'
      });
    }

    // NUEVO: Enviar código de verificación por email antes de completar el login
    const code = generateVerificationCode();
    
    // Guardar sesión de login pendiente
    pendingLogins.set(email, {
      userId: user._id,
      code,
      expires: Date.now() + PENDING_LOGIN_TTL_MS,
      isEmployee: false
    });

    // Enviar código por email
    try {
      await emailService.sendVerificationCode(email, code);
    } catch (emailError) {
      console.error('Error al enviar código de login:', emailError);
      // Si falla el envío del email, eliminar la sesión pendiente
      pendingLogins.delete(email);
      return res.status(500).json({
        status: 'fail',
        message: 'No se pudo enviar el código de verificación. Inténtalo de nuevo.'
      });
    }

    // Limpiar sesiones expiradas
    pruneExpiredPendingLogins();

    return res.status(200).json({
      status: 'success',
      message: 'Credenciales correctas. Se ha enviado un código de verificación a tu email.',
      requiresVerification: true,
      email: email
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// NUEVO: Verificar código de login y completar inicio de sesión
exports.verifyLoginCode = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email y código de verificación son requeridos.'
      });
    }

    // Limpiar sesiones expiradas
    pruneExpiredPendingLogins();

    // Verificar que existe una sesión de login pendiente
    const pendingLogin = pendingLogins.get(email);
    
    if (!pendingLogin) {
      return res.status(400).json({
        status: 'fail',
        message: 'Sesión de login no encontrada o expirada. Por favor inicia sesión nuevamente.'
      });
    }

    // Verificar que el código coincida
    if (pendingLogin.code !== verificationCode) {
      return res.status(400).json({
        status: 'fail',
        message: 'Código de verificación incorrecto.'
      });
    }

    // Código válido, eliminar la sesión pendiente
    pendingLogins.delete(email);

    // Obtener el usuario o empleado
    let userData;
    if (pendingLogin.isEmployee) {
      const employee = await Employee.findById(pendingLogin.userId);
      if (!employee) {
        return res.status(404).json({
          status: 'fail',
          message: 'Usuario no encontrado.'
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
    } else {
      const user = await User.findById(pendingLogin.userId);
      if (!user) {
        return res.status(404).json({
          status: 'fail',
          message: 'Usuario no encontrado.'
        });
      }
      
      // Usar la función createSendToken existente
      createSendToken(user, 200, res);
    }
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
    let currentUser = await Employee.findById(decoded.id).populate('roleId');
    if (!currentUser) {
      currentUser = await User.findById(decoded.id);
    }

    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'El usuario al que pertenece este token ya no existe.'
      });
    }

    // Normalizar el campo role para ambos tipos de usuario
    if (!currentUser.role && currentUser.roleId) {
      // Es un Employee, asignar role desde roleId
      currentUser.role = currentUser.roleId.nombre || 'employee';
      currentUser.userType = 'employee';
    } else {
      // Es un User normal
      currentUser.userType = 'user';
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
<<<<<<< HEAD
    // Verificar si el usuario es un Employee (los empleados son admin)
    // Los Employee tienen 'roleId', los User normales tienen 'role'
    const isEmployee = req.user.roleId !== undefined;
    
    // Si es empleado, permitir acceso (los empleados son admin)
    if (isEmployee && roles.includes('admin')) {
      return next();
    }
    
    // Para usuarios normales, verificar el campo 'role'
    if (req.user.role && roles.includes(req.user.role)) {
      return next();
    }
    
    return res.status(403).json({
      status: 'fail',
      message: 'No tienes permisos para realizar esta acción'
    });
=======
    console.log('🔐 restrictTo - Usuario:', req.user?.email);
    console.log('🔐 restrictTo - Tipo de usuario:', req.user?.userType);
    console.log('🔐 restrictTo - Rol del usuario:', req.user?.role);
    console.log('🔐 restrictTo - Roles requeridos:', roles);
    
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Usuario no autenticado'
      });
    }

    // Para employees, verificar que el rol esté en la lista permitida
    // Para users, verificar que el role esté en la lista permitida
    if (!roles.includes(req.user.role)) {
      console.log('❌ Acceso denegado - Rol no permitido');
      return res.status(403).json({
        status: 'fail',
        message: `No tienes permisos para realizar esta acción. Tu rol es: ${req.user.role}, roles permitidos: ${roles.join(', ')}`
      });
    }
    
    console.log('✅ Acceso permitido');
    next();
>>>>>>> BOT2-2
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

// Endpoint para desbloquear una cuenta (uso administrativo)
exports.unblockAccount = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Se requiere el ID del usuario.'
      });
    }

    // Actualizar sin disparar middleware de validación
    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: false, loginAttempts: 0, blockedAt: null },
      { new: true, runValidators: false }
    );

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Usuario no encontrado.'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Cuenta desbloqueada exitosamente.',
      user: {
        idUsuario: user._id,
        email: user.email,
        isBlocked: user.isBlocked,
        loginAttempts: user.loginAttempts
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Endpoint para verificar estado de bloqueo de una cuenta
exports.checkBlockedStatus = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Se requiere el email del usuario.'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Usuario no encontrado.'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        email: user.email,
        isBlocked: user.isBlocked,
        loginAttempts: user.loginAttempts,
        blockedAt: user.blockedAt
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// NUEVO: Endpoint de recuperación de contraseña (desbloqueo + cambio de contraseña)
exports.resetPassword = async (req, res) => {
  try {
    const { email, verificationCode, newPassword, newPasswordConfirm } = req.body;

    if (!email || !verificationCode || !newPassword || !newPasswordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email, código de verificación, nueva contraseña y confirmación son requeridos.'
      });
    }

    // Validar código de verificación
    pruneExpiredCodes();
    const storedCode = verificationCodes.get(email);
    
    if (!storedCode) {
      return res.status(400).json({
        status: 'fail',
        message: 'Código de verificación no encontrado o expirado. Solicita un nuevo código.'
      });
    }

    if (storedCode.code !== verificationCode) {
      return res.status(400).json({
        status: 'fail',
        message: 'Código de verificación incorrecto.'
      });
    }

    // Código válido, eliminar para evitar reutilización
    verificationCodes.delete(email);

    if (newPassword !== newPasswordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Las contraseñas no coinciden.'
      });
    }

    const user = await User.findOne({ email }).select('+password +passwordHistory');
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Usuario no encontrado.'
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

    // Asignar nueva contraseña
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;

    // Desbloquear cuenta y resetear intentos de login
    user.isBlocked = false;
    user.loginAttempts = 0;
    user.blockedAt = null;

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Contraseña actualizada correctamente. Tu cuenta ha sido desbloqueada y puedes iniciar sesión.'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Listar todos los usuarios (clientes)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('name lastName motherLastName email loginAttempts isBlocked telefono direccion');
    // Adaptar al shape esperado por el frontend (nombre/apellido)
    const adapted = users.map(u => ({
      _id: u._id,
      nombre: u.name,
      apellido: u.lastName,
      apellidoMaterno: u.motherLastName,
      email: u.email,
      telefono: u.telefono || null,
      direccion: u.direccion || null,
      loginAttempts: u.loginAttempts || 0,
      isBlocked: !!u.isBlocked,
    }));
    return res.status(200).json(adapted);
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Listar usuarios bloqueados
exports.getBlockedUsers = async (req, res) => {
  try {
    const users = await User.find({ isBlocked: true }).select('name lastName motherLastName email loginAttempts isBlocked telefono direccion');
    const adapted = users.map(u => ({
      _id: u._id,
      nombre: u.name,
      apellido: u.lastName,
      apellidoMaterno: u.motherLastName,
      email: u.email,
      telefono: u.telefono || null,
      direccion: u.direccion || null,
      loginAttempts: u.loginAttempts || 0,
      isBlocked: !!u.isBlocked,
    }));
    return res.status(200).json(adapted);
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Desbloquear usuario por ID (y resetear intentos)
exports.unblockUserById = async (req, res) => {
  try {
    console.log('BODY recibido en /auth/unblock-account:', req.body);   //  ←  temporal
    const { userId } = req.body;
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: false, loginAttempts: 0, blockedAt: null },
      { new: true, runValidators: false }
    );
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Usuario no encontrado' });
    }
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

// Bloquear usuario por ID (ban)
exports.blockUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: true, blockedAt: new Date() },
      { new: true, runValidators: false }
    );
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Usuario no encontrado' });
    }
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

// NUEVO: Búsqueda de usuarios por nombre (para reseñas)
exports.searchUsersByName = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        status: 'fail',
        message: 'Debes ingresar al menos 2 caracteres para buscar'
      });
    }

    // Buscar usuarios por nombre completo (name, lastName, motherLastName)
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { motherLastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { userId: { $regex: q, $options: 'i' } }
      ]
    })
      .select('_id name lastName motherLastName email userId')
      .limit(10); // Limitar a 10 resultados

    res.status(200).json({
      status: 'success',
      results: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};