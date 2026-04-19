/**
 * @StudyGuide [SCRIPT DE POBLADO DE DATOS (SEEDING)]
 * Script automatizado para insertar 40 registros realistas
 * Demuestra el CRUD y dispara dinámicamente las alertas en vivo durante el video.
 */
const mongoose = require('mongoose');
const Disease = require('./models/Disease');
const Diagnosis = require('./models/Diagnosis');

async function seedDiagnostics() {
    try {
        // En un entorno didáctico, queremos que cada "reset" regenere exactamente el caso que vamos a probar
        await Disease.deleteMany({});
        await Diagnosis.deleteMany({});

        // 1. Catálogo Enfermedad / Medicamento (Garantizado con Threshold en 6)
        const d1 = await Disease.create({ name: 'Parvovirus Canino', medication: 'Suero Fisiológico y Antibioticoterapia', outbreakThreshold: 6 });
        const d2 = await Disease.create({ name: 'Leucemia Felina', medication: 'Inmunomoduladores (Fel-O-Vax)', outbreakThreshold: 6 });
        const d3 = await Disease.create({ name: 'Gastroenteritis Infecciosa', medication: 'Probióticos y Protectores Gástricos', outbreakThreshold: 6 });
        const d4 = await Disease.create({ name: 'Dermatitis Alérgica', medication: 'Corticoides y Champú Clorhexidina', outbreakThreshold: 6 });

        // 2. Generación iterativa de 40 Registros Históricos Realistas
        const diagnoses = [];
        const now = new Date();
        const nombresPerrunos = ["Max", "Bella", "Luna", "Rocky", "Coco", "Kira", "Toby", "Milo", "Daisy", "Simba"];
        const nombresGatunos = ["Mishi", "Pelusa", "Salem", "Garfield", "Mia", "Tom", "Oliver", "Nala", "Zeus", "Felix"];
        
        for (let i = 0; i < 40; i++) {
            // Lógica para forzar que el Parvovirus tenga exactamente 6 registros (para disparar la alerta al llegar el 7mo)
            // Y la Gastroenteritis tenga 8 (mostrando una alerta ya activa en el dashboard)
            let diseaseId;
            let petName;
            
            if (i < 6) { 
                diseaseId = d1._id; // Almacenamos 6 casos de Parvo (borde de activación)
                petName = nombresPerrunos[i % nombresPerrunos.length]; 
            }
            else if (i < 14) { 
                diseaseId = d3._id; // 8 Casos de Gastro (ya está en Brote Epidémico visible en dashboard)
                petName = nombresPerrunos[i % nombresPerrunos.length] + ' JR'; 
            }
            else if (i < 25) { 
                diseaseId = d2._id; // 11 Casos de Leucemia
                petName = nombresGatunos[i % nombresGatunos.length]; 
            }
            else { 
                diseaseId = d4._id; // Dermatitis (resto)
                petName = nombresPerrunos[i % nombresPerrunos.length] + ' II'; 
            }

            diagnoses.push({
                petName: `${petName} (${i + 1})`,
                diseaseId: diseaseId,
                // Rango de fechas: Aleatorio dentro de los últimos 20 días (cae dentro de los 60 días del algoritmo)
                date: new Date(now.getTime() - Math.random() * 20 * 24 * 60 * 60 * 1000)
            });
        }

        // Persiste los 40 datos simultáneamente
        await Diagnosis.insertMany(diagnoses);
        console.log('✅ Base de Datos MOCK cargada exitosamente: Creados 4 enfermedades y 40 registros de diagnóstico para demostración de alertas en vivo.');
    } catch (err) {
        console.error('❌ Error inyectando Mocks de Diagnóstico:', err.message);
    }
}
module.exports = { seedDiagnostics };