const express = require('express');
const router = express.Router();
const repairController = require('../controllers/repairController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware de autenticación
const { verifyToken, isAdmin } = authMiddleware;

// Rutas para administradores
router.get('/all', verifyToken, isAdmin, repairController.getAllRepairRequests);

// Rutas para clientes
router.get('/my-requests', verifyToken, repairController.getMyRepairRequests);
router.post('/request', verifyToken, repairController.createRepairRequest);
router.post('/:id/accept', verifyToken, repairController.acceptRepairQuote);
router.post('/:id/reject', verifyToken, repairController.rejectRepairQuote);

// Rutas comunes
router.get('/:id', verifyToken, repairController.getRepairById);

// Rutas para administradores (actualización)
router.patch('/:id/diagnosis', verifyToken, isAdmin, repairController.updateRepairDiagnosis);
router.patch('/:id/quote', verifyToken, isAdmin, repairController.updateRepairQuote);
router.patch('/:id/status', verifyToken, isAdmin, repairController.updateRepairStatus);

module.exports = router;
