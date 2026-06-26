/**
 * PATRÓN SINGLETON: Service Container
 *
 * Garantiza una única instancia de todos los servicios CORE en toda la aplicación.
 * Evita crear múltiples copias de OutbreakAnalyzer, DiseaseService, etc., y centraliza
 * el cableado de dependencias (Inversión de Dependencias / DIP).
 *
 * Uso:
 *   const container = ServiceContainer.getInstance();
 *   container.services.outbreakAnalyzer.analyzeDisease(id);
 */

const DiagnosisRepository = require('../repositories/diagnosis.repository');
const DiseaseRepository = require('../repositories/disease.repository');
const InventoryRepository = require('../repositories/inventory.repository');
const OutbreakAnalyzer = require('../epidemiology/outbreak.analyzer');
const DiseaseService = require('../epidemiology/disease.service');
const EpidemicComparator = require('../epidemiology/epidemic.comparator');
const InventoryService = require('../inventory/inventory.service');

class ServiceContainer {
    static #instance = null;

    constructor() {
        if (ServiceContainer.#instance) {
            return ServiceContainer.#instance;
        }

        this.repositories = {
            DiagnosisRepository,
            DiseaseRepository,
            InventoryRepository
        };

        this.services = {
            inventoryService: new InventoryService(InventoryRepository),
            diseaseService: new DiseaseService(DiseaseRepository),
            outbreakAnalyzer: null,
            epidemicComparator: null
        };

        this.services.outbreakAnalyzer = new OutbreakAnalyzer(
            DiagnosisRepository,
            DiseaseRepository,
            this.services.inventoryService
        );

        this.services.epidemicComparator = new EpidemicComparator(
            this.services.outbreakAnalyzer
        );

        ServiceContainer.#instance = this;
    }

    /**
     * Punto de acceso global a la única instancia del contenedor.
     * @returns {ServiceContainer}
     */
    static getInstance() {
        if (!ServiceContainer.#instance) {
            ServiceContainer.#instance = new ServiceContainer();
        }
        return ServiceContainer.#instance;
    }

    /**
     * Reinicia la instancia (útil en tests).
     * @private
     */
    static resetInstance() {
        ServiceContainer.#instance = null;
    }
}

module.exports = ServiceContainer;
