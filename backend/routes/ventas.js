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
router.patch('/:id', ventaController.actualizarVenta);
router.delete('/:id', ventaController.eliminarVenta);

module.exports = router;