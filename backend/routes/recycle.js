const express = require('express');
const recycleController = require('../controllers/recycleController');
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
router.get('/all', recycleController.obtenerTodosReciclajes);
router.patch('/:id/quote', recycleController.actualizarCotizacion);
router.patch('/:id/status', recycleController.actualizarEstado);
router.post('/:id/evaluate', recycleController.evaluarReciclaje);
router.post('/:id/reject-admin', recycleController.rechazarReciclaje);
router.post('/:id/complete', recycleController.completarReciclaje);

// Rutas protegidas (requieren autenticación)
router.post('/request', [
    body('tipoDispositivo').trim().notEmpty().withMessage('El tipo de dispositivo es requerido').escape(),
    body('marca').trim().notEmpty().withMessage('La marca es requerida').escape(),
    body('modelo').trim().notEmpty().withMessage('El modelo es requerido').escape(),
    body('estadoDispositivo').isIn(['funcional', 'parcialmente_funcional', 'no_funcional']).withMessage('Estado inválido'),
    body('descripcion').optional().trim().escape(),
    validate
], recycleController.crearReciclaje);
router.get('/my-requests', recycleController.obtenerMisReciclajes);
router.post('/:id/accept', recycleController.aceptarCotizacion);
router.post('/:id/reject', recycleController.rechazarCotizacion);
router.get('/:id', recycleController.obtenerReciclaje);

module.exports = router;
