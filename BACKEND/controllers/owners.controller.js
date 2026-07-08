/**
 * SRP (Single Responsibility Principle): Controlador de Dueños
 * DIP (Dependency Inversion Principle): Delega acceso a datos a modelo Owner (abstracción).
 *
 * Responsabilidad única: Maneja las peticiones HTTP y orquesta la lógica de validación y CRUD de dueños.
 * - Validar entrada HTTP (cédula)
 * - Ejecutar operaciones CRUD
 * - Construir respuesta HTTP
 */
const Owner = require('../models/Owner');

function luhnCheck(value) {
  // simple Luhn implementation for numeric IDs
  const s = value.replace(/\D/g, '');
  let sum = 0;
  let shouldDouble = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let digit = parseInt(s.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function validateCedulaFormat(raw) {
  if (!raw) return true; // optional field
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 12) return false;
  // If length is 8 or more, run Luhn as additional check (best-effort)
  if (digits.length >= 8) return luhnCheck(digits);
  return true;
}

const getOwners = async (_req, res) => {
  const owners = await Owner.find().sort({ createdAt: -1 }).lean();
  return res.json(owners);
};

const createOwner = async (req, res) => {
  const payload = { ...req.body };

  // Server-side cedula validation (algo + format)
  if (payload.cedula && !validateCedulaFormat(payload.cedula)) {
    return res.status(400).json({ message: 'Cédula inválida' });
  }

  // Prevent duplicate cedula
  if (payload.cedula) {
    const existing = await Owner.findOne({ cedula: payload.cedula }).lean();
    if (existing) return res.status(409).json({ message: 'Cédula ya registrada' });
  }

  const owner = await Owner.create(payload);
  return res.status(201).json(owner);
};

const updateOwner = async (req, res) => {
  const payload = { ...req.body };
  if (payload.cedula && !validateCedulaFormat(payload.cedula)) {
    return res.status(400).json({ message: 'Cédula inválida' });
  }
  // If cedula being updated, ensure uniqueness
  if (payload.cedula) {
    const existing = await Owner.findOne({ cedula: payload.cedula, _id: { $ne: req.params.id } }).lean();
    if (existing) return res.status(409).json({ message: 'Cédula ya registrada' });
  }

  const owner = await Owner.findByIdAndUpdate(req.params.id, payload, { new: true });
  return res.json(owner);
};

const deleteOwner = async (req, res) => {
  await Owner.findByIdAndDelete(req.params.id);
  return res.json({ message: 'Dueño eliminado' });
};

module.exports = { getOwners, createOwner, updateOwner, deleteOwner };
