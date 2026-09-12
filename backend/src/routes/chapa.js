const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment } = require('../controllers/chapaController');
const { requireAuth } = require('../middleware/auth');

router.post('/initialize', requireAuth, initializePayment);
router.get('/verify/:tx_ref', verifyPayment);

module.exports = router;
