const express = require('express');
const recycleController = require('../controllers/recycleController');
const authController = require('../controllers/auth');

const router = express.Router();

// Middleware de protección - todas las rutas requieren autenticación
router.use(authController.protect);

// ========== RUTAS ESPECÍFICAS DEL ADMIN ==========
// Rutas de administración (deben ir primero para evitar conflicto con /:id)
router.get('/all', authController.restrictTo('admin'), recycleController.obtenerTodosReciclajes);
router.patch('/:id/quote', authController.restrictTo('admin'), recycleController.actualizarCotizacion);
router.patch('/:id/status', authController.restrictTo('admin'), recycleController.actualizarEstado);
router.post('/:id/evaluate', authController.restrictTo('admin'), recycleController.evaluarReciclaje);
router.post('/:id/reject-admin', authController.restrictTo('admin'), recycleController.rechazarReciclaje);
router.post('/:id/complete', authController.restrictTo('admin'), recycleController.completarReciclaje);

// Rutas protegidas (requieren autenticación)
router.post('/request', recycleController.crearReciclaje);
router.get('/my-requests', recycleController.obtenerMisReciclajes);
router.post('/:id/accept', recycleController.aceptarCotizacion);
router.post('/:id/reject', recycleController.rechazarCotizacion);
router.get('/:id', recycleController.obtenerReciclaje);

module.exports = router;
