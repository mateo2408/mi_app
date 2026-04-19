const Owner = require('../models/Owner');

const getOwners = async (_req, res) => {
  const owners = await Owner.find().sort({ createdAt: -1 }).lean();
  return res.json(owners);
};

const createOwner = async (req, res) => {
  const owner = await Owner.create(req.body);
  return res.status(201).json(owner);
};

const updateOwner = async (req, res) => {
  const owner = await Owner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  return res.json(owner);
};

const deleteOwner = async (req, res) => {
  await Owner.findByIdAndDelete(req.params.id);
  return res.json({ message: 'Dueño eliminado' });
};

module.exports = { getOwners, createOwner, updateOwner, deleteOwner };
