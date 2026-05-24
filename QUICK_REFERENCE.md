# Quick Reference - Estructura VetCore

## 🚀 Dónde Ir para...

### Agregar una nueva Regla de Negocio
→ `CORE/epidemiology/outbreak.analyzer.js`
Método: `analyzeDisease()` o `analyzeAllDiseases()`

### Agregar un nuevo Endpoint API
→ `BACKEND/routes/[module].js` + `BACKEND/controllers/[module].controller.js`

### Cambiar la Lógica de Validación de Enfermedad
→ `CORE/epidemiology/disease.service.js`
Método: `validateDiseaseData()`

### Agregar Campos a Base de Datos
→ `BACKEND/models/[Model].js` (Mongoose Schema)
Luego: `BACKEND/controllers/[module].controller.js`

### Crear un Nuevo Servicio Angular
→ `FRONTEND/src/app/core/[service].service.ts`

### Crear un Nuevo Componente de Página
→ `FRONTEND/src/app/pages/[page].component.ts`

### Crear Componente Reutilizable
→ `FRONTEND/src/app/shared/[component].component.ts`

---

## 🏗️ Flujo de un Diagnóstico

```
1. Usuario: POST /api/diagnostics
   ↓
2. Backend Validación
   └─→ ¿Datos válidos?
   ↓
3. Backend CRUD
   └─→ Diagnosis.create(petName, diseaseId)
   ↓
4. Backend → CORE
   └─→ outbreakAnalyzer.analyzeDisease(diseaseId)
   ↓
5. CORE Análisis
   └─→ Busca diagnósticos últimos 60 días
   └─→ Count >= 6? → Alerta
   ↓
6. Backend Respuesta
   └─→ { diagnosis, outbreakAnalysis, alert }
   ↓
7. Frontend Renderiza
   └─→ Muestra alerta visual si es necesario
```

---

## 📊 Responsabilidades por Capa

| Capa | Responsabilidad | Ejemplo |
|------|-----------------|---------|
| **CORE** | Lógica pura | `outbreak.analyzer.analyzeDisease()` |
| **BACKEND** | HTTP + BD | `POST /api/diagnostics → Diagnosis.create()` |
| **FRONTEND** | UI/UX | Mostrar formulario y alertas |

---

## 🔑 Archivos Principales

```
CORE/index.js
  └─ Importa: OutbreakAnalyzer, DiseaseService, EpidemicComparator
  └─ Inyecta dependencias (Repositories)
  └─ Exporta: outbreakAnalyzer, diseaseService, epidemicComparator

BACKEND/server.js
  └─ Configura Express
  └─ Registra rutas: /api/auth, /api/diagnostics, etc.
  └─ Sirve frontend compilado

BACKEND/controllers/diagnostics.controller.js
  └─ createDiagnostic(): CRUD + delega CORE
  └─ analyzeOutbreak(): Llama directamente a CORE
  └─ getEpidemicReport(): Llama directamente a CORE

CORE/epidemiology/outbreak.analyzer.js
  ⭐ EL CORAZÓN: Regla de 6 casos en 60 días
  └─ analyzeDisease(diseaseId)
  └─ analyzeAllDiseases()
  └─ compareEpidemiology(id1, id2)
```

---

## 🧪 Testing (Guía)

### Test Unitario de CORE
```javascript
const OutbreakAnalyzer = require('./outbreak.analyzer');
const mockDiagnosisRepo = { findRecentByDisease: () => [1,2,3] };
const mockDiseaseRepo = { findById: () => { name: 'X', threshold: 6 } };
const analyzer = new OutbreakAnalyzer(mockDiagnosisRepo, mockDiseaseRepo);
// analyzer.analyzeDisease('id123') → Test resultado
```

### Test del Endpoint
```javascript
POST /api/diagnostics
{ petName: 'Firulais', diseaseId: 'disease123' }
// Esperar: { diagnosis, outbreakAnalysis, alert: null|{...} }
```

---

## 🛠️ Comandos Útiles

```bash
# Validar sintaxis
node -c CORE/index.js
node -c BACKEND/server.js

# Iniciar backend
npm run api

# Iniciar frontend
npm start

# Ver estructura
tree -L 2 CORE/
tree -L 2 BACKEND/
```

---

## 📝 Patrón de Nuevo Endpoint

1. **Ruta**: `BACKEND/routes/[module].js`
   ```javascript
   router.get('/analyze/:diseaseId', requireAuth, analyzeOutbreak);
   ```

2. **Controller**: `BACKEND/controllers/[module].controller.js`
   ```javascript
   const analyzeOutbreak = async (req, res) => {
       const { diseaseId } = req.params;
       const result = await coreService.analyze(diseaseId);
       res.json(result);
   };
   ```

3. **Registrar en server**: Ya hecho en `BACKEND/server.js`
   ```javascript
   app.use('/api/[module]', require('./routes/[module]'));
   ```

---

## ⚙️ Estructura de Respuesta HTTP

### Diagnóstico Exitoso
```json
{
  "diagnosis": { "_id": "...", "petName": "Firulais", "diseaseId": "..." },
  "outbreakAnalysis": {
    "isOutbreak": true,
    "caseCount": 6,
    "threshold": 6,
    "alert": {
      "type": "OUTBREAK_ALERT",
      "severity": "MEDIUM",
      "message": "ALERTA EPIDEMIOLÓGICA: 6 casos...",
      "recommendation": "Comprar Lote de X"
    }
  }
}
```

### Reporte Epidemiológico
```json
{
  "summary": {
    "totalDiseases": 5,
    "activeOutbreaks": 2,
    "diseasesAtRisk": 1,
    "stableDiseases": 2
  },
  "classification": {
    "outbreaks": [...],
    "atRisk": [...],
    "stable": [...]
  },
  "recommendations": [...]
}
```

---

## 🔗 Flujos Principales (API)

1. **Registrar Diagnóstico**
   ```
   POST /api/diagnostics
   Body: { petName, diseaseId }
   Response: { diagnosis, outbreakAnalysis, alert }
   ```

2. **Obtener Catálogo de Enfermedades**
   ```
   GET /api/diagnostics/catalog
   Response: [{ _id, name, medication, outbreakThreshold }, ...]
   ```

3. **Analizar Brote de Enfermedad**
   ```
   GET /api/diagnostics/analyze/:diseaseId
   Response: { isOutbreak, caseCount, threshold, alert }
   ```

4. **Comparar Epidemiologías**
   ```
   GET /api/diagnostics/compare/:id1/:id2
   Response: { disease1, disease2, comparison, interpretation }
   ```

5. **Obtener Reporte Epidemiológico**
   ```
   GET /api/diagnostics/report/epidemic
   Response: { summary, classification, recommendations }
   ```

6. **Dashboard Principal**
   ```
   GET /api/dashboard
   Response: { counts, recentAppointments, recentPets, activeOutbreaks, recommendations }
   ```

---

## 🎓 Aprender Más

- **Estructura completa**: Ver `ARCHITECTURE.md`
- **Resumen ejecutivo**: Ver `PROJECT_SUMMARY.md`
- **Lógica epidemiológica**: Leer `CORE/epidemiology/outbreak.analyzer.js`
- **Integración HTTP**: Leer `BACKEND/controllers/diagnostics.controller.js`
