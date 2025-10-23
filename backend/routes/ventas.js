const express = require('express');
const ventaController = require('../controllers/ventaController');
const authController = require('../controllers/authController');

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.get('/', ventaController.obtenerVentas);
router.get('/buscar', ventaController.buscarVentas);
router.get('/:id', ventaController.obtenerVenta);

// Middleware de protección - todas las rutas siguientes requieren autenticación
router.use(authController.protect);

// Rutas protegidas (requieren autenticación)
router.post('/', ventaController.crearVenta);
router.get('/usuario/mis-ventas', ventaController.obtenerMisVentas);
router.get('/usuario/productos-deshabilitados', ventaController.obtenerProductosDeshabilitados);
router.patch('/:id', ventaController.actualizarVenta);
router.post('/:id/comprar', ventaController.comprarVenta);
router.delete('/:id', ventaController.eliminarVenta);

// ========== RUTAS ESPECÍFICAS DEL ADMIN ==========
// Todas las rutas siguientes requieren autenticación Y rol de admin
router.use(authController.restrictTo('admin'));

// Rutas de administración
router.get('/admin/todas', ventaController.obtenerVentasAdmin);
router.patch('/admin/:id/deshabilitar', ventaController.deshabilitarVenta);
router.patch('/admin/:id/habilitar', ventaController.habilitarVenta);

module.exports = router;