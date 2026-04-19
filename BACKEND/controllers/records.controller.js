const ClinicalRecord = require('../models/ClinicalRecord');
const getRecords = async (_req, res) => { const records = await ClinicalRecord.find().populate({ path: 'petId', populate: { path: 'ownerId', select: 'fullName' } }).sort({ recordDate: -1 }).lean(); return res.json(records); };
const createRecord = async (req, res) => { const record = await ClinicalRecord.create(req.body); return res.status(201).json(record); };
const updateRecord = async (req, res) => { const record = await ClinicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true }); return res.json(record); };
const deleteRecord = async (req, res) => { await ClinicalRecord.findByIdAndDelete(req.params.id); return res.json({ message: 'Registro eliminado' }); };
module.exports = { getRecords, createRecord, updateRecord, deleteRecord };