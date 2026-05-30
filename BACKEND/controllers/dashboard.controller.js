/**
 * CONTROLADOR: Dashboard
 * 
 * Responsabilidad: Orquestar datos para la pantalla principal.
 * Delega análisis epidemiológico al CORE.
 * 
 * Este controlador es un agregador de datos (CRUD + orquestación básica).
 */

const Appointment = require('../models/Appointment');
const ClinicalRecord = require('../models/ClinicalRecord');
const Owner = require('../models/Owner');
const Pet = require('../models/Pet');
const { epidemicComparator, inventoryService } = require('../../CORE');

/**
 * Obtiene el resumen del dashboard central con datos agregados y alertas.
 */
const getSummary = async (_req, res) => {
    try {
        // 1. Obtener conteos básicos en paralelo
        const [owners, pets, appointments, records, recentAppointments, recentPets, inventorySummary, epidemicReport] = await Promise.all([
            Owner.countDocuments(),
            Pet.countDocuments(),
            Appointment.countDocuments(),
            ClinicalRecord.countDocuments(),
            Appointment.find()
                .populate('petId', 'name')
                .sort({ dateTime: -1 })
                .limit(5)
                .lean(),
            Pet.find()
                .populate('ownerId', 'fullName')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            inventoryService.getSummary(),
            epidemicComparator.generateEpidemicReport()
        ]);

        return res.json({
            counts: {
                owners,
                pets,
                appointments,
                records
            },
            recentAppointments,
            recentPets,
            activeOutbreaks: epidemicReport.classification.outbreaks,
            diseasesAtRisk: epidemicReport.classification.atRisk,
            epidemicSummary: epidemicReport.summary,
            recommendations: epidemicReport.recommendations,
            activeAlerts: epidemicReport.outbreakAlerts,
            outbreakMedicationStatus: epidemicReport.outbreakMedicationStatus,
            inventorySummary
        });
    } catch (error) {
        console.error('[Dashboard Controller] Error en getSummary:', error);
        return res.status(500).json({ message: 'Error cargando resumen del dashboard' });
    }
};

module.exports = { getSummary };
