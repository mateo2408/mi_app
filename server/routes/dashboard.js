// Endpoint agregado para poblar el dashboard en una sola consulta.
const express = require('express');
const Appointment = require('../models/Appointment');
const ClinicalRecord = require('../models/ClinicalRecord');
const Owner = require('../models/Owner');
const Pet = require('../models/Pet');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', requireAuth, async (_req, res) => {
  // Promise.all reduce latencia total al ejecutar operaciones en paralelo.
  const [owners, pets, appointments, records, recentAppointments, recentPets] = await Promise.all([
    Owner.countDocuments(),
    Pet.countDocuments(),
    Appointment.countDocuments(),
    ClinicalRecord.countDocuments(),
    Appointment.find().populate('petId', 'name').sort({ dateTime: -1 }).limit(5).lean(),
    Pet.find().populate('ownerId', 'fullName').sort({ createdAt: -1 }).limit(5).lean()
  ]);

  return res.json({
    counts: { owners, pets, appointments, records },
    recentAppointments,
    recentPets
  });
});

module.exports = router;
