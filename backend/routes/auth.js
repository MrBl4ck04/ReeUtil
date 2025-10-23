const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/register', authController.signup);
router.post('/login', authController.login);
// NUEVO: Verificar código de login
router.post('/verify-login-code', authController.verifyLoginCode);
// Captcha de imagen para login
router.get('/captcha', authController.getCaptcha);
// NUEVO: cambio de contraseña (requiere email y contraseña actual)
router.post('/change-password', authController.changePassword);
// NUEVO: enviar código de verificación por email
router.post('/send-verification-code', authController.sendVerificationCode);
// NUEVO: recuperación de contraseña (requiere código de verificación, desbloquea cuenta y resetea intentos)
router.post('/reset-password', authController.resetPassword);
// NUEVO: desbloquear cuenta (uso administrativo)
router.post('/unblock-account', authController.unblockAccount);
// NUEVO: verificar estado de bloqueo
router.get('/check-blocked/:email', authController.checkBlockedStatus);

module.exports = router;