const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { login, getMe } = require('../controllers/auth.controller');
const router = express.Router();
router.post('/login', login);
router.get('/me', requireAuth, getMe);
module.exports = router;