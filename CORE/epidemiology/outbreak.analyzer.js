/**
 * CORE SERVICE: Outbreak Analyzer (Analizador de Brotes)
 * 
 * Responsabilidad: Contiene la lógica de negocio para análisis epidemiológico.
 * Este es el corazón inteligente de la aplicación.
 * 
 * Regla de Negocio Principal:
 * - Si se detectan 6 o más casos de una enfermedad en los últimos 60 días,
 *   se activa una alerta de reabastecimiento de farmacia.
 * 
 * Patrón: Inyección de dependencias para repositories
 */

class OutbreakAnalyzer {
    constructor(diagnosisRepository, diseaseRepository) {
        this.diagnosisRepository = diagnosisRepository;
        this.diseaseRepository = diseaseRepository;
    }

    /**
     * Analiza si existe un brote epidemiológico para una enfermedad.
     * 
     * @param {String} diseaseId - ID de la enfermedad
     * @param {Number} threshold - Umbral de casos para considerar brote (default: 6)
     * @param {Number} windowDays - Ventana de tiempo en días (default: 60)
     * 
     * @returns {Object} - Objeto con información del análisis
     *   {
     *     isOutbreak: boolean,
     *     caseCount: number,
     *     threshold: number,
     *     windowDays: number,
     *     diseaseInfo: Object,
     *     alert: Object|null
     *   }
     */
    async analyzeDisease(diseaseId, threshold = 6, windowDays = 60) {
        try {
            // 1. Obtener información de la enfermedad
            const disease = await this.diseaseRepository.findById(diseaseId);
            if (!disease) {
                return {
                    isOutbreak: false,
                    error: 'Enfermedad no encontrada',
                    caseCount: 0,
                    diseaseInfo: null
                };
            }

            // 2. Usar el threshold configurado en la enfermedad si existe
            const effectiveThreshold = disease.outbreakThreshold || threshold;

            // 3. Obtener diagnósticos recientes
            const recentDiagnoses = await this.diagnosisRepository.findRecentByDisease(
                diseaseId,
                windowDays
            );

            const caseCount = recentDiagnoses.length;

            // 4. Determinar si hay brote
            const isOutbreak = caseCount >= effectiveThreshold;

            // 5. Construir respuesta
            const result = {
                isOutbreak,
                caseCount,
                threshold: effectiveThreshold,
                windowDays,
                diseaseInfo: {
                    id: disease._id,
                    name: disease.name,
                    medication: disease.medication
                },
                recentDiagnoses: recentDiagnoses.slice(0, 10), // Últimos 10 casos
                alert: null
            };

            // 6. Si hay brote, crear alerta
            if (isOutbreak) {
                result.alert = this._generateAlert(disease, caseCount, effectiveThreshold);
            }

            return result;
        } catch (error) {
            console.error('[OutbreakAnalyzer] Error en analyzeDisease:', error);
            throw error;
        }
    }

    /**
     * Analiza TODAS las enfermedades para detectar brotes
     * 
     * @returns {Object} - Resumen de brotes activos
     */
    async analyzeAllDiseases() {
        try {
            const diseases = await this.diseaseRepository.findAll();
            const results = [];
            const activeOutbreaks = [];

            for (const disease of diseases) {
                const analysis = await this.analyzeDisease(disease._id);
                results.push(analysis);

                if (analysis.isOutbreak) {
                    activeOutbreaks.push(analysis);
                }
            }

            return {
                totalDiseases: diseases.length,
                analysisResults: results,
                activeOutbreaks,
                hasActiveOutbreaks: activeOutbreaks.length > 0
            };
        } catch (error) {
            console.error('[OutbreakAnalyzer] Error en analyzeAllDiseases:', error);
            throw error;
        }
    }

    /**
     * Compara epidemiología entre dos enfermedades
     * 
     * @param {String} diseaseId1 - Primera enfermedad
     * @param {String} diseaseId2 - Segunda enfermedad
     * @returns {Object} - Comparación detallada
     */
    async compareEpidemiology(diseaseId1, diseaseId2) {
        try {
            const analysis1 = await this.analyzeDisease(diseaseId1);
            const analysis2 = await this.analyzeDisease(diseaseId2);

            return {
                disease1: analysis1,
                disease2: analysis2,
                comparison: {
                    caseRatio: analysis1.caseCount / (analysis2.caseCount || 1),
                    morePrevalent: analysis1.caseCount > analysis2.caseCount ? 'disease1' : 'disease2',
                    caseDifference: Math.abs(analysis1.caseCount - analysis2.caseCount),
                    bothAreOutbreaks: analysis1.isOutbreak && analysis2.isOutbreak,
                    eitherIsOutbreak: analysis1.isOutbreak || analysis2.isOutbreak
                }
            };
        } catch (error) {
            console.error('[OutbreakAnalyzer] Error en compareEpidemiology:', error);
            throw error;
        }
    }

    /**
     * Genera una alerta estructurada
     * @private
     */
    _generateAlert(disease, caseCount, threshold) {
        return {
            type: 'OUTBREAK_ALERT',
            severity: this._calculateSeverity(caseCount, threshold),
            message: `ALERTA EPIDEMIOLÓGICA: ${caseCount} casos de ${disease.name} detectados en los últimos 60 días`,
            status: true,
            activeCases: caseCount,
            diseaseName: disease.name,
            medication: disease.medication,
            recommendation: `Comprar Lote de ${disease.medication}. Casos: ${caseCount}/${threshold}`,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Calcula la severidad de la alerta basada en exceso del threshold
     * @private
     */
    _calculateSeverity(caseCount, threshold) {
        const excessRatio = caseCount / threshold;
        if (excessRatio >= 2) return 'CRITICAL';
        if (excessRatio >= 1.5) return 'HIGH';
        return 'MEDIUM';
    }
}

module.exports = OutbreakAnalyzer;
