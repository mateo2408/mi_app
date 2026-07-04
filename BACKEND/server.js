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
const locationsRoutes = require('./routes/locations');
const inventoryRoutes = require('./routes/inventory');

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
  const corsOrigin = process.env.CORS_ORIGIN;
  const allowedOrigins = corsOrigin
    ? corsOrigin.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];
  const corsOptions = {
    origin: (origin, callback) => {
      // Permite llamadas servidor-a-servidor o herramientas sin header Origin.
      if (!origin) {
        return callback(null, true);
      }

      // Permitir automáticamente cualquier puerto de localhost/127.0.0.1 en desarrollo
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }

      // Si no hay una lista explícita, aceptamos cualquier origen para facilitar consumo externo.
      if (allowedOrigins.length === 0) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Rechazar CORS en el navegador sin lanzar un error 500 en Express
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
  };

  // 2. Configuracion de Middlewares Globales
  app.use(cors(corsOptions));
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    return next();
  });
  // express.json() permite que el servidor entienda peticiones con body en formato JSON
  app.use(express.json());

  // 3. Endpoint de salud (Health Check) para verificar que el servidor esta vivo
  app.get('/api', (_req, res) => {
    res.json({
      service: 'vetcore-api',
      status: 'ok',
      message: 'API disponible. Usa /api/health para salud y /api/* para los recursos.'
    });
  });

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
  app.use('/api/locations', locationsRoutes);
  app.use('/api/inventory', inventoryRoutes);

  // Respuesta controlada para rutas /api inexistentes.
  app.use('/api', (req, res) => {
    res.status(404).json({
      message: 'Ruta de API no encontrada',
      path: req.originalUrl,
      available: [
        '/api/health',
        '/api/auth/login',
        '/api/auth/me',
        '/api/dashboard/summary',
        '/api/owners',
        '/api/pets',
        '/api/appointments',
        '/api/records',
        '/api/diagnostics',
        '/api/locations/countries',
        '/api/locations/provinces',
        '/api/locations/cities',
        '/api/inventory'
      ]
    });
  });

  // 5. Configurar Express para servir el Frontend (Angular) compilado
  const path = require('path');
  const fs = require('fs');
  const frontendCandidates = [
    path.join(__dirname, '../dist/mi_app/browser/index.html'),
    path.join(__dirname, '../dist/mi_app/browser/index.csr.html'),
    path.join(process.cwd(), 'dist/mi_app/browser/index.html'),
    path.join(process.cwd(), 'dist/mi_app/browser/index.csr.html'),
    path.join(__dirname, '../../dist/mi_app/browser/index.html'),
    path.join(__dirname, '../../dist/mi_app/browser/index.csr.html')
  ];

  const angularIndexPath = frontendCandidates.find((candidatePath) => fs.existsSync(candidatePath));
  const hasFrontendBuild = Boolean(angularIndexPath);
  const angularDistPath = hasFrontendBuild ? path.dirname(angularIndexPath) : null;

  console.log('[frontend] Build detectado:', hasFrontendBuild ? angularIndexPath : 'no encontrado');

  if (hasFrontendBuild) {
    app.use(express.static(angularDistPath));
  }

  // Cualquier ruta que no sea de la API (/api/...) devolverá la vista principal de Angular
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      if (hasFrontendBuild) {
        res.sendFile(angularIndexPath);
      } else {
        res.status(200).json({
          service: 'vetcore-api',
          status: 'ok',
          message: 'Backend desplegado correctamente. El frontend no esta disponible en este servicio.'
        });
      }
    } else {
      next();
    }
  });

  // 6. Middleware para manejo de errores globales
  // Captura cualquier error no manejado en las rutas de API
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
