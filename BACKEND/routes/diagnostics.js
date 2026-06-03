const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
    createDiagnostic,
    createDisease,
    getDiseases,
    getCriticalDiseases,
    analyzeOutbreak,
    analyzeAllOutbreaks,
    compareEpidemiology,
    getEpidemicReport
} = require('../controllers/diagnostics.controller');
const router = express.Router();

// CRUD Básico
router.post('/', requireAuth, createDiagnostic);
router.get('/catalog', requireAuth, getDiseases);
router.post('/catalog', requireAuth, createDisease);

// Análisis Epidemiológico (CORE)
router.get('/critical-diseases', requireAuth, getCriticalDiseases);
router.get('/analyze/all', requireAuth, analyzeAllOutbreaks);
router.get('/analyze/:diseaseId', requireAuth, analyzeOutbreak);
router.get('/compare/:diseaseId1/:diseaseId2', requireAuth, compareEpidemiology);
router.get('/report/epidemic', requireAuth, getEpidemicReport);

module.exports = router;