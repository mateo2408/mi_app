/**
 * SRP (Single Responsibility Principle): Disease Service
 * ISP (Interface Segregation Principle): Recibe solo DiseaseRepository, expone métodos de enfermedades.
 * DIP (Dependency Inversion Principle): Depende de DiseaseRepository (abstracción), no de Mongoose.
 *
 * Responsabilidad única: Lógica de negocio relacionada con enfermedades.
 * - Validación de datos
 * - Normalización de información
 * - Cálculos basados en metadatos de enfermedades
 */

class DiseaseService {
    constructor(diseaseRepository) {
        this.diseaseRepository = diseaseRepository;
    }

    /**
     * Obtiene una enfermedad con validaciones y procesamiento
     * @param {String} diseaseId - ID de la enfermedad
     * @returns {Object} - Enfermedad enriquecida
     */
    async getDisease(diseaseId) {
        const disease = await this.diseaseRepository.findById(diseaseId);
        if (!disease) {
            throw new Error(`Enfermedad ${diseaseId} no encontrada`);
        }
        return this._enrichDiseaseData(disease);
    }

    /**
     * Obtiene todas las enfermedades con información procesada
     * @returns {Array} - Lista de enfermedades enriquecidas
     */
    async getAllDiseases() {
        const diseases = await this.diseaseRepository.findAll();
        return diseases.map(disease => this._enrichDiseaseData(disease));
    }

    /**
     * Obtiene enfermedades críticas (threshold bajo = más probable brote)
     * @returns {Array} - Enfermedades ordenadas por riesgo
     */
    async getCriticalDiseases() {
        const diseases = await this.diseaseRepository.findAll();
        return diseases
            .map(d => this._enrichDiseaseData(d))
            .filter(d => d.riskLevel === 'high')
            .sort((a, b) => a.outbreakThreshold - b.outbreakThreshold);
    }

    /**
     * Valida datos de una enfermedad para crear/actualizar
     * @param {Object} data - Datos a validar
     * @returns {Object} - Datos validados o error
     */
    validateDiseaseData(data) {
        const errors = [];

        const normalizeMedicationList = (value) => {
            const list = Array.isArray(value) ? value : [];
            return [...new Set(list.map((item) => String(item || '').trim()).filter(Boolean))];
        };

        if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
            errors.push('El nombre de la enfermedad es requerido');
        }

        const medicationsFromArray = normalizeMedicationList(data.medications);
        const medicationsFromSingleValue = typeof data.medication === 'string'
            ? normalizeMedicationList([data.medication])
            : [];
        const medications = medicationsFromArray.length > 0 ? medicationsFromArray : medicationsFromSingleValue;

        if (medications.length === 0) {
            errors.push('Debe seleccionar al menos un medicamento');
        }

        if (data.outbreakThreshold !== undefined) {
            if (typeof data.outbreakThreshold !== 'number' || data.outbreakThreshold < 1) {
                errors.push('El threshold debe ser un número positivo');
            }
        }

        if (errors.length > 0) {
            return { valid: false, errors };
        }

        return {
            valid: true,
            data: {
                name: data.name.trim(),
                medication: medications[0],
                medications,
                outbreakThreshold: data.outbreakThreshold || 6
            }
        };
    }

    /**
     * Enriquece los datos de una enfermedad con información calculada
     * @private
     */
    _enrichDiseaseData(disease) {
        const threshold = disease.outbreakThreshold || 6;
        const medications = Array.isArray(disease.medications) && disease.medications.length > 0
            ? disease.medications
            : (disease.medication ? [disease.medication] : []);
        return {
            ...disease,
            medications,
            riskLevel: this._calculateRiskLevel(threshold),
            description: `${disease.name} - Tratamientos: ${medications.join(', ') || disease.medication}`,
            createdAtFormatted: disease.createdAt ? new Date(disease.createdAt).toLocaleDateString() : null
        };
    }

    /**
     * Calcula nivel de riesgo basado en threshold
     * Threshold bajo = más casos necesarios = menos riesgo
     * @private
     */
    _calculateRiskLevel(threshold) {
        if (threshold <= 3) return 'critical';
        if (threshold <= 5) return 'high';
        if (threshold <= 8) return 'medium';
        return 'low';
    }
}

module.exports = DiseaseService;
