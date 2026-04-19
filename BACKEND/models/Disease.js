/**
 * @StudyGuide [MODELO] Mongoose Schema
 * Creado aplicando los principios de Clean Code para ser la fuente de verdad.
 * Este modelo 'CatalogoEnfermedad' enlaza cada padecimiento con su medicamento.
 */
const mongoose = require('mongoose');

const scheme = new mongoose.Schema({
    // Nombre exacto del diagnóstico o enfermedad (ej. "Parvovirus")
    name: { type: String, required: true },
    
    // Tratamiento sugerido que el "Core Inteligente" usará para el reabastecimiento
    medication: { type: String, required: true },
    
    // Limite de casos soportados (Establecido a 6 por defecto en el requerimiento didáctico)
    outbreakThreshold: { type: Number, required: true, default: 6 }
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    collection: 'diseases'
});

module.exports = mongoose.model('Disease', scheme);