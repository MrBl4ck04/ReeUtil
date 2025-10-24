const express = require('express');
const authController = require('../controllers/auth');
const { body, param } = require('express-validator');
const { validationResult } = require('express-validator');

const router = express.Router();

// Middleware simple para manejar resultados de validación
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }
  next();
};

router.post(
  '/signup',
  [
    body('name').isString().trim().notEmpty(),
    body('lastName').isString().trim().notEmpty(),
    body('motherLastName').isString().trim().notEmpty(),
    body('gender').isString().isIn(['M', 'F', 'N', 'O']),
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 12 }),
    body('passwordConfirm').isString().isLength({ min: 12 })
  ],
  validate,
  authController.signup
);

router.post('/register', [body('email').isEmail()], validate, authController.signup);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('contraseA').isString().notEmpty(),
    body('captchaId').isString().notEmpty(),
    body('captchaValue').isString().notEmpty()
  ],
  validate,
  authController.login
);
// NUEVO: Verificar código de login
router.post(
  '/verify-login-code',
  [body('email').isEmail().normalizeEmail(), body('verificationCode').isString().isLength({ min: 6, max: 6 })],
  validate,
  authController.verifyLoginCode
);
// Captcha de imagen para login
router.get('/captcha', authController.getCaptcha);
// NUEVO: cambio de contraseña (requiere email y contraseña actual)
router.post(
  '/change-password',
  [
    body('email').isEmail(),
    body('currentPassword').isString().isLength({ min: 8 }),
    body('newPassword').isString().isLength({ min: 12 }),
    body('newPasswordConfirm').isString().isLength({ min: 12 })
  ],
  validate,
  authController.changePassword
);
// NUEVO: enviar código de verificación por email
router.post('/send-verification-code', [body('email').isEmail()], validate, authController.sendVerificationCode);
// NUEVO: recuperación de contraseña (requiere código de verificación, desbloquea cuenta y resetea intentos)
router.post(
  '/reset-password',
  [
    body('email').isEmail(),
    body('verificationCode').isString().isLength({ min: 6, max: 6 }),
    body('newPassword').isString().isLength({ min: 12 }),
    body('newPasswordConfirm').isString().isLength({ min: 12 })
  ],
  validate,
  authController.resetPassword
);
// NUEVO: desbloquear cuenta (uso administrativo)
router.post('/unblock-account', [body('userId').isString().notEmpty()], validate, authController.unblockAccount);
// NUEVO: verificar estado de bloqueo
router.get('/check-blocked/:email', [param('email').isEmail()], validate, authController.checkBlockedStatus);

// NUEVO: ABM Usuarios (clientes)
router.get('/users', authController.getAllUsers);
router.get('/users/blocked', authController.getBlockedUsers);
router.post('/users/:id/unblock', [param('id').isString().notEmpty()], validate, authController.unblockUserById);
router.post('/users/:id/block', [param('id').isString().notEmpty()], validate, authController.blockUserById);

// NUEVO: Búsqueda de usuarios por nombre (para reseñas)
router.get('/users/search', authController.searchUsersByName);

module.exports = router;