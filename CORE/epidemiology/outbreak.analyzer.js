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
    constructor(diagnosisRepository, diseaseRepository, inventoryService) {
        this.diagnosisRepository = diagnosisRepository;
        this.diseaseRepository = diseaseRepository;
        this.inventoryService = inventoryService;
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
            // 1. Obtener la enfermedad para leer su medicamento y umbral configurado.
            const disease = await this.diseaseRepository.findById(diseaseId);
            if (!disease) {
                return {
                    isOutbreak: false,
                    error: 'Enfermedad no encontrada',
                    caseCount: 0,
                    diseaseInfo: null
                };
            }

            // 2. Usar el umbral propio de la enfermedad cuando exista.
            const effectiveThreshold = disease.outbreakThreshold || threshold;
            const diseaseMedications = this._getDiseaseMedications(disease);

            // 3. Recuperar los casos recientes que entran en la ventana de analisis.
            const recentDiagnoses = await this.diagnosisRepository.findRecentByDisease(
                diseaseId,
                windowDays
            );

            const caseCount = recentDiagnoses.length;

            // 4. Leer el inventario asociado a todos los tratamientos posibles.
            const medicationAvailabilities = this.inventoryService
                ? await Promise.all(diseaseMedications.map((medication) => this.inventoryService.getMedicationAvailability(medication)))
                : [];
            const medicationAvailability = medicationAvailabilities[0] || null;

            // 5. Comparar casos contra umbral para decidir si ya existe brote.
            const isOutbreak = caseCount >= effectiveThreshold;

            // 6. Construir una respuesta lista para dashboard y pantallas de detalle.
            const result = {
                isOutbreak,
                caseCount,
                threshold: effectiveThreshold,
                windowDays,
                diseaseInfo: {
                    id: disease._id,
                    name: disease.name,
                    medication: disease.medication,
                    medications: diseaseMedications
                },
                recentDiagnoses: recentDiagnoses.slice(0, 10), // Últimos 10 casos
                medicationAvailability,
                medicationAvailabilities,
                alert: null
            };

            // 7. Si hay brote, generar una alerta estructurada con recomendacion.
            if (isOutbreak) {
                result.alert = this._generateAlert(disease, caseCount, effectiveThreshold, medicationAvailabilities);
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
            // Recorre todo el catalogo para construir el estado epidemiologico global.
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
            // Ejecuta dos analisis independientes y arma una comparacion entre ambos resultados.
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
    _generateAlert(disease, caseCount, threshold, medicationAvailability) {
        // Traduce el estado de casos y stock a un mensaje accionable para el usuario.
        const inventoryInfo = medicationAvailability
            ? medicationAvailability.map((item) => ({
                medication: item.medication,
                available: item.available,
                minStock: item.minStock,
                unit: item.unit,
                status: item.status,
                needsRestock: item.needsRestock
            }))
            : [];

        const inventoryNote = inventoryInfo.length > 0
            ? inventoryInfo
                .map((item) => `${item.medication}: ${item.available} ${item.unit} (${this._formatStockStatus(item.status)})`)
                .join(' | ')
            : 'Stock no registrado en inventario';

        const medicationList = inventoryInfo.map((item) => item.medication);
        const recommendation = medicationList.length > 0
            ? `Opciones de tratamiento: ${medicationList.join(', ')}. Casos: ${caseCount}/${threshold}. ${inventoryNote}`
            : `No hay medicamentos asociados. Casos: ${caseCount}/${threshold}. ${inventoryNote}`;

        return {
            type: 'OUTBREAK_ALERT',
            severity: this._calculateSeverity(caseCount, threshold),
            message: `ALERTA EPIDEMIOLÓGICA: ${caseCount} casos de ${disease.name} detectados en los últimos 60 días`,
            status: true,
            activeCases: caseCount,
            diseaseName: disease.name,
            medication: disease.medication,
            medications: inventoryInfo,
            threshold,
            recommendation,
            inventory: inventoryInfo[0] || null,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Calcula la severidad de la alerta basada en exceso del threshold
     * @private
     */
    _calculateSeverity(caseCount, threshold) {
        // La severidad crece cuando los casos superan con mas margen el umbral.
        const excessRatio = caseCount / threshold;
        if (excessRatio >= 2) return 'CRITICAL';
        if (excessRatio >= 1.5) return 'HIGH';
        return 'MEDIUM';
    }

    /**
     * Traduce el estado de stock a un mensaje legible
     * @private
     */
    _formatStockStatus(status) {
        // Convierte el codigo interno del stock en texto entendible para el reporte.
        if (status === 'out') return 'agotado';
        if (status === 'low') return 'bajo';
        if (status === 'missing') return 'sin registro';
        return 'suficiente';
    }

    _getDiseaseMedications(disease) {
        const medications = Array.isArray(disease.medications) && disease.medications.length > 0
            ? disease.medications
            : (disease.medication ? [disease.medication] : []);

        return [...new Set(medications.map((item) => String(item || '').trim()).filter(Boolean))];
    }
}

module.exports = OutbreakAnalyzer;
