const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { pruneExpiredCodes, verificationCodes } = require('./verificationService');

// Endpoint para cambiar contraseña con validación de historial
const changePassword = async (req, res) => {
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

// Endpoint de recuperación de contraseña (desbloqueo + cambio de contraseña)
const resetPassword = async (req, res) => {
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

module.exports = {
  changePassword,
  resetPassword
};
