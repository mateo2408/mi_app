# 🔧 PLAN DE CORRECCIONES - Conformidad con Especificaciones

## Introducción
Este documento detalla cómo resolver los 3 problemas críticos y 1 problema menor identificados en el análisis de conformidad.

---

## 🔴 PROBLEMA 1: Alertas Epidemiológicas No Persistidas

### Problema
- Las alertas se generan en `outbreak.analyzer.js` pero solo en memoria
- No se guardan en la BD
- Se pierden después de la respuesta HTTP
- El dashboard no puede mostrar histórico de alertas

### Especificación vs Realidad
```
Especificado: "Generar Alerta si se alcanza o supera el umbral"
             "Los veterinarios recibirán esta información en tiempo real"
             (Implícito: las alertas deberían persistirse)

Realidad: Alertas en memoria, flujo:
  POST /diagnostics → analyzeDisease() → generate alert (in memory) → 
  return to frontend → alert LOST on next request
```

### Solución Implementada

#### Paso 1: Crear modelo BACKEND/models/Alert.js
```javascript
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['OUTBREAK_ALERT'],
    default: 'OUTBREAK_ALERT'
  },
  disease: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disease',
    required: true
  },
  diseaseName: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  caseCount: {
    type: Number,
    required: true
  },
  threshold: {
    type: Number,
    required: true
  },
  medication: String,
  recommendation: String,
  status: {
    type: String,
    enum: ['ACTIVE', 'RESOLVED', 'ACKNOWLEDGED'],
    default: 'ACTIVE'
  },
  detectedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  resolvedAt: Date,
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
```

#### Paso 2: Crear repositorio CORE/repositories/alert.repository.js
```javascript
class AlertRepository {
  constructor(alertModel) {
    this.alertModel = alertModel;
  }

  async create(alertData) {
    const alert = new this.alertModel(alertData);
    return await alert.save();
  }

  async findActiveByDisease(diseaseId) {
    return await this.alertModel.find({
      disease: diseaseId,
      status: 'ACTIVE'
    }).sort({ detectedAt: -1 });
  }

  async findAll(filter = {}) {
    return await this.alertModel.find(filter)
      .populate('disease')
      .populate('acknowledgedBy')
      .sort({ detectedAt: -1 });
  }

  async updateStatus(alertId, status) {
    return await this.alertModel.findByIdAndUpdate(
      alertId,
      { 
        status,
        resolvedAt: status === 'RESOLVED' ? new Date() : null
      },
      { new: true }
    );
  }
}

module.exports = AlertRepository;
```

#### Paso 3: Modificar CORE/epidemiology/outbreak.analyzer.js
```javascript
// Agregar dependencia de alertRepository en constructor
class OutbreakAnalyzer {
  constructor(diagnosisRepository, diseaseRepository, alertRepository) {
    this.diagnosisRepository = diagnosisRepository;
    this.diseaseRepository = diseaseRepository;
    this.alertRepository = alertRepository;  // ← NUEVO
  }

  async analyzeDisease(diseaseId, threshold = 6, windowDays = 60) {
    // ... código existente ...
    
    // Línea 79: SI hay brote, GUARDAR alerta en BD
    if (isOutbreak) {
      result.alert = this._generateAlert(disease, caseCount, effectiveThreshold);
      
      // ← NUEVO: Persistir en BD
      await this.alertRepository.create({
        type: 'OUTBREAK_ALERT',
        disease: disease._id,
        diseaseName: disease.name,
        severity: result.alert.severity,
        caseCount,
        threshold: effectiveThreshold,
        medication: disease.medication,
        recommendation: result.alert.recommendation
      });
    }
    
    return result;
  }
}
```

#### Paso 4: Crear controlador BACKEND/controllers/alerts.controller.js
```javascript
const { repositories, outbreakAnalyzer } = require('../../CORE');
const Alert = require('../models/Alert');

const getActiveAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ status: 'ACTIVE' })
      .populate('disease')
      .sort({ detectedAt: -1 });
    return res.json(alerts);
  } catch (err) {
    return res.status(500).json({ message: 'Error obteniendo alertas' });
  }
};

const getAllAlerts = async (req, res) => {
  try {
    const { status, severity } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    
    const alerts = await Alert.find(filter)
      .populate('disease')
      .sort({ detectedAt: -1 });
    return res.json(alerts);
  } catch (err) {
    return res.status(500).json({ message: 'Error obteniendo alertas' });
  }
};

const acknowledgeAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      { status: 'ACKNOWLEDGED', acknowledgedBy: req.auth.sub },
      { new: true }
    );
    return res.json(alert);
  } catch (err) {
    return res.status(500).json({ message: 'Error actualizando alerta' });
  }
};

module.exports = { getActiveAlerts, getAllAlerts, acknowledgeAlert };
```

#### Paso 5: Crear rutas BACKEND/routes/alerts.js
```javascript
const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alerts.controller');
const authenticateToken = require('../middleware/auth');

router.get('/active', authenticateToken, alertsController.getActiveAlerts);
router.get('/', authenticateToken, alertsController.getAllAlerts);
router.put('/:alertId/acknowledge', authenticateToken, alertsController.acknowledgeAlert);

module.exports = router;
```

#### Paso 6: Registrar rutas en BACKEND/server.js
```javascript
const alertsRoutes = require('./routes/alerts');
app.use('/api/alerts', alertsRoutes);
```

### Verificación
```bash
# Después de estos cambios:
POST /api/diagnostics → alerta guardada en BD ✅
GET /api/alerts → lista todas las alertas ✅
GET /api/alerts/active → solo alertas activas ✅
```

---

## 🔴 PROBLEMA 2: Auditoría de Cambios Incompleta

### Problema
- Especificado: "Registro de quién hizo qué, cuándo y en qué registro"
- Implementado: Solo timestamps (createdAt/updatedAt)
- Falta: Usuario que realizó el cambio, tipo de operación, valores anteriores/nuevos

### Solución Implementada

#### Paso 1: Crear modelo BACKEND/models/AuditLog.js
```javascript
const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  // Quién
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: String,
  
  // Qué
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'VIEW'],
    required: true
  },
  
  // En qué registro
  resourceType: {
    type: String,
    enum: ['User', 'Pet', 'Owner', 'Appointment', 'ClinicalRecord', 'Diagnosis', 'Disease'],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  resourceName: String, // Para contexto (nombre de mascota, etc)
  
  // Cambios
  changes: {
    fields: [{
      fieldName: String,
      oldValue: mongoose.Schema.Types.Mixed,
      newValue: mongoose.Schema.Types.Mixed
    }],
    beforeData: mongoose.Schema.Types.Mixed,
    afterData: mongoose.Schema.Types.Mixed
  },
  
  // Cuándo
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Metadata
  ipAddress: String,
  userAgent: String,
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED'],
    default: 'SUCCESS'
  },
  errorMessage: String
}, { timestamps: false });

// Índices para búsquedas rápidas
auditSchema.index({ userId: 1, timestamp: -1 });
auditSchema.index({ resourceType: 1, resourceId: 1 });
auditSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditSchema);
```

#### Paso 2: Crear middleware BACKEND/middleware/audit.js
```javascript
const AuditLog = require('../models/AuditLog');

/**
 * Middleware para registrar cambios en auditoría
 * Se ejecuta después de completar la operación
 */
const auditMiddleware = (req, res, next) => {
  const originalJson = res.json;

  res.json = function(data) {
    // Capturar respuesta para registrar si fue exitosa
    if (res.statusCode < 400 && req.auditData) {
      const { userId, resourceType, resourceId, action, beforeData, afterData } = req.auditData;
      
      // Guardar en auditoría de forma asíncrona
      AuditLog.create({
        userId,
        userName: req.auth?.fullName || 'Unknown',
        action,
        resourceType,
        resourceId,
        changes: {
          beforeData,
          afterData,
          fields: calculateChanges(beforeData, afterData)
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        status: 'SUCCESS'
      }).catch(err => console.error('[Audit] Error guardando log:', err));
    }

    return originalJson.call(this, data);
  };

  next();
};

const calculateChanges = (beforeData, afterData) => {
  if (!beforeData) return []; // CREATE operation
  
  const changes = [];
  Object.keys(afterData).forEach(key => {
    if (JSON.stringify(beforeData[key]) !== JSON.stringify(afterData[key])) {
      changes.push({
        fieldName: key,
        oldValue: beforeData[key],
        newValue: afterData[key]
      });
    }
  });
  return changes;
};

module.exports = auditMiddleware;
```

#### Paso 3: Modificar controladores para capturar cambios
```javascript
// Ejemplo en BACKEND/controllers/pets.controller.js
const updatePet = async (req, res) => {
  try {
    const { petId } = req.params;
    
    // Obtener datos ANTES del cambio
    const beforeData = await Pet.findById(petId).lean();
    
    // Realizar actualización
    const updatedPet = await Pet.findByIdAndUpdate(petId, req.body, { new: true });
    
    // Preparar datos para auditoría
    req.auditData = {
      userId: req.auth.sub,
      resourceType: 'Pet',
      resourceId: petId,
      action: 'UPDATE',
      beforeData,
      afterData: updatedPet.toObject()
    };
    
    return res.json(updatedPet);
  } catch (err) {
    return res.status(500).json({ message: 'Error actualizando mascota' });
  }
};
```

#### Paso 4: Crear controlador BACKEND/controllers/audit.controller.js
```javascript
const AuditLog = require('../models/AuditLog');

const getAuditLog = async (req, res) => {
  try {
    const { resourceType, resourceId, userId, action, startDate, endDate, limit = 100 } = req.query;
    
    const filter = {};
    if (resourceType) filter.resourceType = resourceType;
    if (resourceId) filter.resourceId = resourceId;
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    const logs = await AuditLog.find(filter)
      .populate('userId', 'fullName email')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: 'Error obteniendo auditoría' });
  }
};

const getUserAuditHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = await AuditLog.find({ userId })
      .sort({ timestamp: -1 })
      .limit(50);
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ message: 'Error obteniendo historial' });
  }
};

module.exports = { getAuditLog, getUserAuditHistory };
```

#### Paso 5: Crear rutas BACKEND/routes/audit.js
```javascript
const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, auditController.getAuditLog);
router.get('/user/:userId', authenticateToken, auditController.getUserAuditHistory);

module.exports = router;
```

### Verificación
```bash
# Después de estos cambios:
PUT /api/pets/:id → registra en AuditLog ✅
GET /api/audit → lista cambios con usuario, fecha, valores ✅
GET /api/audit?resourceType=Pet&resourceId=X → historial de mascota ✅
```

---

## 🟠 PROBLEMA 3: Control RBAC sin Validación en Endpoints

### Problema
- Los roles se definen en User.js (admin, veterinario, recepcion)
- El token contiene el rol en JWT
- **Pero:** No se valida el rol en los endpoints
- **Riesgo:** Un usuario recepcion podría acceder a endpoints de admin

### Solución

#### Paso 1: Crear middleware BACKEND/middleware/authorize.js
```javascript
/**
 * Middleware para validar roles
 * Uso: authorizeRoles('admin', 'veterinario')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({ 
        message: 'No tienes permiso para acceder a este recurso',
        requiredRoles: allowedRoles,
        userRole: req.auth.role
      });
    }

    next();
  };
};

module.exports = authorizeRoles;
```

#### Paso 2: Proteger rutas críticas

**BACKEND/routes/users.js (solo admin):**
```javascript
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorize');
const usersController = require('../controllers/users.controller');

// Solo admin puede CRUD usuarios
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin'),
  usersController.create
);

router.put('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  usersController.update
);

router.delete('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  usersController.delete
);

module.exports = router;
```

**BACKEND/routes/diagnostics.js (solo veterinario):**
```javascript
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorize');
const diagnosticsController = require('../controllers/diagnostics.controller');

// Solo veterinario puede registrar diagnósticos
router.post('/',
  authenticateToken,
  authorizeRoles('veterinario'),
  diagnosticsController.createDiagnostic
);

// Todos pueden consultar
router.get('/outbreaks/:diseaseId',
  authenticateToken,
  diagnosticsController.analyzeOutbreak
);

module.exports = router;
```

**BACKEND/routes/diseases.js (admin crea, todos leen):**
```javascript
// Admin: crear/modificar enfermedades
router.post('/',
  authenticateToken,
  authorizeRoles('admin'),
  diseasesController.create
);

router.put('/:id',
  authenticateToken,
  authorizeRoles('admin'),
  diseasesController.update
);

// Todos: consultar catálogo
router.get('/', authenticateToken, diseasesController.getAll);
```

#### Paso 3: Matriz de Permisos (Documentación)
```markdown
# MATRIZ RBAC

| Endpoint | Método | Admin | Vet | Soporte | Notes |
|----------|--------|-------|-----|---------|-------|
| /users | GET | ✓ | | | Solo admin ve usuarios |
| /users | POST | ✓ | | | Crear usuarios |
| /users/:id | PUT | ✓ | | | Editar usuarios |
| /users/:id | DELETE | ✓ | | | Eliminar usuarios |
| /pets | GET | ✓ | ✓ | ✓ | Todos pueden ver mascotas |
| /pets | POST | ✓ | ✓ | | Admin y vet crean |
| /diagnostics | POST | | ✓ | | Solo vet registra diagnósticos |
| /appointments | GET | ✓ | ✓ | ✓ | Todos ven citas |
| /appointments | POST | ✓ | ✓ | ✓ | Admin, vet, soporte crean |
| /appointments/:id | PUT | ✓ | ✓ | | Admin y vet modifican |
| /alerts | GET | ✓ | ✓ | ✓ | Todos pueden ver alertas |
| /audit | GET | ✓ | | | Solo admin ve auditoría |
```

---

## 🟡 PROBLEMA 4: Nombre de Rol Inconsistente

### Problema
- Especificado: "Personal de Soporte"
- Implementado: "recepcion"
- Necesita: Estandarización

### Solución

#### Opción A: Renombrar a "support" (recomendado)
```javascript
// BACKEND/models/User.js
role: {
  type: String,
  enum: ['admin', 'support', 'veterinario'],  // ← Cambio
  default: 'support'  // ← Cambio
}
```

#### Opción B: Renombrar a "soporte"
```javascript
// BACKEND/models/User.js
role: {
  type: String,
  enum: ['admin', 'soporte', 'veterinario'],  // ← Cambio
  default: 'soporte'  // ← Cambio
}
```

**Pasos adicionales:**
1. Actualizar BACKEND/seed.js
2. Actualizar BACKEND/seed_*.js
3. Actualizar mongoDB existente: `db.users.updateMany({ role: 'recepcion' }, { $set: { role: 'support' } })`
4. Actualizar frontend (si hay referencias)

---

## 📋 Orden de Implementación Recomendado

### Fase 1: Crítico (Semana 1)
- [ ] Crear modelo Alert.js
- [ ] Modificar outbreak.analyzer.js para persistir alertas
- [ ] Crear endpoints GET /api/alerts
- [ ] Crear modelo AuditLog.js
- [ ] Implementar middleware de auditoría

### Fase 2: Importante (Semana 2)
- [ ] Crear middleware authorizeRoles
- [ ] Proteger endpoints sensibles
- [ ] Documentar matriz RBAC
- [ ] Tests de autorización

### Fase 3: Menor (Semana 3)
- [ ] Renombrar rol 'recepcion' → 'support'
- [ ] Actualizar documentación
- [ ] Tests de auditoría
- [ ] Tests del Core

---

## ✅ Checklist de Validación

### Después de Implementar Alertas:
- [ ] Alert.js crea documentos en BD
- [ ] GET /api/alerts retorna alertas
- [ ] Dashboard muestra alertas históricas
- [ ] Alertas persisten después de reiniciar

### Después de Implementar Auditoría:
- [ ] AuditLog.js registra cambios
- [ ] GET /api/audit muestra historial
- [ ] Campos `beforeData` y `afterData` se llenan
- [ ] Usuario y timestamp se capturan correctamente

### Después de Implementar RBAC:
- [ ] POST /users requiere role 'admin'
- [ ] POST /diagnostics requiere role 'veterinario'
- [ ] POST /appointments funciona para admin, vet, support
- [ ] 403 retorna cuando usuario no tiene permisos

---

**Tiempo estimado de implementación: 2-3 semanas**

