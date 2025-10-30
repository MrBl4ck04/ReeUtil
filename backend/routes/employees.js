const express = require('express');
const employeeController = require('../controllers/employees/employeeController');

const router = express.Router();

// Rutas de empleados
router.get('/', employeeController.getAllEmployees);
router.get('/blocked', employeeController.getBlockedEmployees);
router.post('/', employeeController.createEmployee);
router.get('/:id', employeeController.getEmployeeById);
router.patch('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

// Rutas de contraseña
router.post('/:id/reset-password', employeeController.resetEmployeePassword);

// Rutas de permisos
router.get('/:id/permissions', employeeController.getEmployeePermissions);
router.post('/:id/permissions', employeeController.updateEmployeePermissions);

// Rutas de bloqueo
router.post('/:id/toggle-block', employeeController.toggleBlockEmployee);
router.post('/:id/unblock', employeeController.unblockEmployeeById);
router.post('/:id/block', employeeController.blockEmployeeById);

module.exports = router;
