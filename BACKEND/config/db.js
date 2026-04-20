/**
 * Configuracion de la base de datos.
 * Centraliza la conexion a MongoDB usando Mongoose.
 */
const mongoose = require('mongoose');
const { seedDatabase } = require('../seed');
const { seedDiagnostics } = require('../seed_diagnostics');

/**
 * Conecta a MongoDB e inicializa datos de prueba (mocks).
 */
const connectDatabase = async () => {
  try {
    const connectionString = process.env.MONGODB_URI;
    const maxPoolSize = Number(process.env.MONGO_MAX_POOL_SIZE || 20);
    const minPoolSize = Number(process.env.MONGO_MIN_POOL_SIZE || 2);

    if (!connectionString) {
      throw new Error('MONGODB_URI no definida. Configura la cadena de MongoDB Atlas en el archivo .env');
    }
    
    mongoose.set('strictQuery', false); // Evita advertencias de Mongoose 7+

    await mongoose.connect(connectionString, {
      maxPoolSize,
      minPoolSize,
      maxIdleTimeMS: 30000,
      waitQueueTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000
    });
    console.log('Base de datos Atlas conectada exitosamente');
    
    // Carga de datos iniciales necesarios para el funcionamiento
    await seedDatabase();
    await seedDiagnostics();
    
  } catch (err) {
    console.error('Fallo critico al conectar la BD en Atlas:', err.message);
    process.exit(1); 
  }
};

module.exports = { connectDatabase };
