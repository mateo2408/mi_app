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
    // Si no existe la variable de entorno, usa una cadena por defecto compatible con el contenedor Docker
    const connectionString = process.env.MONGODB_URI || 'mongodb://root:rootpass@127.0.0.1:27017/mi_veterinaria?authSource=admin';
    
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
