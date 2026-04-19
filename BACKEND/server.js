/**
 * Archivo principal del servidor (Punto de entrada de la aplicacion).
 * Aqui se configura Express, se conectan los middlewares (CORS, JSON) 
 * y se registran todas las rutas de la API.
 */
require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const express = require('express');
const cors = require('cors'); // Middleware para permitir peticiones desde el frontend (Cross-Origin Resource Sharing)
const { connectDatabase } = require('./config/db');

// Importacion de las rutas (EndPoints)
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const ownersRoutes = require('./routes/owners');
const petsRoutes = require('./routes/pets');
const appointmentsRoutes = require('./routes/appointments');
const recordsRoutes = require('./routes/records');
const diagnosticsRoutes = require('./routes/diagnostics');

/**
 * Funcion asincrona para inicializar el servidor.
 * Es una buena practica envolver el arranque en una funcion async 
 * para poder usar "await" al conectar a la base de datos.
 */
async function startServer() {
  // 1. Conectar a la base de datos MongoDB
  await connectDatabase();

  const app = express();
  const port = process.env.PORT || 3000;

  // 2. Configuracion de Middlewares Globales
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:4200'
    })
  );
  // express.json() permite que el servidor entienda peticiones con body en formato JSON
  app.use(express.json());

  // 3. Endpoint de salud (Health Check) para verificar que el servidor esta vivo
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // 4. Registro de los modulos de negocio (Rutas)
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/owners', ownersRoutes);
  app.use('/api/pets', petsRoutes);
  app.use('/api/appointments', appointmentsRoutes);
  app.use('/api/records', recordsRoutes);
  app.use('/api/diagnostics', diagnosticsRoutes);

  // 5. Middleware para manejo de errores globales
  // Captura cualquier error no manejado en las rutas anteriores
  app.use((error, _req, res, _next) => {
    console.error('Error no capturado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  });

  // 6. Levantar el servidor en el puerto especificado
  app.listen(port, () => {
    console.log(`API de veterinaria lista en puerto ${port}`);
  });
}

// Ejecutar la funcion de arranque y capturar errores criticos
startServer().catch((error) => {
  console.error('Fallo el inicio del servidor:', error);
  process.exit(1); // Forzar la salida si no hay conexion o falla el arranque
});
