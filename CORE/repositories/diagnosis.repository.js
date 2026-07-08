/**
 * SRP (Single Responsibility Principle): Repository Pattern — Diagnosis
 * DIP (Dependency Inversion Principle): Abstrae la lógica de acceso a datos (Mongoose) de los servicios de CORE.
 * Responsabilidad única: Manejo de datos puros de diagnósticos (CRUD directo con Mongoose).
 * 
 * Los servicios CORE (OutbreakAnalyzer) dependen de esta abstracción, no de Mongoose directamente.
 * Esto permite cambiar la BD sin tocar el análisis epidemiológico.
 */
const Diagnosis = require('../../BACKEND/models/Diagnosis');

class DiagnosisRepository {
    /**
     * Guarda un nuevo diagnóstico en la base de datos.
     * @param {Object} data - Datos del diagnóstico (petName, diseaseId).
     */
    async create(data) { 
        // Inserta diagnosticos nuevos que luego alimentan el grafico y el calculo de brotes.
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
        // Solo trae diagnosticos dentro de la ventana temporal usada por el analisis epidemiologico.
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
     * Busca diagnósticos por enfermedad ordenados por fecha descendente.
     */
    async findByDiseaseSorted(diseaseId) {
        // Orden descendente para que las pantallas de tratamiento muestren primero los casos mas nuevos.
        return await Diagnosis.find({ diseaseId: diseaseId }).sort({ date: -1 }).lean();
    }

    /**
     * Obtiene un historial reciente de diagnósticos con la enfermedad poblada.
     */
    async findRecentWithDisease(days = 30, limit = 10) {
        const safeDays = Number.isFinite(Number(days)) ? Math.max(1, Number(days)) : 30;
        const safeLimit = Number.isFinite(Number(limit)) ? Math.min(Math.max(1, Number(limit)), 50) : 10;

        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - safeDays);

        const diagnoses = await Diagnosis.find({
            date: { $gte: sinceDate }
        })
            .sort({ date: -1 })
            .limit(safeLimit)
            .populate('diseaseId', 'name medication medications outbreakThreshold')
            .lean();

        return diagnoses.map((item) => ({
            _id: item._id,
            petName: item.petName,
            date: item.date,
            disease: item.diseaseId
                ? {
                      _id: item.diseaseId._id,
                      name: item.diseaseId.name,
                      medication: item.diseaseId.medication,
                      medications: item.diseaseId.medications || [],
                      outbreakThreshold: item.diseaseId.outbreakThreshold
                  }
                : null
        }));
    }

    /**
     * Elimina un diagnostico especifico asociado a una mascota y una enfermedad.
     */
    async deleteByDiseaseAndPetName(diseaseId, petName) {
        // Se usa para revertir una aplicacion de tratamiento cuando ocurre un error.
        return await Diagnosis.findOneAndDelete({ diseaseId: diseaseId, petName: petName });
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
