/**
 * SRP (Single Responsibility Principle): Repository Pattern — Disease
 * DIP (Dependency Inversion Principle): Abstrae la lógica de acceso a datos (Mongoose) de los servicios de CORE.
 * Responsabilidad única: Manejo de datos puros de enfermedades (CRUD directo con Mongoose).
 * 
 * Los servicios CORE dependen de esta abstracción, no de Mongoose directamente.
 * Esto permite cambiar la BD sin tocar la lógica de negocio.
 */
const Disease = require('../../BACKEND/models/Disease');

class DiseaseRepository {
    /**
     * Busca una enfermedad por ID
     */
    async findById(id) { 
        // Consulta una enfermedad por id y devuelve un documento plano para el servicio.
        return await Disease.findById(id).lean(); 
    }

    /**
     * Obtiene todas las enfermedades
     */
    async findAll() { 
        // Devuelve el catalogo completo de enfermedades sin metadatos de Mongoose.
        return await Disease.find().lean(); 
    }

    /**
     * Busca una enfermedad por nombre
     */
    async findByName(name) {
        // Busca por nombre exacto cuando el servicio necesita evitar duplicados.
        return await Disease.findOne({ name: name }).lean();
    }

    /**
     * Crea una nueva enfermedad
     */
    async create(data) {
        // Persiste una nueva enfermedad para que quede disponible en el catalogo.
        return await Disease.create(data);
    }

    /**
     * Actualiza una enfermedad
     */
    async update(id, data) {
        // Devuelve el registro actualizado para seguir trabajando con el estado nuevo.
        return await Disease.findByIdAndUpdate(id, data, { new: true }).lean();
    }
}

module.exports = new DiseaseRepository();
