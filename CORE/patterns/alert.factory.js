/**
 * PATRÓN FACTORY METHOD: Alert Factory
 *
 * Encapsula la creación de alertas epidemiológicas delegando a creadores especializados.
 * Cada creador (OutbreakAlertCreator, StockAlertCreator) implementa createAlert(),
 * permitiendo extender nuevos tipos de alerta sin modificar el código cliente (OCP).
 *
 * Uso:
 *   AlertFactory.create('OUTBREAK', { disease, caseCount, threshold, medicationAvailabilities });
 *   AlertFactory.create('STOCK', { medication, available, minStock, unit, status });
 */

/**
 * Clase base abstracta para creadores de alertas (Factory Method).
 */
class AlertCreator {
    createAlert(_context) {
        throw new Error('createAlert() debe ser implementado por la subclase');
    }

    _calculateSeverity(caseCount, threshold) {
        const excessRatio = caseCount / threshold;
        if (excessRatio >= 2) return 'CRITICAL';
        if (excessRatio >= 1.5) return 'HIGH';
        return 'MEDIUM';
    }

    _formatStockStatus(status) {
        if (status === 'out') return 'agotado';
        if (status === 'low') return 'bajo';
        if (status === 'missing') return 'sin registro';
        return 'suficiente';
    }
}

/**
 * Crea alertas de brote epidemiológico (6+ casos en ventana de 60 días).
 */
class OutbreakAlertCreator extends AlertCreator {
    createAlert(context) {
        const { disease, caseCount, threshold, medicationAvailabilities = [] } = context;

        const inventoryInfo = medicationAvailabilities.map((item) => ({
            medication: item.medication,
            available: item.available,
            minStock: item.minStock,
            unit: item.unit,
            status: item.status,
            needsRestock: item.needsRestock
        }));

        const inventoryNote = inventoryInfo.length > 0
            ? inventoryInfo
                .map((item) => `${item.medication}: ${item.available} ${item.unit} (${this._formatStockStatus(item.status)})`)
                .join(' | ')
            : 'Stock no registrado en inventario';

        const medicationList = inventoryInfo.map((item) => item.medication);
        const recommendation = medicationList.length > 0
            ? `Opciones de tratamiento: ${medicationList.join(', ')}. Casos: ${caseCount}/${threshold}. ${inventoryNote}`
            : `No hay medicamentos asociados. Casos: ${caseCount}/${threshold}. ${inventoryNote}`;

        return {
            type: 'OUTBREAK_ALERT',
            severity: this._calculateSeverity(caseCount, threshold),
            message: `ALERTA EPIDEMIOLÓGICA: ${caseCount} casos de ${disease.name} detectados en los últimos 60 días`,
            status: true,
            activeCases: caseCount,
            diseaseName: disease.name,
            medication: disease.medication,
            medications: inventoryInfo,
            threshold,
            recommendation,
            inventory: inventoryInfo[0] || null,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Crea alertas de stock bajo o agotado para un medicamento específico.
 */
class StockAlertCreator extends AlertCreator {
    createAlert(context) {
        const { medication, available, minStock, unit, status, diseaseName } = context;

        const severityMap = { out: 'CRITICAL', missing: 'CRITICAL', low: 'HIGH', ok: 'LOW' };
        const messageMap = {
            out: `STOCK AGOTADO: ${medication}`,
            missing: `SIN REGISTRO EN INVENTARIO: ${medication}`,
            low: `STOCK BAJO: ${medication} (${available}/${minStock} ${unit})`,
            ok: `Stock suficiente: ${medication}`
        };

        return {
            type: 'STOCK_ALERT',
            severity: severityMap[status] || 'MEDIUM',
            message: messageMap[status] || `Alerta de inventario: ${medication}`,
            status: status !== 'ok',
            medication,
            available,
            minStock,
            unit,
            stockStatus: status,
            diseaseName: diseaseName || null,
            recommendation: status !== 'ok'
                ? `Reabastecer ${medication}. Disponible: ${available} ${unit}, mínimo: ${minStock} ${unit}.`
                : null,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * Factory Method: selecciona el creador adecuado según el tipo de alerta.
 */
class AlertFactory {
    static #creators = {
        OUTBREAK: new OutbreakAlertCreator(),
        STOCK: new StockAlertCreator()
    };

    /**
     * Crea una alerta del tipo indicado usando el creador correspondiente.
     * @param {'OUTBREAK'|'STOCK'} type - Tipo de alerta
     * @param {Object} context - Datos necesarios para construir la alerta
     * @returns {Object} Alerta estructurada
     */
    static create(type, context) {
        const creator = AlertFactory.#creators[type];
        if (!creator) {
            throw new Error(`Tipo de alerta no soportado: ${type}. Tipos válidos: OUTBREAK, STOCK`);
        }
        return creator.createAlert(context);
    }

    /**
     * Registra un nuevo creador de alertas (extensibilidad / OCP).
     * @param {string} type
     * @param {AlertCreator} creator
     */
    static registerCreator(type, creator) {
        AlertFactory.#creators[type] = creator;
    }
}

module.exports = {
    AlertFactory,
    AlertCreator,
    OutbreakAlertCreator,
    StockAlertCreator
};
