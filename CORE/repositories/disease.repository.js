/**
 * Repository Pattern: Disease
 * Abstrae la lógica de acceso a datos (Mongoose) de los servicios de CORE.
 * Responsabilidad: Manejo de datos puros de enfermedades.
 */
const Disease = require('../../BACKEND/models/Disease');

class DiseaseRepository {
    /**
     * Busca una enfermedad por ID
     */
    async findById(id) { 
        return await Disease.findById(id).lean(); 
    }

    /**
     * Obtiene todas las enfermedades
     */
    async findAll() { 
        return await Disease.find().lean(); 
    }

    /**
     * Busca una enfermedad por nombre
     */
    async findByName(name) {
        return await Disease.findOne({ name: name }).lean();
    }

    /**
     * Crea una nueva enfermedad
     */
    async create(data) {
        return await Disease.create(data);
    }

    /**
     * Actualiza una enfermedad
     */
    async update(id, data) {
        return await Disease.findByIdAndUpdate(id, data, { new: true }).lean();
    }
}

module.exports = new DiseaseRepository();
