const express = require('express');
const router = express.Router();
const {
  getCart,
  addItem,
  updateItem,
  removeItem
} = require('../controllers/cartController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getCart);
router.post('/items', requireAuth, addItem);
router.put('/items/:id', requireAuth, updateItem);
router.delete('/items/:id', requireAuth, removeItem);

module.exports = router;
