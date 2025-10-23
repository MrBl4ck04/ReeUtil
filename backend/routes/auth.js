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

module.exports = router;