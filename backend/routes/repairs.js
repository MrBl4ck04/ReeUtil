const express = require('express');
const repairController = require('../controllers/repairController');
const authController = require('../controllers/authController');

const router = express.Router();

// Middleware de protección - todas las rutas requieren autenticación
router.use(authController.protect);

// ========== RUTAS ESPECÍFICAS DEL ADMIN ==========
// Rutas de administración (deben ir primero para evitar conflicto con /:id)
router.get('/all', authController.restrictTo('admin'), repairController.obtenerTodasReparaciones);
router.patch('/:id/quote', authController.restrictTo('admin'), repairController.actualizarCotizacion);
router.patch('/:id/status', authController.restrictTo('admin'), repairController.actualizarEstado);
router.post('/:id/evaluate', authController.restrictTo('admin'), repairController.evaluarReparacion);
router.post('/:id/reject-admin', authController.restrictTo('admin'), repairController.rechazarReparacion);
router.post('/:id/complete', authController.restrictTo('admin'), repairController.completarReparacion);

// Rutas protegidas (requieren autenticación)
router.post('/request', repairController.crearReparacion);
router.get('/my-requests', repairController.obtenerMisReparaciones);
router.post('/:id/accept', repairController.aceptarCotizacion);
router.post('/:id/reject', repairController.rechazarCotizacion);
router.get('/:id', repairController.obtenerReparacion);

module.exports = router;
