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
const InventoryRepository = require('./repositories/inventory.repository');

// Services
const OutbreakAnalyzer = require('./epidemiology/outbreak.analyzer');
const DiseaseService = require('./epidemiology/disease.service');
const EpidemicComparator = require('./epidemiology/epidemic.comparator');
const InventoryService = require('./inventory/inventory.service');

// Inyección de dependencias: cada servicio recibe sus repositorios para mantener la lógica desacoplada.
const inventoryService = new InventoryService(InventoryRepository);
const outbreakAnalyzer = new OutbreakAnalyzer(DiagnosisRepository, DiseaseRepository, inventoryService);
const diseaseService = new DiseaseService(DiseaseRepository);
const epidemicComparator = new EpidemicComparator(outbreakAnalyzer);

module.exports = {
    // Repositories: exponen acceso directo a datos cuando otro modulo necesita consultas puras.
    repositories: {
        DiagnosisRepository,
        DiseaseRepository,
        InventoryRepository
    },

    // Servicios: concentran validaciones, calculos y reglas de negocio reutilizables.
    services: {
        OutbreakAnalyzer: outbreakAnalyzer,
        DiseaseService: diseaseService,
        EpidemicComparator: epidemicComparator,
        InventoryService: inventoryService
    },

    // Alias directos para facilitar imports simples desde otros modulos.
    outbreakAnalyzer,
    diseaseService,
    epidemicComparator,
    inventoryService,

    // Clases base por si algun modulo necesita instanciar variantes personalizadas.
    OutbreakAnalyzer,
    DiseaseService,
    EpidemicComparator,
    InventoryService
};
