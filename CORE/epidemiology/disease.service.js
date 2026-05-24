/**
 * CORE SERVICE: Disease Service
 * 
 * Responsabilidad: Contiene lógica de negocio relacionada con enfermedades.
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

        if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
            errors.push('El nombre de la enfermedad es requerido');
        }

        if (!data.medication || typeof data.medication !== 'string' || data.medication.trim() === '') {
            errors.push('El medicamento es requerido');
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
                medication: data.medication.trim(),
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
        return {
            ...disease,
            riskLevel: this._calculateRiskLevel(threshold),
            description: `${disease.name} - Tratamiento: ${disease.medication}`,
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
