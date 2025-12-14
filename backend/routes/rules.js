const express = require('express');
const ruleController = require('../controllers/ruleController');
const { protect, restrictTo } = require('../controllers/auth');
const { body, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 'fail', errors: errors.array() });
    }
    next();
};

const router = express.Router();

// Rutas públicas (sin autenticación)
router.get('/', ruleController.getAllRules);
router.get('/:id', ruleController.getRule);

// Rutas protegidas (requieren autenticación)
router.post('/', protect, [
    body('nombre').trim().notEmpty().blacklist('/\\\\').withMessage('Nombre inválido').escape(), // Blacklist / and \
    body('descripcion').trim().notEmpty().escape(),
    validate
], ruleController.createRule);

router.patch('/:id', protect, [
    body('nombre').optional().trim().notEmpty().blacklist('/\\\\').withMessage('Nombre inválido').escape(),
    body('descripcion').optional().trim().notEmpty().escape(),
    validate
], ruleController.updateRule);
router.delete('/:id', protect, ruleController.deleteRule);

module.exports = router;
