// CRUD de historia clínica.
const express = require('express');
const ClinicalRecord = require('../models/ClinicalRecord');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (_req, res) => {
  // Populate para contexto clínico completo en una sola respuesta.
  const records = await ClinicalRecord.find()
    .populate({ path: 'petId', populate: { path: 'ownerId', select: 'fullName' } })
    .sort({ recordDate: -1 })
    .lean();

  return res.json(records);
});

router.post('/', requireAuth, async (req, res) => {
  const record = await ClinicalRecord.create(req.body);
  return res.status(201).json(record);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await ClinicalRecord.findByIdAndDelete(req.params.id);
  return res.json({ message: 'Registro eliminado' });
});

module.exports = router;
