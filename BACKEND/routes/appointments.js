const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getAppointments, createAppointment, updateAppointment, deleteAppointment } = require('../controllers/appointments.controller');
const router = express.Router();
router.get('/', requireAuth, getAppointments);
router.post('/', requireAuth, createAppointment);
router.patch('/:id', requireAuth, updateAppointment);
router.delete('/:id', requireAuth, deleteAppointment);
module.exports = router;