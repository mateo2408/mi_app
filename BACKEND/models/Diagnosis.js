/**
 * @StudyGuide [MODELO] Relación de Datos (Foreign Keys en NoSQL)
 * Representa el registro temporal cuando un animal es diagnosticado con una afección.
 * Muestra cómo referenciar otro modelo (`Disease`) utilizando ObjectId (Relación 1 a N).
 */
const mongoose = require('mongoose');

const scheme = new mongoose.Schema({
    // Paciente afectado
    petName: { type: String, required: true },
    
    // Referencia dura (Puntero relacional) al maestro (Catálogo Enfermedad)
    diseaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Disease', required: true },
    
    // Fecha automática de ingrego al historial, clave para "Filtrado Epidemiológico a 60 días"
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Diagnosis', scheme);