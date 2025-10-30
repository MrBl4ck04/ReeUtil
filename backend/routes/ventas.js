const express = require('express');
const ventaController = require('../controllers/ventaController');
const authController = require('../controllers/auth');
const dashController = require('../controllers/dashboard/dashController');
const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', errors: errors.array() });
  }
  next();
};

// Rutas públicas (no requieren autenticación)
router.get(
  '/',
  [
    query('categoria').optional().isString().trim(),
    query('estado').optional().isString().trim(),
    query('condicion').optional().isString().trim(),
    query('estadoAdmin').optional().isString().isIn(['habilitado', 'deshabilitado']),
    query('precioMin').optional().isFloat({ min: 0 }),
    query('precioMax').optional().isFloat({ min: 0 })
  ],
  validate,
  ventaController.obtenerVentas
);
router.get('/buscar', [query('q').isString().trim().notEmpty()], validate, ventaController.buscarVentas);
router.get('/dashboard', dashController.obtenerEstadisticasDashboard);
router.get('/:id', [param('id').isString().notEmpty()], validate, ventaController.obtenerVenta);

// Middleware de protección - todas las rutas siguientes requieren autenticación
router.use(authController.protect);

// Rutas protegidas (requieren autenticación)
router.post('/', [body('nombre').isString().trim().notEmpty()], validate, ventaController.crearVenta);
router.get('/usuario/mis-ventas', ventaController.obtenerMisVentas);
router.get('/usuario/productos-deshabilitados', ventaController.obtenerProductosDeshabilitados);
router.patch('/:id', [param('id').isString().notEmpty()], validate, ventaController.actualizarVenta);
router.post('/:id/comprar', [param('id').isString().notEmpty()], validate, ventaController.comprarVenta);
router.delete('/:id', [param('id').isString().notEmpty()], validate, ventaController.eliminarVenta);

// ========== RUTAS ESPECÍFICAS DEL ADMIN ==========
// Todas las rutas siguientes requieren autenticación

// Rutas de administración
router.get('/admin/todas', [
  query('categoria').optional().isString().trim(),
  query('estado').optional().isString().trim(),
  query('estadoAdmin').optional().isString().isIn(['habilitado', 'deshabilitado']),
  query('condicion').optional().isString().trim(),
  query('precioMin').optional().isFloat({ min: 0 }),
  query('precioMax').optional().isFloat({ min: 0 }),
  query('search').optional().isString().trim()
], validate, ventaController.obtenerVentasAdmin);
router.patch('/admin/:id/deshabilitar', [param('id').isString().notEmpty()], validate, ventaController.deshabilitarVenta);
router.patch('/admin/:id/habilitar', [param('id').isString().notEmpty()], validate, ventaController.habilitarVenta);

module.exports = router;