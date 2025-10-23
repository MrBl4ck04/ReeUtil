const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/register', authController.signup);
router.post('/login', authController.login);
// NUEVO: cambio de contraseña (requiere email y contraseña actual)
router.post('/change-password', authController.changePassword);

module.exports = router;