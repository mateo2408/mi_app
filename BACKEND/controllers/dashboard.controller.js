/**
 * @StudyGuide [CONTROLADOR] Aggregator del Dashboard Central
 * Actúa como una "Fachada" recolectando la data de múltiples modelos rápidamente.
 * Proyecta la lógica de las "Alertas de Brotes de +6 Casos" para el renderizado inicial en Angular.
 */
const Appointment = require('../models/Appointment');
const ClinicalRecord = require('../models/ClinicalRecord');
const Owner = require('../models/Owner');
const Pet = require('../models/Pet');
const DiseaseRepo = require('../../CORE/disease.repository');
const DiagnosisRepo = require('../../CORE/diagnosis.repository');

/**
 * @StudyGuide [ENDPOINT DE CONSULTA PÚBLICA (GET)]
 * Obtiene el resumen para la pantalla principal ejecutando las reglas 
 * de Inteligencia de Negocio de Epidemiología.
 */
const getSummary = async (_req, res) => { 
  try {
    const [owners, pets, appointments, records, recentAppointments, recentPets, allDiseases] = await Promise.all([ 
      Owner.countDocuments(), 
      Pet.countDocuments(), 
      Appointment.countDocuments(), 
      ClinicalRecord.countDocuments(), 
      Appointment.find().populate('petId', 'name').sort({ dateTime: -1 }).limit(5).lean(), 
      Pet.find().populate('ownerId', 'fullName').sort({ createdAt: -1 }).limit(5).lean(),
      DiseaseRepo.findAll()
    ]); 

    // Evaluar alertas activas: Recorrer todas las enfermedades y verificar umbral
    const activeAlerts = [];
    for(const disease of allDiseases) {
      const recentDiagnoses = await DiagnosisRepo.findRecentByDisease(disease._id, 60);
      if(recentDiagnoses.length > disease.outbreakThreshold) {
        activeAlerts.push({
           diseaseName: disease.name,
           activeCases: recentDiagnoses.length,
           threshold: disease.outbreakThreshold,
           recommendation: `Abastecer con urgencia: ${disease.medication}`
        });
      }
    }

    return res.json({ 
      counts: { owners, pets, appointments, records }, 
      recentAppointments, 
      recentPets,
      activeAlerts
    }); 
  } catch(error) {
     console.error('Error in getSummary', error);
     return res.status(500).json({message: 'Failed to load dashboard summary'});
  }
};

module.exports = { getSummary };
