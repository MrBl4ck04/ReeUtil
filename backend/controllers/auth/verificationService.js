const User = require('../../models/User');
const emailService = require('../../services/emailService');

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

// Endpoint para enviar código de verificación por email
const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'El email es requerido.'
      });
    }

    // Normalizar email para búsqueda case-insensitive
    const normalizedEmail = email.toLowerCase().trim();

    // Verificar que el usuario existe
    const user = await User.findOne({ email: normalizedEmail });

    // SEGURIDAD: No revelar si el usuario existe o no para prevenir enumeración
    if (!user) {
      // Devolver el mismo mensaje de éxito para prevenir enumeración de usuarios
      console.warn(`⚠️ SEGURIDAD: Intento de recuperación con email no registrado: ${normalizedEmail}`);
      return res.status(200).json({
        status: 'success',
        message: 'Si el email está registrado, recibirás un código de verificación.'
      });
    }

    // CORRECCIÓN DE SEGURIDAD: Usar el email registrado en la BD, no el del request
    const registeredEmail = user.email;

    // Log de seguridad si el email del request es diferente al registrado
    if (normalizedEmail !== registeredEmail.toLowerCase()) {
      console.warn(`⚠️ SEGURIDAD: Intento de envío de código con email diferente. Request: ${normalizedEmail}, Registrado: ${registeredEmail}`);
    }

    // Generar código de verificación
    const code = generateVerificationCode();

    // SEGURIDAD: Guardar código usando el email registrado como clave
    verificationCodes.set(registeredEmail, {
      code,
      expires: Date.now() + VERIFICATION_CODE_TTL_MS
    });

    // SEGURIDAD: Enviar código SOLO al email registrado en el sistema
    await emailService.sendVerificationCode(registeredEmail, code);

    // Log de seguridad para auditoría
    console.log(`✓ Código de verificación enviado a: ${registeredEmail}`);

    // Limpiar códigos expirados
    pruneExpiredCodes();

    return res.status(200).json({
      status: 'success',
      message: 'Si el email está registrado, recibirás un código de verificación.'
    });
  } catch (err) {
    // SEGURIDAD: No revelar información específica del error
    console.error('Error en sendVerificationCode:', err);
    res.status(400).json({
      status: 'fail',
      message: 'No se pudo procesar la solicitud. Por favor intenta nuevamente.'
    });
  }
};

module.exports = {
  sendVerificationCode,
  generateVerificationCode,
  pruneExpiredCodes,
  pruneExpiredPendingLogins,
  verificationCodes,
  pendingLogins,
  PENDING_LOGIN_TTL_MS
};
