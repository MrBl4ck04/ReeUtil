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

module.exports = {
  sendVerificationCode,
  generateVerificationCode,
  pruneExpiredCodes,
  pruneExpiredPendingLogins,
  verificationCodes,
  pendingLogins,
  PENDING_LOGIN_TTL_MS
};
