const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getRecords, createRecord, updateRecord, deleteRecord } = require('../controllers/records.controller');
const router = express.Router();
router.get('/', requireAuth, getRecords);
router.post('/', requireAuth, createRecord);
router.patch('/:id', requireAuth, updateRecord);
router.delete('/:id', requireAuth, deleteRecord);
module.exports = router;