# Arquitectura del Proyecto VetCore

## Visión General

Este proyecto implementa una **arquitectura de capas clara** con separación de responsabilidades:

```
FRONTEND (Angular)
       ↓
   API REST
       ↓
BACKEND (Express - CRUD)
       ↓
   CORE (Business Logic)
       ↓
   Database (MongoDB)
```

## Estructura de Carpetas

### 📁 `CORE/` - El Corazón Inteligente
**Responsabilidad:** Lógica de negocio agnóstica a la presentación.

```
CORE/
├── index.js                          # Punto de entrada - Exporta servicios
├── repositories/
│   ├── diagnosis.repository.js       # Acceso a datos de diagnósticos
│   └── disease.repository.js         # Acceso a datos de enfermedades
└── epidemiology/                     # Lógica epidemiológica
    ├── outbreak.analyzer.js          # Análisis de brotes (6+ casos en 60 días)
    ├── disease.service.js            # Validación y negocio de enfermedades
    └── epidemic.comparator.js        # Comparaciones y reportes
```

**Conceptos Clave:**
- Los servicios son **agnósticos a HTTP**: Pueden usarse en CLI, eventos, etc.
- Implementan **inyección de dependencias** para testabilidad
- Contienen **toda la lógica de epidemiología** del sistema

**Ejemplo: Regla de Negocio Principal**
```javascript
// Si hay 6+ casos de una enfermedad en 60 días → Alerta de Reabastecimiento
const analysis = await outbreakAnalyzer.analyzeDisease(diseaseId);
if (analysis.isOutbreak) {
    // Generar alerta para compra de medicamento
}
```

### 🔧 `BACKEND/` - Orquestación y CRUD
**Responsabilidad:** Manejo de HTTP, validación de entrada, CRUD básico.

```
BACKEND/
├── server.js                         # Punto de entrada Express
├── config/
│   └── db.js                         # Configuración MongoDB
├── models/                           # Mongoose Schemas
│   ├── User.js
│   ├── Owner.js
│   ├── Pet.js
│   ├── Appointment.js
│   ├── ClinicalRecord.js
│   ├── Disease.js                    # Catálogo de enfermedades
│   ├── Diagnosis.js                  # Registro de diagnósticos
│   ├── Country.js
│   ├── Province.js
│   └── City.js
├── controllers/                      # Orquestadores HTTP
│   ├── auth.controller.js            # Login/JWT
│   ├── diagnostics.controller.js     # Registra diagnosis + invoca CORE
│   ├── dashboard.controller.js       # Agregador + invoca CORE
│   ├── appointments.controller.js    # CRUD puro
│   ├── owners.controller.js          # CRUD puro
│   ├── pets.controller.js            # CRUD puro
│   ├── records.controller.js         # CRUD puro
│   └── locations.controller.js       # CRUD puro
├── routes/                           # Rutas HTTP
│   ├── auth.js
│   ├── diagnostics.js
│   ├── dashboard.js
│   ├── appointments.js
│   ├── owners.js
│   ├── pets.js
│   ├── records.js
│   └── locations.js
├── middleware/
│   └── auth.js                       # JWT validation
└── seed*.js                          # Scripts de inicialización
```

**Responsabilidades del Backend:**
- ✓ Validar entrada HTTP
- ✓ Autenticación/Autorización
- ✓ CRUD directo en Base de Datos
- ✗ **NO** lógica de negocio (eso es CORE)

### 🎨 `FRONTEND/` - Angular App
**Responsabilidad:** Interfaz de usuario y experiencia.

```
FRONTEND/src/app/
├── core/
│   ├── api.service.ts               # Cliente HTTP
│   ├── auth.service.ts              # Gestión JWT
│   ├── diagnosis.service.ts         # Llamadas a diagnósticos
│   ├── auth.guard.ts                # Protección de rutas
│   ├── guest.guard.ts               # Redirige si autenticado
│   ├── auth.interceptor.ts          # Inyecta token en headers
│   ├── models.ts                    # Interfaces TypeScript
│   ├── diagnosis.models.ts          # Modelos de diagnóstico
│   └── layout.component.ts          # Navbar compartido
├── pages/
│   ├── login.component.ts
│   ├── dashboard.component.ts
│   ├── diagnostics.component.ts
│   ├── appointments.component.ts
│   ├── owners.component.ts
│   ├── pets.component.ts
│   └── records.component.ts
├── shared/                          # Componentes reutilizables (futuro)
├── app.routes.ts                    # Rutas Angular
├── app.config.ts                    # Configuración
└── app.ts                           # App root component
```

## Flujo de Datos: Ejemplo Diagnóstico

```
1. FRONTEND: Usuario registra diagnóstico
   └─→ POST /api/diagnostics { petName, diseaseId }

2. BACKEND Controller: Valida entrada
   └─→ repositories.DiagnosisRepository.create()
   └─→ CORE: outbreakAnalyzer.analyzeDisease()

3. CORE Business Logic:
   └─→ Busca diagnósticos recientes (últimos 60 días)
   └─→ Cuenta casos: 6+ → ES UN BROTE
   └─→ Genera alerta estructurada

4. BACKEND Controller: Retorna respuesta
   └─→ { diagnosis, outbreakAnalysis, alert }

5. FRONTEND: Renderiza alerta visual
   └─→ "¡ALERTA! 6 casos de Parvovirus. Comprar: Serum"
```

## Decisiones Arquitectónicas

### ✓ Por qué esta estructura

1. **Separación de Responsabilidades**
   - CORE no conoce HTTP, bases de datos concretas, ni presentación
   - BACKEND es puro enrutador/validador
   - FRONTEND es pura presentación

2. **Testabilidad**
   - CORE es fácil testear sin mocks de HTTP
   - Controllers testean orquestación
   - Frontend testea renderizado

3. **Reutilización**
   - CORE puede usarse en CLI, scripts, eventos
   - BACKEND puede reemplazarse por FastAPI/Java sin cambiar CORE
   - FRONTEND puede reemplazarse por React sin cambiar CORE

4. **Escalabilidad**
   - Agregar nuevas reglas epidemiológicas → Edita CORE
   - Agregar nuevos endpoints → Edita BACKEND
   - Cambiar UI → Edita FRONTEND

## La Regla de Negocio Principal

```
Sistema de Alertas Epidemiológicas
├─ Monitorea enfermedades registradas
├─ Cuenta diagnósticos en ventana de 60 días
├─ Si count ≥ threshold (default 6)
│  └─ ALERTA: "Reabastecer farmacia con X medicamento"
└─ Cada enfermedad puede tener threshold diferente
```

**Ubicación:** `CORE/epidemiology/outbreak.analyzer.js`

## Endpoints Principales

### Diagnósticos
- `POST /api/diagnostics` - Registrar diagnóstico (activa análisis)
- `GET /api/diagnostics/catalog` - Listar enfermedades
- `GET /api/diagnostics/critical-diseases` - Enfermedades en riesgo
- `GET /api/diagnostics/analyze/:diseaseId` - Analizar brote específico
- `GET /api/diagnostics/analyze/all` - Analizar todos los brotes
- `GET /api/diagnostics/compare/:id1/:id2` - Comparar epidemiologías
- `GET /api/diagnostics/report/epidemic` - Reporte completo

### Dashboard
- `GET /api/dashboard` - Resumen central (usa CORE para alertas)

### CRUD Estándar
- `/api/appointments` - Citas
- `/api/owners` - Dueños
- `/api/pets` - Mascotas
- `/api/records` - Registros clínicos
- `/api/locations` - Ubicaciones

## Archivos Eliminados

Removidos durante reorganización (eran generadores, no código productivo):
- `test-dashboard.js`
- `test2.js`
- `backend-generator.js`
- `frontend-generator.js`
- `frontend.js`

## Próximos Pasos

1. **Tests unitarios** para CORE
   - Validar lógica epidemiológica
   - Testear OutbreakAnalyzer con datos reales

2. **Tests E2E** para flujos críticos
   - Registrar diagnóstico → Verificar alerta

3. **Documentación OpenAPI** para Backend
   - Swagger/Postman para endpoints

4. **Monitoreo** de alertas epidemiológicas
   - Dashboard de brotes activos
   - Notificaciones en tiempo real
