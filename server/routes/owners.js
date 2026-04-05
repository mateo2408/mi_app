// CRUD de dueños.
const express = require('express');
const Owner = require('../models/Owner');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (_req, res) => {
  // Orden descendente por creación para mostrar recientes primero.
  const owners = await Owner.find().sort({ createdAt: -1 }).lean();
  return res.json(owners);
});

router.post('/', requireAuth, async (req, res) => {
  const owner = await Owner.create(req.body);
  return res.status(201).json(owner);
});

router.put('/:id', requireAuth, async (req, res) => {
  const owner = await Owner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  return res.json(owner);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await Owner.findByIdAndDelete(req.params.id);
  return res.json({ message: 'Dueño eliminado' });
});

module.exports = router;
