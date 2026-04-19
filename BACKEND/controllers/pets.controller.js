const Pet = require('../models/Pet');
const getPets = async (_req, res) => { const pets = await Pet.find().populate('ownerId', 'fullName phone email').sort({ createdAt: -1 }).lean(); return res.json(pets); };
const createPet = async (req, res) => { const pet = await Pet.create(req.body); return res.status(201).json(pet); };
const updatePet = async (req, res) => { const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true }); return res.json(pet); };
const deletePet = async (req, res) => { await Pet.findByIdAndDelete(req.params.id); return res.json({ message: 'Mascota eliminada' }); };
module.exports = { getPets, createPet, updatePet, deletePet };