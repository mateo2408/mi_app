const Appointment = require('../models/Appointment');
const getAppointments = async (_req, res) => { const appointments = await Appointment.find().populate({ path: 'petId', populate: { path: 'ownerId', select: 'fullName' } }).sort({ dateTime: -1 }).lean(); return res.json(appointments); };
const createAppointment = async (req, res) => { const appointment = await Appointment.create(req.body); return res.status(201).json(appointment); };
const updateAppointment = async (req, res) => { const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true }); return res.json(appointment); };
const deleteAppointment = async (req, res) => { await Appointment.findByIdAndDelete(req.params.id); return res.json({ message: 'Cita eliminada' }); };
module.exports = { getAppointments, createAppointment, updateAppointment, deleteAppointment };