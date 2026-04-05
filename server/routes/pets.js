// CRUD de mascotas.
const express = require('express');
const Pet = require('../models/Pet');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (_req, res) => {
  // Populate entrega datos del dueño sin requerir llamada adicional.
  const pets = await Pet.find().populate('ownerId', 'fullName phone email').sort({ createdAt: -1 }).lean();
  return res.json(pets);
});

router.post('/', requireAuth, async (req, res) => {
  const pet = await Pet.create(req.body);
  return res.status(201).json(pet);
});

router.put('/:id', requireAuth, async (req, res) => {
  const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true });
  return res.json(pet);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await Pet.findByIdAndDelete(req.params.id);
  return res.json({ message: 'Mascota eliminada' });
});

module.exports = router;
