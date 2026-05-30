const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
    listInventory,
    getInventorySummary,
    createInventoryItem,
    updateInventoryItem
} = require('../controllers/inventory.controller');

const router = express.Router();

router.get('/summary', requireAuth, getInventorySummary);
router.get('/', requireAuth, listInventory);
router.post('/', requireAuth, createInventoryItem);
router.put('/:id', requireAuth, updateInventoryItem);

module.exports = router;
