const express = require('express');
const authController = require('../controllers/authController');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// Proteger todas las rutas
router.use(authController.protect);

// ============ RUTAS ADMIN ============
router.get('/repairs-pending', authController.restrictTo('admin'), dashboardController.getPendingRepairs);
router.get('/recycle-pending', authController.restrictTo('admin'), dashboardController.getPendingRecycle);
router.get('/recent-sales', authController.restrictTo('admin'), dashboardController.getRecentSales);
router.get('/new-reviews', authController.restrictTo('admin'), dashboardController.getNewReviews);
// TEMPORAL: Permitir acceso a cualquier usuario autenticado mientras se configura admin
router.get('/all', dashboardController.getAllDashboardData);

// ============ RUTAS CLIENTE ============
router.get('/client/my-sales', dashboardController.getClientMySales);
router.get('/client/my-purchases', dashboardController.getClientMyPurchases);
router.get('/client/my-repairs', dashboardController.getClientMyRepairs);
router.get('/client/my-recycle', dashboardController.getClientMyRecycle);
router.get('/client/my-notifications', dashboardController.getClientMyNotifications);
router.get('/client/all', dashboardController.getClientDashboardData);

module.exports = router;
