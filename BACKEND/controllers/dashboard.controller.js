const Appointment = require('../models/Appointment');
const ClinicalRecord = require('../models/ClinicalRecord');
const Owner = require('../models/Owner');
const Pet = require('../models/Pet');
const getSummary = async (_req, res) => { const [owners, pets, appointments, records, recentAppointments, recentPets] = await Promise.all([ Owner.countDocuments(), Pet.countDocuments(), Appointment.countDocuments(), ClinicalRecord.countDocuments(), Appointment.find().populate('petId', 'name').sort({ dateTime: -1 }).limit(5).lean(), Pet.find().populate('ownerId', 'fullName').sort({ createdAt: -1 }).limit(5).lean() ]); return res.json({ counts: { owners, pets, appointments, records }, recentAppointments, recentPets }); };
module.exports = { getSummary };