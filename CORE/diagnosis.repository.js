/**
 * Patron Repositorio (Repository Pattern):
 * Abstrae la logica de acceso a datos (Mongoose) del Controlador.
 * Esto permite cambiar la base de datos en el futuro sin afectar la logica de negocio.
 */
const Diagnosis = require('../BACKEND/models/Diagnosis');

class DiagnosisRepository {
    /**
     * Guarda un nuevo diagnostico en la base de datos.
     * @param {Object} data - Datos del diagnostico (petName, diseaseId).
     */
    async create(data) { 
        return await Diagnosis.create(data); 
    }
    
    /**
     * Busca diagnosticos recientes por id de enfermedad.
     * Optimizacion de memoria: Filtra usando operadores de MongoDB ($gte)
     * en lugar de traer todos los registros y filtrarlos en Javascript.
     * 
     * @param {String} diseaseId - El ObjectId de la enfermedad
     * @param {Number} days - Cantidad de dias hacia atras a buscar (por defecto 60)
     */
    async findRecentByDisease(diseaseId, days = 60) {
        const sinceDate = new Date();
        // Restar la cantidad de dias a la fecha actual
        sinceDate.setDate(sinceDate.getDate() - days);
        
        return await Diagnosis.find({
            diseaseId: diseaseId,
            date: { $gte: sinceDate } // $gte significa "Greater Than or Equal" (Mayor o igual que)
        }).lean(); // .lean() retorna un objeto JS puro, mas rapido que un documento Mongoose
    }
}

module.exports = new DiagnosisRepository();
