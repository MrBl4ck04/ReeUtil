const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/register', authController.signup);
router.post('/login', authController.login);
// Captcha de imagen para login
router.get('/captcha', authController.getCaptcha);
// NUEVO: cambio de contraseña (requiere email y contraseña actual)
router.post('/change-password', authController.changePassword);
// NUEVO: recuperación de contraseña (desbloquea cuenta y resetea intentos)
router.post('/reset-password', authController.resetPassword);
// NUEVO: desbloquear cuenta (uso administrativo)
router.post('/unblock-account', authController.unblockAccount);
// NUEVO: verificar estado de bloqueo
router.get('/check-blocked/:email', authController.checkBlockedStatus);

module.exports = router;