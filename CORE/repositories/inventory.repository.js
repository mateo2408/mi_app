/**
 * Repository Pattern: Inventory
 * Abstrae la lógica de acceso a datos (Mongoose) de los servicios de CORE.
 * Responsabilidad: Manejo de datos puros del inventario de medicamentos.
 */
const MedicationInventory = require('../../BACKEND/models/MedicationInventory');

class InventoryRepository {
    async findAll() {
        return await MedicationInventory.find().sort({ medication: 1 }).lean();
    }

    async findById(id) {
        return await MedicationInventory.findById(id).lean();
    }

    async findByMedicationKey(medicationKey) {
        return await MedicationInventory.findOne({ medicationKey }).lean();
    }

    async create(data) {
        return await MedicationInventory.create(data);
    }

    async update(id, data) {
        return await MedicationInventory.findByIdAndUpdate(id, data, { new: true }).lean();
    }

    async adjustByMedicationKey(medicationKey, delta) {
        return await MedicationInventory.findOneAndUpdate(
            {
                medicationKey,
                ...(delta < 0 ? { stock: { $gte: Math.abs(delta) } } : {})
            },
            { $inc: { stock: delta } },
            { new: true }
        ).lean();
    }
}

module.exports = new InventoryRepository();
