const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { createDiagnostic, getDiseases } = require('../controllers/diagnostics.controller');
const router = express.Router();

router.post('/', requireAuth, createDiagnostic);
router.get('/catalog', requireAuth, getDiseases);

module.exports = router;