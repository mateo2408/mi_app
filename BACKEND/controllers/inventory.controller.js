/**
 * SRP (Single Responsibility Principle): Controlador de Inventario
 * DIP (Dependency Inversion Principle): Depende de InventoryService inyectado, no de BD directamente.
 *
 * Responsabilidad única: Orquestar el flujo HTTP del inventario.
 * - Validar entrada HTTP
 * - Delegar lógica de negocio al CORE (InventoryService)
 * - Construir respuesta HTTP
 */
const { inventoryService } = require('../../CORE');

const listInventory = async (_req, res) => {
    try {
        const items = await inventoryService.listInventory();
        return res.json(items);
    } catch (error) {
        console.error('[Inventory Controller] Error en listInventory:', error);
        return res.status(500).json({ message: 'Error obteniendo inventario.' });
    }
};

const getInventorySummary = async (_req, res) => {
    try {
        const summary = await inventoryService.getSummary();
        return res.json(summary);
    } catch (error) {
        console.error('[Inventory Controller] Error en getInventorySummary:', error);
        return res.status(500).json({ message: 'Error obteniendo resumen de inventario.' });
    }
};

const createInventoryItem = async (req, res) => {
    try {
        const result = await inventoryService.createItem(req.body);
        if (!result.ok) {
            return res.status(result.status || 400).json({ message: result.message, errors: result.errors });
        }
        return res.status(201).json(result.item);
    } catch (error) {
        console.error('[Inventory Controller] Error en createInventoryItem:', error);
        return res.status(500).json({ message: 'Error creando item de inventario.' });
    }
};

const updateInventoryItem = async (req, res) => {
    try {
        const result = await inventoryService.updateItem(req.params.id, req.body);
        if (!result.ok) {
            return res.status(result.status || 400).json({ message: result.message, errors: result.errors });
        }
        return res.json(result.item);
    } catch (error) {
        console.error('[Inventory Controller] Error en updateInventoryItem:', error);
        return res.status(500).json({ message: 'Error actualizando item de inventario.' });
    }
};

module.exports = {
    listInventory,
    getInventorySummary,
    createInventoryItem,
    updateInventoryItem
};
