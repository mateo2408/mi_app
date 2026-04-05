// CRUD de citas y cambio de estado operativo.
const express = require('express');
const Appointment = require('../models/Appointment');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (_req, res) => {
  // Populate anidado para traer mascota y dueño en la misma respuesta.
  const appointments = await Appointment.find()
    .populate({ path: 'petId', populate: { path: 'ownerId', select: 'fullName' } })
    .sort({ dateTime: -1 })
    .lean();

  return res.json(appointments);
});

router.post('/', requireAuth, async (req, res) => {
  const appointment = await Appointment.create(req.body);
  return res.status(201).json(appointment);
});

router.patch('/:id', requireAuth, async (req, res) => {
  // PATCH permite actualizar campos puntuales (por ejemplo estado).
  const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  return res.json(appointment);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await Appointment.findByIdAndDelete(req.params.id);
  return res.json({ message: 'Cita eliminada' });
});

module.exports = router;
