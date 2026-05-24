/**
 * Repository Pattern: Diagnosis
 * Abstrae la lógica de acceso a datos (Mongoose) de los servicios de CORE.
 * Responsabilidad: Manejo de datos puros de diagnósticos.
 */
const Diagnosis = require('../../BACKEND/models/Diagnosis');

class DiagnosisRepository {
    /**
     * Guarda un nuevo diagnóstico en la base de datos.
     * @param {Object} data - Datos del diagnóstico (petName, diseaseId).
     */
    async create(data) { 
        return await Diagnosis.create(data); 
    }
    
    /**
     * Busca diagnósticos recientes por id de enfermedad.
     * Optimización de memoria: Filtra usando operadores de MongoDB ($gte)
     * en lugar de traer todos los registros y filtrarlos en Javascript.
     * 
     * @param {String} diseaseId - El ObjectId de la enfermedad
     * @param {Number} days - Cantidad de días hacia atrás a buscar (por defecto 60)
     */
    async findRecentByDisease(diseaseId, days = 60) {
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);
        
        return await Diagnosis.find({
            diseaseId: diseaseId,
            date: { $gte: sinceDate }
        }).lean();
    }

    /**
     * Busca todos los diagnósticos de una enfermedad
     */
    async findByDisease(diseaseId) {
        return await Diagnosis.find({ diseaseId: diseaseId }).lean();
    }

    /**
     * Busca un diagnóstico por ID
     */
    async findById(id) {
        return await Diagnosis.findById(id).lean();
    }

    /**
     * Obtiene todos los diagnósticos
     */
    async findAll() {
        return await Diagnosis.find().lean();
    }
}

module.exports = new DiagnosisRepository();
