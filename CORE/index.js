/**
 * CORE - El corazón inteligente de la aplicación VetCore
 *
 * Responsabilidad: Contiene toda la lógica de negocio
 * - Análisis epidemiológico
 * - Comparaciones de enfermedades
 * - Validaciones de negocio
 *
 * Patrones aplicados:
 * - Singleton: ServiceContainer garantiza una única instancia de servicios
 * - Factory Method: AlertFactory crea alertas epidemiológicas
 * - SOLID: ver SOLID_PRINCIPLES.md
 *
 * Los servicios aquí son agnósticos a la presentación (HTTP, CLI, etc)
 * y pueden ser reutilizados en múltiples contextos.
 */

const ServiceContainer = require('./patterns/service-container.singleton');
const { AlertFactory } = require('./patterns/alert.factory');

const container = ServiceContainer.getInstance();

module.exports = {
    // Patrones de diseño
    patterns: {
        ServiceContainer,
        AlertFactory
    },

    // Repositories: exponen acceso directo a datos cuando otro modulo necesita consultas puras.
    repositories: container.repositories,

    // Servicios: concentran validaciones, calculos y reglas de negocio reutilizables.
    services: {
        OutbreakAnalyzer: container.services.outbreakAnalyzer,
        DiseaseService: container.services.diseaseService,
        EpidemicComparator: container.services.epidemicComparator,
        InventoryService: container.services.inventoryService
    },

    // Alias directos para facilitar imports simples desde otros modulos.
    outbreakAnalyzer: container.services.outbreakAnalyzer,
    diseaseService: container.services.diseaseService,
    epidemicComparator: container.services.epidemicComparator,
    inventoryService: container.services.inventoryService,

    // Clases base por si algun modulo necesita instanciar variantes personalizadas.
    OutbreakAnalyzer: require('./epidemiology/outbreak.analyzer'),
    DiseaseService: require('./epidemiology/disease.service'),
    EpidemicComparator: require('./epidemiology/epidemic.comparator'),
    InventoryService: require('./inventory/inventory.service')
};
