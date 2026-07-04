const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
    createDiagnostic,
    createDisease,
    getTreatmentCases,
    getRecentDiagnoses,
    applyTreatment,
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
router.get('/treatment/:diseaseId/cases', requireAuth, getTreatmentCases);
router.get('/history/recent', requireAuth, getRecentDiagnoses);
router.post('/treatment/apply', requireAuth, applyTreatment);

// Análisis Epidemiológico (CORE)
router.get('/critical-diseases', requireAuth, getCriticalDiseases);
router.get('/analyze/all', requireAuth, analyzeAllOutbreaks);
router.get('/analyze/:diseaseId', requireAuth, analyzeOutbreak);
router.get('/compare/:diseaseId1/:diseaseId2', requireAuth, compareEpidemiology);
router.get('/report/epidemic', requireAuth, getEpidemicReport);

module.exports = router;