/**
 * Verificación de lógica CORE post-refactor (Singleton + Factory Method).
 * Ejecutar: node CORE/verify-core.js
 */
const assert = require('assert');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        passed++;
        console.log(`  ✓ ${name}`);
    } catch (err) {
        failed++;
        console.error(`  ✗ ${name}`);
        console.error(`    ${err.message}`);
    }
}

console.log('\n=== Verificación CORE ===\n');

// --- AlertFactory ---
console.log('AlertFactory:');
const { AlertFactory } = require('./patterns/alert.factory');

test('crea alerta OUTBREAK con estructura esperada', () => {
    const alert = AlertFactory.create('OUTBREAK', {
        disease: { name: 'Parvovirus', medication: 'Amoxicilina' },
        caseCount: 8,
        threshold: 6,
        medicationAvailabilities: [
            { medication: 'Amoxicilina', available: 3, minStock: 10, unit: 'unidades', status: 'low', needsRestock: true }
        ]
    });

    assert.strictEqual(alert.type, 'OUTBREAK_ALERT');
    assert.strictEqual(alert.severity, 'MEDIUM'); // 8/6 = 1.33x, below 1.5 HIGH threshold
    assert.strictEqual(alert.activeCases, 8);
    assert.strictEqual(alert.diseaseName, 'Parvovirus');
    assert.strictEqual(alert.threshold, 6);
    assert.strictEqual(alert.status, true);
    assert.ok(alert.message.includes('8 casos'));
    assert.ok(alert.recommendation.includes('Amoxicilina'));
    assert.strictEqual(alert.medications.length, 1);
    assert.strictEqual(alert.inventory.medication, 'Amoxicilina');
    assert.ok(alert.timestamp);
});

test('severidad CRITICAL cuando casos >= 2x umbral', () => {
    const alert = AlertFactory.create('OUTBREAK', {
        disease: { name: 'Moquillo', medication: 'Vacuna' },
        caseCount: 12,
        threshold: 6,
        medicationAvailabilities: []
    });
    assert.strictEqual(alert.severity, 'CRITICAL');
});

test('crea alerta STOCK con estructura esperada', () => {
    const alert = AlertFactory.create('STOCK', {
        medication: 'Ibuprofeno',
        available: 2,
        minStock: 10,
        unit: 'unidades',
        status: 'low',
        diseaseName: 'Gripe canina'
    });
    assert.strictEqual(alert.type, 'STOCK_ALERT');
    assert.strictEqual(alert.severity, 'HIGH');
    assert.strictEqual(alert.status, true);
});

test('rechaza tipo de alerta desconocido', () => {
    assert.throws(
        () => AlertFactory.create('INVALID', {}),
        /Tipo de alerta no soportado/
    );
});

// --- ServiceContainer Singleton ---
console.log('\nServiceContainer:');
const ServiceContainer = require('./patterns/service-container.singleton');

test('getInstance retorna siempre la misma instancia', () => {
    const a = ServiceContainer.getInstance();
    const b = ServiceContainer.getInstance();
    assert.strictEqual(a, b);
});

test('constructor retorna instancia existente (patrón Singleton)', () => {
    const existing = ServiceContainer.getInstance();
    const viaConstructor = new ServiceContainer();
    assert.strictEqual(viaConstructor, existing);
});

test('servicios están cableados correctamente', () => {
    const container = ServiceContainer.getInstance();
    assert.ok(container.services.outbreakAnalyzer);
    assert.ok(container.services.diseaseService);
    assert.ok(container.services.epidemicComparator);
    assert.ok(container.services.inventoryService);
    assert.ok(container.repositories.DiagnosisRepository);
    assert.ok(container.repositories.DiseaseRepository);
    assert.ok(container.repositories.InventoryRepository);
});

// --- CORE index exports ---
console.log('\nCORE index exports:');
const core = require('./index');

test('exporta alias y servicios esperados por controllers', () => {
    assert.ok(core.repositories);
    assert.ok(core.outbreakAnalyzer);
    assert.ok(core.diseaseService);
    assert.ok(core.epidemicComparator);
    assert.ok(core.inventoryService);
    assert.ok(core.services.OutbreakAnalyzer);
    assert.ok(core.patterns.ServiceContainer);
    assert.ok(core.patterns.AlertFactory);
});

test('servicios exportados son la misma instancia del Singleton', () => {
    const container = ServiceContainer.getInstance();
    assert.strictEqual(core.outbreakAnalyzer, container.services.outbreakAnalyzer);
    assert.strictEqual(core.diseaseService, container.services.diseaseService);
});

// --- OutbreakAnalyzer con mocks ---
console.log('\nOutbreakAnalyzer (mocks):');
const OutbreakAnalyzer = require('./epidemiology/outbreak.analyzer');

const mockDisease = {
    _id: 'disease-1',
    name: 'Parvovirus',
    medication: 'Amoxicilina',
    medications: ['Amoxicilina'],
    outbreakThreshold: 6
};

const mockDiagnosisRepo = {
    findRecentByDisease: async (diseaseId, days) => {
        assert.strictEqual(diseaseId, 'disease-1');
        assert.strictEqual(days, 60);
        return Array.from({ length: 7 }, (_, i) => ({ petName: `Pet${i}`, date: new Date() }));
    }
};

const mockDiseaseRepo = {
    findById: async (id) => (id === 'disease-1' ? mockDisease : null),
    findAll: async () => [mockDisease]
};

const mockInventoryService = {
    getMedicationAvailability: async (med) => ({
        medication: med,
        available: 5,
        minStock: 10,
        unit: 'unidades',
        status: 'low',
        needsRestock: true
    })
};

test('detecta brote cuando casos >= umbral', async () => {
    const analyzer = new OutbreakAnalyzer(mockDiagnosisRepo, mockDiseaseRepo, mockInventoryService);
    const result = await analyzer.analyzeDisease('disease-1');

    assert.strictEqual(result.isOutbreak, true);
    assert.strictEqual(result.caseCount, 7);
    assert.strictEqual(result.threshold, 6);
    assert.ok(result.alert);
    assert.strictEqual(result.alert.type, 'OUTBREAK_ALERT');
    assert.strictEqual(result.diseaseInfo.name, 'Parvovirus');
});

test('no genera alerta cuando casos < umbral', async () => {
    const lowCaseRepo = {
        findRecentByDisease: async () => [{ petName: 'Pet1' }, { petName: 'Pet2' }]
    };
    const analyzer = new OutbreakAnalyzer(lowCaseRepo, mockDiseaseRepo, mockInventoryService);
    const result = await analyzer.analyzeDisease('disease-1');

    assert.strictEqual(result.isOutbreak, false);
    assert.strictEqual(result.alert, null);
});

test('retorna error cuando enfermedad no existe', async () => {
    const analyzer = new OutbreakAnalyzer(mockDiagnosisRepo, mockDiseaseRepo, mockInventoryService);
    const result = await analyzer.analyzeDisease('unknown-id');

    assert.strictEqual(result.isOutbreak, false);
    assert.strictEqual(result.error, 'Enfermedad no encontrada');
    assert.strictEqual(result.diseaseInfo, null);
});

test('analyzeAllDiseases agrupa brotes activos', async () => {
    const analyzer = new OutbreakAnalyzer(mockDiagnosisRepo, mockDiseaseRepo, mockInventoryService);
    const result = await analyzer.analyzeAllDiseases();

    assert.strictEqual(result.totalDiseases, 1);
    assert.strictEqual(result.hasActiveOutbreaks, true);
    assert.strictEqual(result.activeOutbreaks.length, 1);
});

// --- DiseaseService ---
console.log('\nDiseaseService:');
const DiseaseService = require('./epidemiology/disease.service');
const diseaseService = new DiseaseService({ findAll: async () => [], findById: async () => null });

test('validateDiseaseData acepta datos válidos', () => {
    const result = diseaseService.validateDiseaseData({
        name: 'Rabia',
        medications: ['Vacuna antirrábica'],
        outbreakThreshold: 4
    });
    assert.strictEqual(result.valid, true);
    assert.strictEqual(result.data.name, 'Rabia');
    assert.strictEqual(result.data.outbreakThreshold, 4);
});

test('validateDiseaseData rechaza nombre vacío', () => {
    const result = diseaseService.validateDiseaseData({ medications: ['Med'] });
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('nombre')));
});

// --- Resumen ---
console.log(`\n=== Resultado: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
