/**
 * @StudyGuide [MODELO] Inventario de medicamentos
 * Gestiona existencias y umbrales de reabastecimiento para farmacia.
 */
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    medication: { type: String, required: true, trim: true },
    medicationKey: { type: String, required: true, unique: true, index: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    minStock: { type: Number, required: true, default: 0, min: 0 },
    unit: { type: String, required: true, default: 'unidades', trim: true }
}, {
    timestamps: true,
    collection: 'medication_inventory'
});

module.exports = mongoose.model('MedicationInventory', schema);
