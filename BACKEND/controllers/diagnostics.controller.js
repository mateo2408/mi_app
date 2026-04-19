/**
 * @StudyGuide [CONTROLADOR] Patrón MVC - Layer de Lógica de Aplicación
 * Responsabilidad: Orquestar el flujo desde que el Cliente (Angular) manda un diagnóstico
 * hasta que se almacena y se calculan las reglas de epidemiología para reabastecimiento.
 * No accede a DB directo, usa Repositorios (CORE).
 */
const DiagnosisRepo = require('../../CORE/diagnosis.repository');
const DiseaseRepo = require('../../CORE/disease.repository');

/**
 * @StudyGuide [CORE INTELIGENCIA - LOGICA DE 6 CASOS]
 * Registra un diagnóstico y evalúa estadísticamente si se superan los 6 casos en los últimos 60 días
 * para activar una alerta preventiva de Reabastecimiento de Farmacia.
 */
const createDiagnostic = async (req, res) => {
    try {
        const { petName, diseaseId } = req.body;
        
        // 1. Guardar (Persistir) el nuevo caso de diagnóstico.
        const diagnosis = await DiagnosisRepo.create({ petName, diseaseId });

        // 2. Traer los metadatos de la enfermedad (contiene la cura/medicamento).
        const disease = await DiseaseRepo.findById(diseaseId);
        if(!disease) {
            return res.status(404).json({ message: 'Enfermedad no catalogada.' });
        }

        // 3. Consultar la ventana epidemiológica (últimos 60 días).
        const recentRecords = await DiagnosisRepo.findRecentByDisease(diseaseId, 60);

        // 4. Conteo para determinar la frecuencia.
        let outbreakCount = 0;
        recentRecords.forEach(() => outbreakCount++);

        // 5. Lógica de Regla de Negocio (Si supera 6 casos = Alerta de Reabastecimiento)
        let alert = null;
        // Obligamos el requerimiento del negocio a 6 casos (o el del modelo si existe)
        const threshold = disease.outbreakThreshold || 6; 

        if (outbreakCount >= threshold) {
            // Umbral alcanzado: Retorna respuesta enriquecida
            alert = {
                message: `ALERTA EPIDEMIOLÓGICA: ${outbreakCount} casos de ${disease.name} detectados. Reabastecer inmediatamente almacén con: ${disease.medication}`,
                status: true,
                activeCases: outbreakCount,
                diseaseName: disease.name,
                recommendation: `Comprar Lote de ${disease.medication}`
            };
        }

        // 6. Enviar JSON estructurado (RESTful) al Frontend (VISTA)
        return res.status(201).json({
            diagnosis,
            alert,
            message: 'Diagnóstico registrado exitosamente.'
        });
    } catch (err) {
        console.error('[Error CreateDiagnostic]:', err);
        return res.status(500).json({ message: 'Error procesando el flujo de diagnóstico.' });
    }
};

/**
 * Obtiene el catalogo completo de enfermedades.
 */
const getDiseases = async (_req, res) => {
    try {
        const diseases = await DiseaseRepo.findAll();
        return res.json(diseases);
    } catch (err) {
        console.error('Error en getDiseases:', err);
        return res.status(500).json({ message: 'No se pudo obtener el catalogo.' });
    }
};

module.exports = { createDiagnostic, getDiseases };
