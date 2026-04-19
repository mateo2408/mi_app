/**
 * Controlador de Mascotas (Pets Controller).
 * Maneja las peticiones HTTP y orquesta la logica de CRUD basica.
 */
const Pet = require('../models/Pet');

/** Obtenemos todas las mascotas */
const getPets = async (req, res) => {
  try {
    const pets = await Pet.find();
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving pets' });
  }
};

/** Creamos una nueva mascota */
const createPet = async (req, res) => {
  try {
    const newPet = new Pet(req.body);
    await newPet.save();
    res.status(201).json(newPet);
  } catch (error) {
    res.status(500).json({ message: 'Error creating pet' });
  }
};

/** Actualiza una mascota existente mediante su ID */
const updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedPet = await Pet.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedPet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    res.json(updatedPet);
  } catch (error) {
    res.status(500).json({ message: 'Error updating pet' });
  }
};

/** Elimina una mascota de la base de datos */
const deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPet = await Pet.findByIdAndDelete(id);
    if (!deletedPet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting pet' });
  }
};

module.exports = {
  getPets,
  createPet,
  updatePet,
  deletePet
};
