const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment, handleWebhook } = require('../controllers/chapaController');
const { requireAuth } = require('../middleware/auth');

router.post('/initialize', requireAuth, initializePayment);
router.get('/verify/:tx_ref', verifyPayment);
router.post('/webhook', handleWebhook);

module.exports = router;
