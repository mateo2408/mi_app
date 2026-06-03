/**
 * CONTROLADOR: Diagnostics
 * 
 * Responsabilidad: Orquestar el flujo HTTP para diagnósticos.
 * Delega la lógica de negocio al CORE (OutbreakAnalyzer, DiseaseService, etc).
 * 
 * Este controlador es PURO CRUD + orquestación, sin lógica de negocio.
 */

const { repositories, outbreakAnalyzer, diseaseService, epidemicComparator, inventoryService } = require('../../CORE');

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
 * Registra una nueva enfermedad en el catalogo.
 */
const createDisease = async (req, res) => {
    try {
        const validation = diseaseService.validateDiseaseData(req.body);

        if (!validation.valid) {
            return res.status(400).json({
                message: 'Datos de enfermedad invalidos',
                errors: validation.errors
            });
        }

        const existingDisease = await repositories.DiseaseRepository.findByName(validation.data.name);

        if (existingDisease) {
            return res.status(409).json({ message: 'La enfermedad ya existe en el catalogo' });
        }

        const availableMedicationNames = new Set(
            (await inventoryService.listInventory()).map((item) => item.medication)
        );
        const missingMedications = validation.data.medications.filter((medication) => !availableMedicationNames.has(medication));

        if (missingMedications.length > 0) {
            return res.status(400).json({
                message: 'Todos los medicamentos asociados deben existir en el inventario',
                missingMedications
            });
        }

        const disease = await repositories.DiseaseRepository.create(validation.data);
        return res.status(201).json(disease);
    } catch (err) {
        console.error('[Diagnostics Controller] Error en createDisease:', err);
        return res.status(500).json({ message: 'Error creando la enfermedad.' });
    }
};

/**
 * Obtiene la lista de mascotas/casos asociados a un brote.
 */
const getTreatmentCases = async (req, res) => {
    try {
        const { diseaseId } = req.params;
        const disease = await repositories.DiseaseRepository.findById(diseaseId);

        if (!disease) {
            return res.status(404).json({ message: 'Enfermedad no encontrada' });
        }

        const cases = await repositories.DiagnosisRepository.findByDiseaseSorted(diseaseId);
        const analysis = await outbreakAnalyzer.analyzeDisease(diseaseId);
            const medications = Array.isArray(disease.medications) && disease.medications.length > 0
                ? disease.medications
                : (disease.medication ? [disease.medication] : []);

        return res.json({
            disease: {
                _id: disease._id,
                name: disease.name,
                medication: disease.medication,
                    medications,
                outbreakThreshold: disease.outbreakThreshold
            },
            cases: cases.map((item) => ({
                _id: item._id,
                petName: item.petName,
                diseaseId: item.diseaseId,
                date: item.date
            })),
            analysis
        });
    } catch (err) {
        console.error('[Diagnostics Controller] Error en getTreatmentCases:', err);
        return res.status(500).json({ message: 'Error obteniendo los casos del brote.' });
    }
};

/**
 * Aplica un tratamiento a una mascota y descuenta inventario.
 */
const applyTreatment = async (req, res) => {
    const { diseaseId, petName, medication } = req.body;

    if (!diseaseId || !petName) {
        return res.status(400).json({ message: 'diseaseId y petName son requeridos' });
    }

    let consumedMedication = false;
    let removedDiagnosis = false;

    try {
        const disease = await repositories.DiseaseRepository.findById(diseaseId);
        if (!disease) {
            return res.status(404).json({ message: 'Enfermedad no encontrada' });
        }

        const availableMedications = Array.isArray(disease.medications) && disease.medications.length > 0
            ? disease.medications
            : (disease.medication ? [disease.medication] : []);
        const selectedMedication = typeof medication === 'string' && medication.trim() !== ''
            ? medication.trim()
            : availableMedications[0] || '';

        if (!selectedMedication) {
            return res.status(400).json({ message: 'La enfermedad no tiene medicamentos asociados' });
        }

        if (!availableMedications.includes(selectedMedication)) {
            return res.status(400).json({ message: 'El medicamento seleccionado no pertenece a esta enfermedad' });
        }

        const diagnosis = await repositories.DiagnosisRepository.deleteByDiseaseAndPetName(diseaseId, petName);
        if (!diagnosis) {
            return res.status(404).json({ message: 'No se encontro un caso de esa mascota para esa enfermedad' });
        }

        removedDiagnosis = true;

        const inventoryResult = await inventoryService.consumeMedication(selectedMedication, 1);
        if (!inventoryResult.ok) {
            await repositories.DiagnosisRepository.create({ petName, diseaseId });
            return res.status(inventoryResult.status || 400).json({ message: inventoryResult.message });
        }

        consumedMedication = true;

        const outbreakAnalysis = await outbreakAnalyzer.analyzeDisease(diseaseId);

        return res.json({
            message: 'Tratamiento administrado correctamente',
            treatedCase: {
                petName,
                diseaseId,
                medication: selectedMedication
            },
            inventory: inventoryResult.item,
            outbreakAnalysis
        });
    } catch (err) {
        if (consumedMedication) {
            await inventoryService.restoreMedication((req.body.medication || (await repositories.DiseaseRepository.findById(diseaseId))?.medication) || '', 1);
        }
        if (removedDiagnosis) {
            await repositories.DiagnosisRepository.create({ petName, diseaseId });
        }
        console.error('[Diagnostics Controller] Error en applyTreatment:', err);
        return res.status(500).json({ message: 'Error aplicando el tratamiento.' });
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
    createDisease,
    getTreatmentCases,
    applyTreatment,
    getDiseases,
    getCriticalDiseases,
    analyzeOutbreak,
    analyzeAllOutbreaks,
    compareEpidemiology,
    getEpidemicReport
};
