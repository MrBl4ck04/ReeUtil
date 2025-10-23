const express = require('express');
const router = express.Router();
const recycleController = require('../controllers/recycleController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware de autenticación
const { verifyToken, isAdmin } = authMiddleware;

// Rutas para administradores
router.get('/all', verifyToken, isAdmin, recycleController.getAllRecycleRequests);

// Rutas para clientes
router.get('/my-requests', verifyToken, recycleController.getMyRecycleRequests);
router.post('/request', verifyToken, recycleController.createRecycleRequest);
router.post('/:id/accept', verifyToken, recycleController.acceptRecycleQuote);
router.post('/:id/reject', verifyToken, recycleController.rejectRecycleQuote);

// Rutas comunes
router.get('/:id', verifyToken, recycleController.getRecycleById);

// Rutas para administradores (actualización)
router.patch('/:id/quote', verifyToken, isAdmin, recycleController.updateRecycleQuote);
router.patch('/:id/status', verifyToken, isAdmin, recycleController.updateRecycleStatus);

module.exports = router;
