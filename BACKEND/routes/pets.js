const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getPets, createPet, updatePet, deletePet } = require('../controllers/pets.controller');
const router = express.Router();
router.get('/', requireAuth, getPets);
router.post('/', requireAuth, createPet);
router.put('/:id', requireAuth, updatePet);
router.delete('/:id', requireAuth, deletePet);
module.exports = router;