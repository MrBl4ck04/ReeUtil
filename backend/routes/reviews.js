const express = require('express');
const authController = require('../controllers/auth');
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.originalUrl}`);
  next();
});

// Rutas públicas (sin autenticación)
router.get('/seller/:sellerId', reviewController.getSellerReviews);

// Rutas protegidas (requieren autenticación)
router.get('/me', authController.protect, (req, res) => {
  console.log('👤 Usuario autenticado:', req.user);
  res.status(200).json({ userId: req.user._id, email: req.user.email });
});
router.get('/my-reviews', authController.protect, reviewController.getMyReviews);
router.post('/', authController.protect, reviewController.createReview);
router.patch('/:id', authController.protect, reviewController.updateReview);
router.delete('/:id', authController.protect, reviewController.deleteReview);
router.post('/:id/flag', authController.protect, reviewController.flagReview);

// Rutas de admin (requieren autenticación)
router.get('/all', authController.protect, reviewController.getAllReviews);
router.get('/stats', authController.protect, reviewController.getReviewsStats);

module.exports = router;
