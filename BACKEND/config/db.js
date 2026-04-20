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
    // Prioriza variable de entorno; si no existe, usa Atlas con la base mi_veterinaria.
    const connectionString =
      process.env.MONGODB_URI ||
      'mongodb+srv://adminudla:UDLA@clusterudla01.iguvh9b.mongodb.net/mi_veterinaria?retryWrites=true&w=majority&appName=ClusterUDLA01';
    
    mongoose.set('strictQuery', false); // Evita advertencias de Mongoose 7+
    
    await mongoose.connect(connectionString);
    console.log('Base de datos conectada exitosamente');
    
    // Carga de datos iniciales necesarios para el funcionamiento
    await seedDatabase();
    await seedDiagnostics();
    
  } catch (err) {
    // En arquitecturas de contenedores, si la BD no conecta, es preferible matar el proceso y que Docker reinicie el contenedor.
    console.error('Fallo critico al conectar la BD:', err.message);
    process.exit(1); 
  }
};

module.exports = { connectDatabase };
