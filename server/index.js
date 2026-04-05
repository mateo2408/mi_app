// Arranque principal de la API de veterinaria.
// Inicializa entorno, conexión DB y rutas REST.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDatabase } = require('./db');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const ownersRoutes = require('./routes/owners');
const petsRoutes = require('./routes/pets');
const appointmentsRoutes = require('./routes/appointments');
const recordsRoutes = require('./routes/records');

async function startServer() {
  // La API sólo inicia cuando MongoDB está disponible.
  await connectDatabase();

  const app = express();
  const port = process.env.PORT || 3000;

  app.use(
    cors({
      // Permite llamadas del frontend local Angular.
      origin: process.env.CORS_ORIGIN || 'http://localhost:4200'
    })
  );
  // Parsea JSON de entrada para todos los endpoints.
  app.use(express.json());

  // Endpoint liviano para monitoreo/health checks.
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Registro de módulos de negocio.
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/owners', ownersRoutes);
  app.use('/api/pets', petsRoutes);
  app.use('/api/appointments', appointmentsRoutes);
  app.use('/api/records', recordsRoutes);

  // Handler global de errores no capturados por rutas.
  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ message: 'Error interno del servidor' });
  });

  app.listen(port, () => {
    console.log(`API de veterinaria lista en http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  // Si falla bootstrap, se finaliza el proceso para evitar estado inconsistente.
  console.error('No fue posible iniciar la API', error);
  process.exit(1);
});
