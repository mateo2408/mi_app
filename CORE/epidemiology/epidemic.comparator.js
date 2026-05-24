/**
 * CORE SERVICE: Epidemic Comparator
 * 
 * Responsabilidad: Realizar análisis comparativos entre epidemiologías.
 * - Comparar tasas de incidencia
 * - Identificar patrones
 * - Generar reportes comparativos
 */

class EpidemicComparator {
    constructor(outbreakAnalyzer) {
        this.outbreakAnalyzer = outbreakAnalyzer;
    }

    /**
     * Compara dos enfermedades en términos epidemiológicos
     * @param {String} diseaseId1 - Primera enfermedad
     * @param {String} diseaseId2 - Segunda enfermedad
     * @returns {Object} - Análisis comparativo detallado
     */
    async compareDisease(diseaseId1, diseaseId2) {
        const comparison = await this.outbreakAnalyzer.compareEpidemiology(diseaseId1, diseaseId2);
        
        return {
            ...comparison,
            interpretation: this._interpretComparison(comparison)
        };
    }

    /**
     * Clasifica enfermedades por nivel de brote
     * @returns {Object} - Enfermedades agrupadas por estado
     */
    async classifyDiseasesByOutbreakStatus() {
        const analysis = await this.outbreakAnalyzer.analyzeAllDiseases();
        
        const classified = {
            outbreaks: [],
            atRisk: [],
            stable: []
        };

        for (const result of analysis.analysisResults) {
            if (result.isOutbreak) {
                classified.outbreaks.push({
                    disease: result.diseaseInfo.name,
                    cases: result.caseCount,
                    threshold: result.threshold,
                    severity: this._determineSeverity(result.caseCount, result.threshold)
                });
            } else if (result.caseCount >= result.threshold * 0.7) {
                // 70% del threshold = en riesgo
                classified.atRisk.push({
                    disease: result.diseaseInfo.name,
                    cases: result.caseCount,
                    threshold: result.threshold,
                    percentageOfThreshold: Math.round((result.caseCount / result.threshold) * 100)
                });
            } else {
                classified.stable.push({
                    disease: result.diseaseInfo.name,
                    cases: result.caseCount,
                    threshold: result.threshold
                });
            }
        }

        return classified;
    }

    /**
     * Genera un reporte epidemiológico comparativo
     * @returns {Object} - Reporte estructurado
     */
    async generateEpidemicReport() {
        const analysis = await this.outbreakAnalyzer.analyzeAllDiseases();
        const classified = await this.classifyDiseasesByOutbreakStatus();

        const totalCases = analysis.analysisResults.reduce((sum, r) => sum + r.caseCount, 0);
        const avgCasesPerDisease = totalCases / analysis.analysisResults.length;

        return {
            summary: {
                totalDiseases: analysis.totalDiseases,
                activeOutbreaks: classified.outbreaks.length,
                diseasesAtRisk: classified.atRisk.length,
                stableDiseases: classified.stable.length,
                totalCasesRecorded: totalCases,
                averageCasesPerDisease: avgCasesPerDisease.toFixed(2)
            },
            classification: classified,
            timestamp: new Date().toISOString(),
            recommendations: this._generateRecommendations(classified, analysis)
        };
    }

    /**
     * Interpreta resultados de comparación
     * @private
     */
    _interpretComparison(comparison) {
        const caseRatio = comparison.comparison.caseRatio;
        let interpretation = '';

        if (comparison.comparison.bothAreOutbreaks) {
            interpretation = 'CRÍTICO: Ambas enfermedades están en estado de brote.';
        } else if (comparison.comparison.eitherIsOutbreak) {
            const outbreakDisease = comparison.disease1.isOutbreak ? 'disease1' : 'disease2';
            interpretation = `UNA ENFERMEDAD EN BROTE: ${outbreakDisease} requiere atención inmediata.`;
        } else if (comparison.comparison.caseRatio > 2) {
            interpretation = `La enfermedad 1 es ${comparison.comparison.caseRatio.toFixed(1)}x más prevalente.`;
        } else if (comparison.comparison.caseRatio < 0.5) {
            interpretation = `La enfermedad 2 es ${(1 / comparison.comparison.caseRatio).toFixed(1)}x más prevalente.`;
        } else {
            interpretation = 'Ambas enfermedades tienen prevalencia similar.';
        }

        return interpretation;
    }

    /**
     * Determina severidad basada en casos vs threshold
     * @private
     */
    _determineSeverity(caseCount, threshold) {
        const ratio = caseCount / threshold;
        if (ratio >= 2) return 'CRITICAL';
        if (ratio >= 1.5) return 'HIGH';
        return 'MEDIUM';
    }

    /**
     * Genera recomendaciones basadas en análisis
     * @private
     */
    _generateRecommendations(classified, analysis) {
        const recommendations = [];

        if (classified.outbreaks.length > 0) {
            recommendations.push({
                priority: 'URGENT',
                action: `Reabastecer farmacia: ${classified.outbreaks.map(o => o.disease).join(', ')}`
            });
        }

        if (classified.atRisk.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                action: `Monitorear: ${classified.atRisk.map(a => a.disease).join(', ')}`
            });
        }

        const avgCases = analysis.analysisResults.reduce((sum, r) => sum + r.caseCount, 0) / analysis.analysisResults.length;
        if (avgCases > 5) {
            recommendations.push({
                priority: 'MEDIUM',
                action: 'Considerar aumentar capacidad de almacén'
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                priority: 'LOW',
                action: 'Situación bajo control. Continuar monitoreo rutinario.'
            });
        }

        return recommendations;
    }
}

module.exports = EpidemicComparator;
