/**
 * CONTROLADOR: Diagnostics
 * 
 * Responsabilidad: Orquestar el flujo HTTP para diagnósticos.
 * Delega la lógica de negocio al CORE (OutbreakAnalyzer, DiseaseService, etc).
 * 
 * Este controlador es PURO CRUD + orquestación, sin lógica de negocio.
 */

const { repositories, outbreakAnalyzer, diseaseService, epidemicComparator } = require('../../CORE');

/**
 * Registra un nuevo diagnóstico y analiza si hay brote epidemiológico.
 * 
 * Flujo:
 * 1. Guardar diagnosis en BD
 * 2. Delegar análisis epidemiológico al CORE
 * 3. Retornar resultado + alerta si procede
 */
const createDiagnostic = async (req, res) => {
    try {
        const { petName, diseaseId } = req.body;

        if (!petName || !diseaseId) {
            return res.status(400).json({ message: 'petName y diseaseId son requeridos' });
        }

        // 1. Guardar el diagnóstico en BD (CRUD básico)
        const diagnosis = await repositories.DiagnosisRepository.create({ petName, diseaseId });

        // 2. LÓGICA DE NEGOCIO: Analizar brote epidemiológico (delegado al CORE)
        const outbreakAnalysis = await outbreakAnalyzer.analyzeDisease(diseaseId);

        if (!outbreakAnalysis.diseaseInfo) {
            return res.status(404).json({ message: 'Enfermedad no encontrada' });
        }

        // 3. Retornar respuesta con análisis
        return res.status(201).json({
            diagnosis,
            outbreakAnalysis,
            alert: outbreakAnalysis.alert,
            message: 'Diagnóstico registrado exitosamente.'
        });
    } catch (err) {
        console.error('[Diagnostics Controller] Error en createDiagnostic:', err);
        return res.status(500).json({ message: 'Error procesando el diagnóstico.' });
    }
};

/**
 * Obtiene todas las enfermedades catalogadas.
 */
const getDiseases = async (_req, res) => {
    try {
        const diseases = await diseaseService.getAllDiseases();
        return res.json(diseases);
    } catch (err) {
        console.error('[Diagnostics Controller] Error en getDiseases:', err);
        return res.status(500).json({ message: 'No se pudo obtener el catálogo.' });
    }
};

/**
 * Obtiene enfermedades críticas (alto riesgo de brote).
 */
const getCriticalDiseases = async (_req, res) => {
    try {
        const diseases = await diseaseService.getCriticalDiseases();
        return res.json(diseases);
    } catch (err) {
        console.error('[Diagnostics Controller] Error en getCriticalDiseases:', err);
        return res.status(500).json({ message: 'Error obteniendo enfermedades críticas.' });
    }
};

/**
 * Analiza brote de una enfermedad específica.
 */
const analyzeOutbreak = async (req, res) => {
    try {
        const { diseaseId } = req.params;
        const analysis = await outbreakAnalyzer.analyzeDisease(diseaseId);
        return res.json(analysis);
    } catch (err) {
        console.error('[Diagnostics Controller] Error en analyzeOutbreak:', err);
        return res.status(500).json({ message: 'Error analizando brote.' });
    }
};

/**
 * Analiza todos los brotes activos.
 */
const analyzeAllOutbreaks = async (_req, res) => {
    try {
        const analysis = await outbreakAnalyzer.analyzeAllDiseases();
        return res.json(analysis);
    } catch (err) {
        console.error('[Diagnostics Controller] Error en analyzeAllOutbreaks:', err);
        return res.status(500).json({ message: 'Error analizando brotes.' });
    }
};

/**
 * Compara epidemiología entre dos enfermedades.
 */
const compareEpidemiology = async (req, res) => {
    try {
        const { diseaseId1, diseaseId2 } = req.params;
        const comparison = await epidemicComparator.compareDisease(diseaseId1, diseaseId2);
        return res.json(comparison);
    } catch (err) {
        console.error('[Diagnostics Controller] Error en compareEpidemiology:', err);
        return res.status(500).json({ message: 'Error comparando epidemiología.' });
    }
};

/**
 * Obtiene un reporte epidemiológico completo.
 */
const getEpidemicReport = async (_req, res) => {
    try {
        const report = await epidemicComparator.generateEpidemicReport();
        return res.json(report);
    } catch (err) {
        console.error('[Diagnostics Controller] Error en getEpidemicReport:', err);
        return res.status(500).json({ message: 'Error generando reporte epidemiológico.' });
    }
};

module.exports = {
    createDiagnostic,
    getDiseases,
    getCriticalDiseases,
    analyzeOutbreak,
    analyzeAllOutbreaks,
    compareEpidemiology,
    getEpidemicReport
};
