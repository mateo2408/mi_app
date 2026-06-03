/**
 * CORE SERVICE: Inventory Service
 *
 * Responsabilidad:
 * - Validación y normalización de inventario
 * - Cálculo de estados de stock
 * - Conteo de disponibilidad por medicamento
 */
class InventoryService {
    constructor(inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    _normalizeMedicationName(value) {
        // Normaliza el nombre para comparar inventarios sin depender de mayusculas, espacios o formato.
        return String(value || '').trim().toLowerCase();
    }

    _parseNumber(value, field, errors) {
        // Convierte valores de entrada a numero y acumula errores si el dato no es valido.
        if (value === undefined || value === null || value === '') {
            return undefined;
        }
        const parsed = typeof value === 'number' ? value : Number(value);
        if (!Number.isFinite(parsed) || parsed < 0) {
            errors.push(`El campo ${field} debe ser un numero mayor o igual a 0`);
            return undefined;
        }
        return parsed;
    }

    _buildStockStatus(stock, minStock) {
        // Clasifica el estado del inventario segun el stock disponible y el minimo esperado.
        if (stock <= 0) return 'out';
        if (stock <= minStock) return 'low';
        return 'ok';
    }

    _enrichItem(item) {
        // Agrega campos derivados para que la UI reciba una vista lista para consumir.
        if (!item) return null;
        const stock = Number(item.stock) || 0;
        const minStock = Number(item.minStock) || 0;
        const status = this._buildStockStatus(stock, minStock);
        return {
            ...item,
            stock,
            minStock,
            unit: item.unit || 'unidades',
            stockStatus: status,
            needsRestock: status !== 'ok'
        };
    }

    validateInventoryData(payload, { requireMedication }) {
        const errors = [];
        const data = {};

        // Valida el nombre del medicamento solo cuando es obligatorio o viene en el payload.
        if (payload.medication !== undefined || requireMedication) {
            if (!payload.medication || typeof payload.medication !== 'string' || payload.medication.trim() === '') {
                errors.push('El nombre del medicamento es requerido');
            } else {
                const medication = payload.medication.trim();
                const medicationKey = this._normalizeMedicationName(medication);
                if (!medicationKey) {
                    errors.push('El nombre del medicamento no es valido');
                } else {
                    data.medication = medication;
                    data.medicationKey = medicationKey;
                }
            }
        }

        // Validaciones numericas de stock y stock minimo.
        const stock = this._parseNumber(payload.stock, 'stock', errors);
        if (stock !== undefined) {
            data.stock = stock;
        }

        const minStock = this._parseNumber(payload.minStock, 'minStock', errors);
        if (minStock !== undefined) {
            data.minStock = minStock;
        }

        // La unidad debe ser texto legible para mostrarla en el frontend.
        if (payload.unit !== undefined) {
            if (typeof payload.unit !== 'string' || payload.unit.trim() === '') {
                errors.push('La unidad es requerida');
            } else {
                data.unit = payload.unit.trim();
            }
        }

        if (errors.length > 0) {
            return { valid: false, errors };
        }

        return { valid: true, data };
    }

    async listInventory() {
        // Recupera todos los items y les agrega estado calculado antes de entregarlos.
        const items = await this.inventoryRepository.findAll();
        return items.map((item) => this._enrichItem(item));
    }

    async getSummary() {
        // Resume el inventario para paneles y tarjetas de estado.
        const items = await this.listInventory();
        const totalUnits = items.reduce((sum, item) => sum + (item.stock || 0), 0);
        const lowStockItems = items.filter((item) => item.stockStatus !== 'ok');
        const outOfStockItems = items.filter((item) => item.stockStatus === 'out');

        return {
            totalItems: items.length,
            totalUnits,
            lowStockCount: lowStockItems.length,
            outOfStockCount: outOfStockItems.length,
            lowStockItems
        };
    }

    async getMedicationAvailability(medicationName) {
        // Consulta el inventario usando la version normalizada del nombre.
        const normalized = this._normalizeMedicationName(medicationName);
        if (!normalized) {
            return {
                medication: medicationName || 'Sin medicamento',
                available: 0,
                minStock: 0,
                unit: 'unidades',
                status: 'missing',
                needsRestock: true
            };
        }

        const item = await this.inventoryRepository.findByMedicationKey(normalized);
        if (!item) {
            const displayName = typeof medicationName === 'string' ? medicationName.trim() : String(medicationName);
            return {
                medication: displayName,
                available: 0,
                minStock: 0,
                unit: 'unidades',
                status: 'missing',
                needsRestock: true
            };
        }

        const stock = Number(item.stock) || 0;
        const minStock = Number(item.minStock) || 0;
        const status = this._buildStockStatus(stock, minStock);

        return {
            medication: item.medication,
            available: stock,
            minStock,
            unit: item.unit || 'unidades',
            status,
            needsRestock: status !== 'ok'
        };
    }

    async createItem(payload) {
        // Primero valida la entrada y luego protege contra duplicados por clave normalizada.
        const validation = this.validateInventoryData(payload, { requireMedication: true });
        if (!validation.valid) {
            return { ok: false, status: 400, errors: validation.errors, message: validation.errors.join(', ') };
        }

        const data = {
            ...validation.data,
            stock: validation.data.stock ?? 0,
            minStock: validation.data.minStock ?? 0,
            unit: validation.data.unit ?? 'unidades'
        };

        const existing = await this.inventoryRepository.findByMedicationKey(data.medicationKey);
        if (existing) {
            return { ok: false, status: 409, message: 'El medicamento ya existe en inventario' };
        }

        const created = await this.inventoryRepository.create(data);
        const createdItem = this._enrichItem(created.toObject ? created.toObject() : created);
        return { ok: true, item: createdItem };
    }

    async updateItem(id, payload) {
        // La actualizacion permite cambios parciales, pero mantiene la unicidad del medicamento.
        const validation = this.validateInventoryData(payload, { requireMedication: false });
        if (!validation.valid) {
            return { ok: false, status: 400, errors: validation.errors, message: validation.errors.join(', ') };
        }

        if (Object.keys(validation.data).length === 0) {
            return { ok: false, status: 400, message: 'No hay cambios para actualizar' };
        }

        if (validation.data.medicationKey) {
            const existing = await this.inventoryRepository.findByMedicationKey(validation.data.medicationKey);
            if (existing && String(existing._id) !== String(id)) {
                return { ok: false, status: 409, message: 'El medicamento ya existe en inventario' };
            }
        }

        const updated = await this.inventoryRepository.update(id, validation.data);
        if (!updated) {
            return { ok: false, status: 404, message: 'Item de inventario no encontrado' };
        }

        return { ok: true, item: this._enrichItem(updated) };
    }

    async consumeMedication(medicationName, quantity = 1) {
        // Descuenta stock cuando se aplica un tratamiento y evita romper el inventario si no alcanza.
        const normalized = this._normalizeMedicationName(medicationName);
        const safeQuantity = Number(quantity) || 0;

        if (!normalized) {
            return { ok: false, status: 400, message: 'El medicamento es requerido' };
        }

        if (!Number.isInteger(safeQuantity) || safeQuantity < 1) {
            return { ok: false, status: 400, message: 'La cantidad debe ser un entero mayor a 0' };
        }

        const updated = await this.inventoryRepository.adjustByMedicationKey(normalized, -safeQuantity);
        if (!updated) {
            const current = await this.inventoryRepository.findByMedicationKey(normalized);
            if (!current) {
                return { ok: false, status: 404, message: 'El medicamento no existe en inventario' };
            }

            return { ok: false, status: 409, message: 'No hay stock suficiente para administrar el tratamiento' };
        }

        return { ok: true, item: this._enrichItem(updated) };
    }

    async restoreMedication(medicationName, quantity = 1) {
        // Revierte el descuento si una operacion de tratamiento falla a mitad del proceso.
        const normalized = this._normalizeMedicationName(medicationName);
        const safeQuantity = Number(quantity) || 0;

        if (!normalized || !Number.isInteger(safeQuantity) || safeQuantity < 1) {
            return { ok: false, status: 400, message: 'Datos invalidos para restaurar inventario' };
        }

        const updated = await this.inventoryRepository.adjustByMedicationKey(normalized, safeQuantity);
        if (!updated) {
            return { ok: false, status: 404, message: 'No se pudo restaurar el inventario' };
        }

        return { ok: true, item: this._enrichItem(updated) };
    }
}

module.exports = InventoryService;
