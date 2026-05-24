/**
 * CORE - El corazón inteligente de la aplicación VetCore
 * 
 * Responsabilidad: Contiene toda la lógica de negocio
 * - Análisis epidemiológico
 * - Comparaciones de enfermedades
 * - Validaciones de negocio
 * 
 * Los servicios aquí son agnósticos a la presentación (HTTP, CLI, etc)
 * y pueden ser reutilizados en múltiples contextos.
 */

// Repositories
const DiagnosisRepository = require('./repositories/diagnosis.repository');
const DiseaseRepository = require('./repositories/disease.repository');

// Services
const OutbreakAnalyzer = require('./epidemiology/outbreak.analyzer');
const DiseaseService = require('./epidemiology/disease.service');
const EpidemicComparator = require('./epidemiology/epidemic.comparator');

// Inyección de dependencias: Instancia los servicios con sus dependencias
const outbreakAnalyzer = new OutbreakAnalyzer(DiagnosisRepository, DiseaseRepository);
const diseaseService = new DiseaseService(DiseaseRepository);
const epidemicComparator = new EpidemicComparator(outbreakAnalyzer);

module.exports = {
    // Repositories (acceso a datos)
    repositories: {
        DiagnosisRepository,
        DiseaseRepository
    },

    // Servicios (lógica de negocio)
    services: {
        OutbreakAnalyzer: outbreakAnalyzer,
        DiseaseService: diseaseService,
        EpidemicComparator: epidemicComparator
    },

    // Alias para acceso directo
    outbreakAnalyzer,
    diseaseService,
    epidemicComparator,

    // Clases para instancias personalizadas si es necesario
    OutbreakAnalyzer,
    DiseaseService,
    EpidemicComparator
};
