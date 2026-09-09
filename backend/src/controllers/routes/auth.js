const express = require('express');
const router = express.Router();
const { signup, login, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', requireAuth, me);

module.exports = router;
