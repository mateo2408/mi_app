const express = require('express');
const { getOwners, createOwner, updateOwner, deleteOwner } = require('../controllers/owners.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, getOwners);
router.post('/', requireAuth, createOwner);
router.put('/:id', requireAuth, updateOwner);
router.delete('/:id', requireAuth, deleteOwner);

module.exports = router;
