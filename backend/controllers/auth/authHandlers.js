const User = require('../../models/User');
const Employee = require('../../models/Employee');
const emailService = require('../../services/emailService');
const { logEvent } = require('../../services/auditService');
const { signToken, createSendToken } = require('./tokenUtils');
const { validateCaptcha } = require('./captchaService');
const { 
  generateVerificationCode, 
  pruneExpiredPendingLogins, 
  pendingLogins, 
  PENDING_LOGIN_TTL_MS 
} = require('./verificationService');

// Registro de usuario
const signup = async (req, res) => {
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
const login = async (req, res) => {
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
    
    const captchaResult = validateCaptcha(captchaId, captchaValue);
    if (!captchaResult.valid) {
      return res.status(400).json({
        status: 'fail',
        message: captchaResult.message
      });
    }

    // 1) Intentar login como EMPLEADO
    const employee = await Employee.findOne({ email })
      .select('+contraseA')
      .populate('customPermissions');
      
    if (employee) {
      // Verificar si la cuenta del empleado está bloqueada
      if (employee.isBlocked) {
        return res.status(403).json({
          status: 'fail',
          code: 'ACCOUNT_BLOCKED',
          message: 'La cuenta de empleado está bloqueada por múltiples intentos fallidos de inicio de sesión. Por favor contacta con soporte.',
          blockedAt: employee.blockedAt
        });
      }

      const isCorrect = await employee.correctPassword(contraseA, employee.contraseA);
      if (isCorrect) {
        // Si la contraseña es correcta, resetear intentos fallidos
        if (employee.loginAttempts > 0) {
          employee.loginAttempts = 0;
          await employee.save({ validateBeforeSave: false });
        }

        const permissions = employee.customPermissions.map(p => p.moduleId);
        const token = signToken(employee._id);

        try {
          await logEvent({
            type: 'LOGIN',
            userType: 'employee',
            userId: employee._id,
            email: employee.email,
            name: `${employee.nombre || ''} ${employee.apellido || ''}`.trim(),
            metadata: { method: 'password+captcha' }
          });
        } catch (_) {}

        return res.status(200).json({
          status: 'success',
          access_token: token,
          user: {
            idUsuario: employee._id,
            nombre: employee.nombre,
            apellido: employee.apellido || '',
            email: employee.email,
            rol: true,
            cargo: employee.cargo || '',
            permissions: permissions,
            loginAttempts: employee.loginAttempts || 0,
            isBlocked: employee.isBlocked || false
          }
        });
      } else {
        // Contraseña incorrecta: incrementar contador de intentos fallidos
        employee.loginAttempts = (employee.loginAttempts || 0) + 1;
        
        // Si alcanza 3 intentos, bloquear la cuenta del empleado
        if (employee.loginAttempts >= 3) {
          employee.isBlocked = true;
          employee.blockedAt = new Date();
          await employee.save({ validateBeforeSave: false });
          
          return res.status(403).json({
            status: 'fail',
            code: 'ACCOUNT_BLOCKED',
            message: 'La cuenta de empleado ha sido bloqueada por múltiples intentos fallidos de inicio de sesión. Por favor contacta con soporte.',
            blockedAt: employee.blockedAt
          });
        }
        
        // Guardar el incremento de intentos
        await employee.save({ validateBeforeSave: false });
        
        const attemptsLeft = 3 - employee.loginAttempts;
        return res.status(401).json({
          status: 'fail',
          message: `Email o contraseña incorrectos. Te quedan ${attemptsLeft} intento(s) antes de que tu cuenta sea bloqueada.`,
          loginAttempts: employee.loginAttempts,
          attemptsLeft
        });
      }
    }

    // 2) Si no es empleado, intentar login como USUARIO (cliente)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar si la cuenta está bloqueada
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

    // Forzar cambio de contraseña si expiró (60 días)
    if (typeof user.isPasswordExpired === 'function' && user.isPasswordExpired()) {
      return res.status(403).json({
        status: 'fail',
        code: 'PASSWORD_EXPIRED',
        message: 'Tu contraseña ha expirado. Debes cambiarla.'
      });
    }

    // Enviar código de verificación por email antes de completar el login
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

// Verificar código de login y completar inicio de sesión
const verifyLoginCode = async (req, res) => {
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
    if (pendingLogin.isEmployee) {
      const employee = await Employee.findById(pendingLogin.userId);
      if (!employee) {
        return res.status(404).json({
          status: 'fail',
          message: 'Usuario no encontrado.'
        });
      }
      
      const token = signToken(employee._id);

      // Audit: login empleado tras verificación
      try {
        await logEvent({
          type: 'LOGIN',
          userType: 'employee',
          userId: employee._id,
          email: employee.email,
          name: `${employee.nombre || ''} ${employee.apellido || ''}`.trim(),
          metadata: { method: 'verification-code' }
        });
      } catch (_) {}
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
      try {
        await logEvent({
          type: 'LOGIN',
          userType: 'user',
          userId: user._id,
          email: user.email,
          name: `${user.name || ''} ${user.lastName || ''}`.trim(),
          metadata: { method: 'verification-code' }
        });
      } catch (_) {}
      createSendToken(user, 200, res);
    }
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Logout (requiere auth)
const logout = async (req, res) => {
  try {
    const u = req.user;
    if (u) {
      try {
        await logEvent({
          type: 'LOGOUT',
          userType: u.roleId ? 'employee' : 'user',
          userId: u._id,
          email: u.email,
          name: `${u.nombre || u.name || ''} ${u.apellido || u.lastName || ''}`.trim(),
          metadata: { reason: 'explicit' }
        });
      } catch (_) {}
    }
    // En apps con JWT stateless, el logout se maneja en cliente; aquí solo confirmamos
    return res.status(200).json({ status: 'success', message: 'Sesión cerrada' });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

module.exports = {
  signup,
  login,
  verifyLoginCode,
  logout
};
