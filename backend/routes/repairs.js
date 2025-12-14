const express = require('express');
const repairController = require('../controllers/repairController');
const authController = require('../controllers/auth');
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

// Middleware de protección - todas las rutas requieren autenticación
router.use(authController.protect);

// ========== RUTAS ESPECÍFICAS DEL ADMIN ==========
// Rutas de administración (deben ir primero para evitar conflicto con /:id)
router.get('/all', repairController.obtenerTodasReparaciones);
router.patch('/:id/quote', repairController.actualizarCotizacion);
router.patch('/:id/status', repairController.actualizarEstado);
router.post('/:id/evaluate', repairController.evaluarReparacion);
router.post('/:id/reject-admin', repairController.rechazarReparacion);
router.post('/:id/complete', repairController.completarReparacion);

// Rutas protegidas (requieren autenticación)
router.post('/request', [
    body('tipoDispositivo').trim().notEmpty().withMessage('El tipo de dispositivo es requerido').escape(),
    body('marca').trim().notEmpty().withMessage('La marca es requerida').escape(),
    body('modelo').trim().notEmpty().withMessage('El modelo es requerido').escape(),
    body('problema').optional().trim().escape(),
    body('descripcion').optional().trim().escape(),
    validate
], repairController.crearReparacion);
router.get('/my-requests', repairController.obtenerMisReparaciones);
router.post('/:id/accept', repairController.aceptarCotizacion);
router.post('/:id/reject', repairController.rechazarCotizacion);
router.get('/:id', repairController.obtenerReparacion);

module.exports = router;
