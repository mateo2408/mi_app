const fs = require('fs');

// 1. Mongoose Models
fs.writeFileSync('BACKEND/models/Disease.js', `const mongoose = require('mongoose');
const scheme = new mongoose.Schema({
    name: { type: String, required: true },
    medication: { type: String, required: true },
    outbreakThreshold: { type: Number, required: true }
});
module.exports = mongoose.model('Disease', scheme);`);

fs.writeFileSync('BACKEND/models/Diagnosis.js', `const mongoose = require('mongoose');
const scheme = new mongoose.Schema({
    petName: { type: String, required: true },
    diseaseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Disease', required: true },
    date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Diagnosis', scheme);`);

// 2. Repositories in CORE
fs.writeFileSync('CORE/disease.repository.js', `const Disease = require('../BACKEND/models/Disease');
class DiseaseRepository {
    async findById(id) { return await Disease.findById(id).lean(); }
    async findAll() { return await Disease.find().lean(); }
}
module.exports = new DiseaseRepository();`);

fs.writeFileSync('CORE/diagnosis.repository.js', `const Diagnosis = require('../BACKEND/models/Diagnosis');
class DiagnosisRepository {
    async create(data) { return await Diagnosis.create(data); }
    
    // Optimización del Histórico: Filtra por fecha (últimos X días)
    async findRecentByDisease(diseaseId, days = 60) {
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);
        return await Diagnosis.find({
            diseaseId: diseaseId,
            date: { $gte: sinceDate }
        }).lean();
    }
}
module.exports = new DiagnosisRepository();`);

// 3. Update DB Connection
fs.writeFileSync('BACKEND/config/db.js', `// Conexión central a MongoDB usando Mongoose.
const mongoose = require('mongoose');
const { seedDatabase } = require('../seed');
const { seedDiagnostics } = require('../seed_diagnostics');

const connectDatabase = async () => {
  try {
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/mi_veterinaria';
    await mongoose.connect(connectionString);
    console.log('MongoDB conectado en el contenedor Docker');
    
    await seedDatabase();
    // Inyecta el catálogo y diagnósticos de prueba para los outbreaks
    await seedDiagnostics();
  } catch (err) {
    console.error('Error de conexión:', err.message);
    process.exit(1);
  }
};
module.exports = { connectDatabase };`);

// 4. Seed Script
fs.writeFileSync('BACKEND/seed_diagnostics.js', `const mongoose = require('mongoose');
const Disease = require('./models/Disease');
const Diagnosis = require('./models/Diagnosis');

async function seedDiagnostics() {
    try {
        const catalogCount = await Disease.countDocuments();
        if (catalogCount > 0) return; // Ya existe

        // Limpieza y creación del catálogo de enfermedades
        await Disease.deleteMany({});
        await Diagnosis.deleteMany({});

        const d1 = await Disease.create({ name: 'Parvovirus', medication: 'Suero y Antibióticos IV', outbreakThreshold: 5 });
        const d2 = await Disease.create({ name: 'Rabia', medication: 'Vacuna Antirrábica Dosis Única', outbreakThreshold: 2 });
        const d3 = await Disease.create({ name: 'Moquillo', medication: 'Multivitamínico e Inmunomodulador', outbreakThreshold: 4 });

        // Creación de 20 registros con fechas recientes
        const diagnoses = [];
        const now = new Date();
        for(let i = 0; i < 20; i++) {
            // Repartir aleatoriamente
            const rnd = Math.random();
            let diseaseId = d1._id;
            if (rnd > 0.6) diseaseId = d2._id;
            else if (rnd > 0.3) diseaseId = d3._id;

            diagnoses.push({
                petName: 'Mascota Mock ' + i,
                diseaseId: diseaseId,
                // Fechas entre hoy y 30 dias atras
                date: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            });
        }
        await Diagnosis.insertMany(diagnoses);
        console.log('Mocks de diagnóstico cargados exitosamente. (20 registros)');
    } catch (err) {
        console.error('Error cargando Mocks:', err.message);
    }
}
module.exports = { seedDiagnostics };`);

// 5. Controller
fs.writeFileSync('BACKEND/controllers/diagnostics.controller.js', `const DiagnosisRepo = require('../../CORE/diagnosis.repository');
const DiseaseRepo = require('../../CORE/disease.repository');

const createDiagnostic = async (req, res) => {
    try {
        const { petName, diseaseId } = req.body;
        
        // 1. Guardar diagnóstico (Patrón Repositorio)
        const diagnosis = await DiagnosisRepo.create({ petName, diseaseId });

        // 2. Obtener los detalles de la enfermedad
        const disease = await DiseaseRepo.findById(diseaseId);
        if(!disease) return res.status(404).json({ message: 'Enfermedad no encontrada.' });

        // 3. Obtener el historial optimizado de los últimos 60 días
        const recentRecords = await DiagnosisRepo.findRecentByDisease(diseaseId, 60);

        // 4. Calcular los brotes (Recorriendo con for-each)
        let outbreakCount = 0;
        recentRecords.forEach(() => {
            outbreakCount++;
        });

        // 5. Verificar umbral y armar la respuesta
        let alert = null;
        if(outbreakCount > disease.outbreakThreshold) {
            alert = {
                message: \`Abastecer \${disease.medication}\`,
                status: true
            };
        }

        return res.status(201).json({
            diagnosis,
            alert
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const getDiseases = async (_req, res) => {
    try {
        const diseases = await DiseaseRepo.findAll();
        return res.json(diseases);
    } catch (err) {
        return res.status(500).json({ message: 'Error interno al obtener catálogo.' });
    }
};

module.exports = { createDiagnostic, getDiseases };`);

// 6. Routes
fs.writeFileSync('BACKEND/routes/diagnostics.js', `const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { createDiagnostic, getDiseases } = require('../controllers/diagnostics.controller');
const router = express.Router();

router.post('/', requireAuth, createDiagnostic);
router.get('/catalog', requireAuth, getDiseases);

module.exports = router;`);

console.log('Archivos de Node generados con éxito.');
