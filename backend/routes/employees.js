const express = require('express');
const employeeController = require('../controllers/employees/employeeController');
const { param, validationResult } = require('express-validator');

// Middleware para validar IDs de MongoDB
const validateId = [
    param('id').isMongoId().withMessage('ID de empleado inválido'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: 'fail', errors: errors.array() });
        }
        next();
    }
];

const router = express.Router();

// Rutas de empleados
router.get('/', employeeController.getAllEmployees);
router.get('/blocked', employeeController.getBlockedEmployees);
router.post('/', employeeController.createEmployee);
router.get('/:id', validateId, employeeController.getEmployeeById);
router.patch('/:id', validateId, employeeController.updateEmployee);
router.delete('/:id', validateId, employeeController.deleteEmployee);

// Rutas de contraseña
router.post('/:id/reset-password', validateId, employeeController.resetEmployeePassword);

// Rutas de permisos
router.get('/:id/permissions', validateId, employeeController.getEmployeePermissions);
router.post('/:id/permissions', validateId, employeeController.updateEmployeePermissions);

// Rutas de bloqueo
router.post('/:id/toggle-block', validateId, employeeController.toggleBlockEmployee);
router.post('/:id/unblock', validateId, employeeController.unblockEmployeeById);
router.post('/:id/block', validateId, employeeController.blockEmployeeById);

module.exports = router;
