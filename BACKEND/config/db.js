// Conexión central a MongoDB usando Mongoose.
const mongoose = require('mongoose');
const { seedDatabase } = require('../seed');

async function connectDatabase() {
  // Prioriza variable de entorno para soportar distintos ambientes.
  const connectionString =
    process.env.MONGODB_URI || 'mongodb://root:rootpass@127.0.0.1:27017/mi_veterinaria?authSource=admin';

  await mongoose.connect(connectionString);
  // Inicializa datos de ejemplo sólo cuando la base está vacía.
  await seedDatabase();
}

module.exports = { connectDatabase };
