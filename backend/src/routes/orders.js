const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getSellerOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.post('/', requireAuth, createOrder);
router.get('/', requireAuth, getMyOrders);
router.get('/:id', requireAuth, getOrder);
router.get('/seller/all', requireAuth, requireRole('seller'), getSellerOrders);
router.put('/:id/status', requireAuth, requireRole('seller'), updateOrderStatus);

module.exports = router;
