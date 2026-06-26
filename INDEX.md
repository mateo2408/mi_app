# 📚 Índice de Documentación - VetCore

## 🚀 Comienza Aquí

### Para Entender Rápidamente
1. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - 5 min
   - Dónde ir para hacer cambios
   - Flujos principales
   - Comandos útiles
   
### Para Entender en Profundidad
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - 20 min
   - Decisiones arquitectónicas
   - Flujo de datos detallado
   - Endpoints principales

### Para Ver Qué se Hizo
3. **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - 10 min
   - Cambios realizados
   - Logros principales
   - Próximos pasos

### Principios SOLID y Patrones de Diseño
4. **[SOLID_PRINCIPLES.md](./SOLID_PRINCIPLES.md)** - 15 min
   - Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion
   - Mapeo a archivos concretos del proyecto
5. **[DESIGN_PATTERNS.md](./DESIGN_PATTERNS.md)** - 10 min
   - Singleton (ServiceContainer + Angular DI)
   - Factory Method (AlertFactory)
   - Diagramas y ejemplos de uso

---

## 📁 Estructura de Carpetas

```
mi_app/
├── CORE/                          ← LÓGICA DE NEGOCIO
│   ├── index.js                   (exporta servicios)
│   ├── patterns/                  ⭐ PATRONES DE DISEÑO
│   │   ├── service-container.singleton.js  (Singleton)
│   │   └── alert.factory.js                (Factory Method)
│   ├── repositories/              (acceso a datos)
│   │   ├── diagnosis.repository.js
│   │   └── disease.repository.js
│   └── epidemiology/              ⭐ SERVICIOS DE EPIDEMIOLOGÍA
│       ├── outbreak.analyzer.js   (regla 6 casos/60 días)
│       ├── disease.service.js     (validación)
│       └── epidemic.comparator.js (reportes)
│
├── BACKEND/                       ← HTTP + CRUD
│   ├── server.js
│   ├── controllers/               (orquestadores)
│   ├── routes/                    (endpoints)
│   ├── models/                    (Mongoose schemas)
│   ├── middleware/                (auth, cors)
│   └── config/
│
├── FRONTEND/                      ← ANGULAR UI
│   └── src/app/
│       ├── core/                  (servicios)
│       ├── pages/                 (componentes)
│       └── shared/                (componentes reutilizables)
│
└── Documentación/
    ├── ARCHITECTURE.md            ← LEER PRIMERO
    ├── SOLID_PRINCIPLES.md        ← PRINCIPIOS SOLID
    ├── DESIGN_PATTERNS.md         ← SINGLETON + FACTORY METHOD
    ├── PROJECT_SUMMARY.md
    ├── QUICK_REFERENCE.md
    └── INDEX.md (este archivo)
```

---

## 🎯 Tareas Comunes

### Quiero Agregar una Nueva Regla de Negocio
→ Editar: `CORE/epidemiology/outbreak.analyzer.js`
Referencia: Ver método `analyzeDisease()`

### Quiero Agregar un Nuevo Endpoint
→ Crear: `BACKEND/routes/[modulo].js` + `BACKEND/controllers/[modulo].controller.js`
Referencia: Ver `BACKEND/routes/diagnostics.js`

### Quiero Cambiar el Análisis de Enfermedades
→ Editar: `CORE/epidemiology/disease.service.js`
Referencia: Ver método `validateDiseaseData()`

### Quiero Crear un Nuevo Componente Angular
→ Crear: `FRONTEND/src/app/pages/[componente].component.ts`
Referencia: Ver `FRONTEND/src/app/pages/diagnostics.component.ts`

### Quiero Entender el Flujo de un Diagnóstico
→ Leer: 
1. `QUICK_REFERENCE.md` - Flujo visual
2. `ARCHITECTURE.md` - Flujo detallado
3. `BACKEND/controllers/diagnostics.controller.js` - Código

---

## 🔍 Búsqueda Rápida por Tema

### Regla de 6 Casos en 60 Días
Archivo: `CORE/epidemiology/outbreak.analyzer.js`
Método: `analyzeDisease()`

### Validación de Enfermedades
Archivo: `CORE/epidemiology/disease.service.js`
Método: `validateDiseaseData()`

### Comparación de Epidemiologías
Archivo: `CORE/epidemiology/epidemic.comparator.js`
Método: `compareDisease()`

### Endpoints REST
Archivo: `BACKEND/routes/diagnostics.js`
7 endpoints disponibles

### Autenticación
Archivo: `BACKEND/controllers/auth.controller.js`
Método: `login()`

### Dashboard Central
Archivo: `BACKEND/controllers/dashboard.controller.js`
Método: `getSummary()`

---

## 📊 Responsabilidades por Archivo

| Archivo | Responsabilidad |
|---------|-----------------|
| `CORE/index.js` | Exporta servicios con inyección de dependencias |
| `CORE/epidemiology/outbreak.analyzer.js` | Análisis de brotes (CORAZÓN del sistema) |
| `CORE/epidemiology/disease.service.js` | Lógica y validación de enfermedades |
| `CORE/epidemiology/epidemic.comparator.js` | Comparaciones y reportes epidemiológicos |
| `BACKEND/server.js` | Configuración Express y rutas principales |
| `BACKEND/controllers/diagnostics.controller.js` | Orquesta CRUD + delega CORE |
| `BACKEND/controllers/dashboard.controller.js` | Agregador de datos + epidemiología |
| `BACKEND/routes/diagnostics.js` | Endpoints de diagnósticos |
| `FRONTEND/src/app/core/api.service.ts` | Cliente HTTP |
| `FRONTEND/src/app/core/diagnosis.service.ts` | Servicio de diagnósticos |

---

## 🔗 Flujos Clave

### Registrar Diagnóstico
```
Frontend (POST)
  ↓
Backend Controller (validar)
  ↓
Backend CRUD (Diagnosis.create)
  ↓
CORE OutbreakAnalyzer (analizar)
  ↓
Backend Response (con alerta si aplica)
  ↓
Frontend (renderiza alerta)
```

### Generar Reporte
```
Frontend (GET /report/epidemic)
  ↓
Backend Controller
  ↓
CORE EpidemicComparator (generateEpidemicReport)
  ↓
Response (clasificación + recomendaciones)
  ↓
Frontend (renderiza reporte)
```

---

## 🚀 Comandos Básicos

```bash
# Instalar
npm install

# Iniciar Backend
npm run api

# Iniciar Frontend
npm start

# Compilar producción
npm run build

# Validar código
node -c CORE/index.js
node -c BACKEND/server.js
```

---

## 📝 Guía de Lectura Recomendada

### Para Backend Developers
1. Leer: `QUICK_REFERENCE.md` (5 min)
2. Leer: `BACKEND/controllers/diagnostics.controller.js` (10 min)
3. Leer: `CORE/epidemiology/outbreak.analyzer.js` (15 min)
4. Leer: `ARCHITECTURE.md` sección "Flujo de Datos" (10 min)

### Para Frontend Developers  
1. Leer: `QUICK_REFERENCE.md` (5 min)
2. Leer: `FRONTEND/src/app/core/diagnosis.service.ts` (10 min)
3. Leer: `FRONTEND/src/app/pages/diagnostics.component.ts` (15 min)
4. Ver: `ARCHITECTURE.md` sección "FRONTEND" (10 min)

### Para Entender el Negocio
1. Leer: `PROJECT_SUMMARY.md` (10 min)
2. Leer: `ARCHITECTURE.md` sección "Regla de Negocio" (5 min)
3. Explorar: `CORE/epidemiology/outbreak.analyzer.js` (20 min)

---

## ✅ Lista de Verificación para Nuevos Desarrolladores

- [ ] He leído `QUICK_REFERENCE.md`
- [ ] He leído `ARCHITECTURE.md`
- [ ] Entiendo dónde va la lógica de negocio (CORE)
- [ ] Entiendo dónde va la lógica HTTP (BACKEND)
- [ ] Entiendo dónde va la presentación (FRONTEND)
- [ ] He ejecutado `npm install`
- [ ] He iniciado Backend exitosamente
- [ ] He iniciado Frontend exitosamente
- [ ] He explorado la estructura de carpetas
- [ ] He leído el archivo del controlador relevante

---

## 🎓 Conceptos Clave

### Inyección de Dependencias
Ver: `CORE/index.js`
Razón: Facilita testing y cambios de dependencias

### Pattern Repositorio
Ver: `CORE/repositories/diagnosis.repository.js`
Razón: Abstrae la BD, facilita cambios

### Controllers Simples
Ver: `BACKEND/controllers/diagnostics.controller.js`
Razón: Solo orquestan, lógica está en CORE

### Servicios Agnósticos
Ver: `CORE/epidemiology/outbreak.analyzer.js`
Razón: Reutilizables en cualquier contexto

---

## 🔗 Enlaces Rápidos

- **Lógica de Brotes**: `CORE/epidemiology/outbreak.analyzer.js` (línea 30-100)
- **Endpoints HTTP**: `BACKEND/routes/` (ver todos los archivos)
- **Componentes UI**: `FRONTEND/src/app/pages/` (ver todos los archivos)
- **Modelos BD**: `BACKEND/models/` (ver todos los archivos)

---

## 💬 Preguntas Frecuentes

**P: ¿Dónde agrego la lógica de epidemiología?**
R: `CORE/epidemiology/outbreak.analyzer.js`

**P: ¿Dónde agrego un nuevo endpoint?**
R: `BACKEND/routes/[modulo].js` + `BACKEND/controllers/[modulo].controller.js`

**P: ¿Puedo mover código entre CORE y BACKEND?**
R: Sí, pero recuerda: CORE = lógica pura, BACKEND = HTTP

**P: ¿Cómo testeo CORE?**
R: Mock los repositories, instancia el servicio, llama métodos

**P: ¿Es seguro cambiar el nombre de un servicio?**
R: Sí, pero actualiza imports en `CORE/index.js` y controllers

---

## 📞 Soporte

Para dudas sobre:
- **Arquitectura**: Leer `ARCHITECTURE.md`
- **Flujos**: Leer `QUICK_REFERENCE.md`
- **Cambios**: Leer `PROJECT_SUMMARY.md`
- **Específico**: Explorar el archivo correspondiente

---

**Última actualización**: 2025-05-23
**Versión**: 1.0 - Reorganizado
**Estado**: ✅ Producción-Ready
